import {
  ActorKind,
  NotificationStatus,
  RotationType,
  Severity,
  type PrismaClient
} from "../../packages/db/src/index.js";
import { createPrismaClient } from "../../packages/db/src/client.js";
import { generateRoutingKey } from "../../packages/db/src/routing-keys.js";
import {
  acknowledgeIncident,
  triggerIncident
} from "../../packages/domain/src/index.js";
import {
  deliverIncidentGeneration,
  type EmailApi,
  type EmailSendInput,
  type NotificationDeliveryDependencies,
  type SlackApi,
  type SlackIncidentMessage,
  type SlackMessageReference
} from "../../packages/notifications/src/index.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeDatabase = testDatabaseUrl ? describe : describe.skip;
const baseTime = new Date("2026-01-05T10:00:00.000Z");

class MockSlackApi implements SlackApi {
  readonly createdChannels: string[] = [];
  readonly invitedUsers: string[][] = [];
  readonly pinned: SlackMessageReference[] = [];
  readonly posted: Array<{
    channelId: string;
    message: SlackIncidentMessage;
    reference: SlackMessageReference;
  }> = [];
  readonly updated: SlackMessageReference[] = [];
  failPosts = false;
  private sequence = 0;

  lookupUserByEmail(email: string): Promise<{ userId: string }> {
    return Promise.resolve({
      userId: `U_${email.split("@")[0]!.toUpperCase()}`
    });
  }

  openConversation(userId: string): Promise<{ channelId: string }> {
    return Promise.resolve({ channelId: `D_${userId}` });
  }

  postMessage(
    channelId: string,
    message: SlackIncidentMessage
  ): Promise<SlackMessageReference> {
    if (this.failPosts) {
      return Promise.reject(new Error("simulated Slack outage"));
    }
    this.sequence += 1;
    const reference = {
      channelId,
      messageTs: `${this.sequence}.000`
    };
    this.posted.push({ channelId, message, reference });
    return Promise.resolve(reference);
  }

  updateMessage(reference: SlackMessageReference): Promise<void> {
    this.updated.push(reference);
    return Promise.resolve();
  }

  createConversation(name: string): Promise<{ channelId: string }> {
    this.createdChannels.push(name);
    return Promise.resolve({ channelId: `C_INC_${this.sequence + 1}` });
  }

  inviteUsers(_channelId: string, userIds: string[]): Promise<void> {
    this.invitedUsers.push(userIds);
    return Promise.resolve();
  }

  pinMessage(channelId: string, messageTs: string): Promise<void> {
    this.pinned.push({ channelId, messageTs });
    return Promise.resolve();
  }
}

class MockEmailApi implements EmailApi {
  readonly sent: EmailSendInput[] = [];

  send(input: EmailSendInput): Promise<{ messageId: string }> {
    this.sent.push(input);
    return Promise.resolve({ messageId: `email-${this.sent.length}` });
  }
}

describeDatabase("incident notification delivery", () => {
  let prisma: PrismaClient;
  let serviceId: string;
  const slack = new MockSlackApi();
  const email = new MockEmailApi();
  const dependencies: NotificationDeliveryDependencies = {
    actionSecret: "test-slack-action-secret",
    email,
    emailFrom: "Pager <pager@example.com>",
    slack,
    webBaseUrl: "https://pager.example.com"
  };

  beforeAll(async () => {
    prisma = createPrismaClient(testDatabaseUrl, "pg");
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User", "Team", "OutboxEvent", "WorkflowRun", "SlackInteractionReceipt", "VerificationToken" CASCADE'
    );

    const primary = await prisma.user.create({
      data: {
        email: "notify-primary@example.com",
        name: "Notify Primary",
        notificationPreferences: {
          email: true,
          slack: true
        },
        timezone: "UTC"
      }
    });
    const backup = await prisma.user.create({
      data: {
        email: "notify-backup@example.com",
        name: "Notify Backup",
        timezone: "UTC"
      }
    });
    const team = await prisma.team.create({
      data: {
        name: "Notify Team",
        slackChannelId: "C_TEAM",
        slug: "notify-team",
        memberships: {
          create: [{ userId: primary.id }, { userId: backup.id }]
        }
      }
    });
    const schedule = await prisma.schedule.create({
      data: {
        name: "Notify Schedule",
        slug: "notify-schedule",
        teamId: team.id,
        timezone: "UTC",
        layers: {
          create: {
            anchorInstant: new Date("2026-01-05T09:00:00.000Z"),
            anchorLocalDate: new Date("2026-01-05T00:00:00.000Z"),
            handoffLocalTime: "09:00",
            name: "Primary",
            position: 0,
            rotationType: RotationType.WEEKLY,
            participants: {
              create: { position: 0, userId: primary.id }
            }
          }
        }
      }
    });
    const policy = await prisma.escalationPolicy.create({
      data: {
        name: "Notify Policy",
        slug: "notify-policy",
        teamId: team.id,
        steps: {
          create: {
            position: 0,
            timeoutMinutes: 10,
            targets: {
              create: { position: 0, scheduleId: schedule.id }
            }
          }
        }
      }
    });
    const routingKey = await generateRoutingKey();
    const service = await prisma.service.create({
      data: {
        autoCreateIncidentChannel: true,
        criticalChannelThresholdMinutes: 1,
        escalationPolicyId: policy.id,
        name: "Notify Service",
        nagIntervals: { CRITICAL: 5 },
        routingKeyHash: routingKey.hash,
        routingKeyPrefix: routingKey.prefix,
        slackChannelId: "C_SERVICE",
        slug: "notify-service",
        teamId: team.id
      }
    });
    serviceId = service.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function trigger(suffix: string) {
    return triggerIncident(prisma, {
      actor: { kind: ActorKind.SYSTEM },
      dedupKey: `notify-${suffix}`,
      idempotencyKey: `notify-trigger:${suffix}`,
      now: baseTime,
      payload: { test: suffix },
      requestId: `notify-request:${suffix}`,
      serviceId,
      severity: Severity.CRITICAL,
      source: "notification-test",
      summary: `Notification ${suffix}`
    });
  }

  it("maps users, pages Slack and email once, and updates messages on ack", async () => {
    const triggered = await trigger("initial");
    const first = await deliverIncidentGeneration(
      prisma,
      dependencies,
      triggered.incident.id,
      triggered.incident.escalationGeneration,
      baseTime
    );

    expect(first).toMatchObject({
      emailFailed: 0,
      emailSent: 1,
      slackFailed: 0,
      slackSent: 2
    });
    expect(slack.posted).toHaveLength(2);
    expect(email.sent).toHaveLength(1);
    expect(
      await prisma.user.findFirstOrThrow({
        where: { email: "notify-primary@example.com" }
      })
    ).toMatchObject({ slackUserId: "U_NOTIFY-PRIMARY" });

    await deliverIncidentGeneration(
      prisma,
      dependencies,
      triggered.incident.id,
      triggered.incident.escalationGeneration,
      baseTime
    );
    expect(slack.posted).toHaveLength(2);
    expect(email.sent).toHaveLength(1);

    const acknowledged = await acknowledgeIncident(prisma, {
      actor: { kind: ActorKind.SYSTEM },
      idempotencyKey: "notify-ack:initial",
      now: new Date("2026-01-05T10:00:30.000Z"),
      reference: { incidentId: triggered.incident.id }
    });
    await deliverIncidentGeneration(
      prisma,
      dependencies,
      triggered.incident.id,
      acknowledged.incident.escalationGeneration,
      new Date("2026-01-05T10:00:30.000Z")
    );
    expect(slack.updated.length).toBeGreaterThanOrEqual(2);
  });

  it("sends a nag and creates and pins a critical incident channel", async () => {
    const triggered = await trigger("nag-channel");
    await deliverIncidentGeneration(
      prisma,
      dependencies,
      triggered.incident.id,
      triggered.incident.escalationGeneration,
      baseTime
    );
    const postsAfterInitial = slack.posted.length;

    await deliverIncidentGeneration(
      prisma,
      dependencies,
      triggered.incident.id,
      triggered.incident.escalationGeneration,
      new Date("2026-01-05T10:05:01.000Z")
    );

    expect(slack.posted.length).toBeGreaterThan(postsAfterInitial);
    expect(slack.createdChannels).toHaveLength(1);
    expect(slack.invitedUsers[0]).toEqual(
      expect.arrayContaining(["U_NOTIFY-PRIMARY", "U_NOTIFY-BACKUP"])
    );
    expect(slack.pinned).toHaveLength(1);
    const incident = await prisma.incident.findUniqueOrThrow({
      where: { id: triggered.incident.id }
    });
    expect(incident.incidentChannelDeadline).toBeNull();
    expect(incident.incidentSlackChannelId).toMatch(/^C_INC_/);
  });

  it("records terminal Slack failures without dropping email delivery", async () => {
    const triggered = await trigger("failure");
    slack.failPosts = true;

    const delivered = await deliverIncidentGeneration(
      prisma,
      dependencies,
      triggered.incident.id,
      triggered.incident.escalationGeneration,
      baseTime
    );
    slack.failPosts = false;

    expect(delivered.slackFailed).toBeGreaterThanOrEqual(1);
    expect(delivered.emailSent).toBe(1);
    expect(
      await prisma.notificationLog.count({
        where: {
          incidentId: triggered.incident.id,
          status: NotificationStatus.FAILED
        }
      })
    ).toBeGreaterThanOrEqual(1);
    expect(
      await prisma.incidentTimelineEntry.count({
        where: {
          incidentId: triggered.incident.id,
          type: "NOTIFICATION_FAILED"
        }
      })
    ).toBeGreaterThanOrEqual(1);
  });
});
