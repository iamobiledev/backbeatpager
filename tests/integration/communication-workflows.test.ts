import {
  ActorKind,
  IncidentState,
  RotationType,
  Severity,
  type PrismaClient
} from "../../packages/db/src/index.js";
import { createPrismaClient } from "../../packages/db/src/client.js";
import { generateRoutingKey } from "../../packages/db/src/routing-keys.js";
import type {
  SlackApi,
  SlackIncidentMessage,
  SlackMessageReference
} from "../../packages/notifications/src/index.js";
import {
  dispatchHandoffWorkflow,
  processDigestWake,
  processHandoffWake,
  reconcileCommunicationWorkflows,
  type CommunicationWorkflowStarter,
  type DigestWorkflowInput,
  type HandoffWorkflowInput
} from "../../packages/workflows/src/index.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeDatabase = testDatabaseUrl ? describe : describe.skip;

class CommunicationSlack implements SlackApi {
  readonly messages: Array<{ channelId: string; text: string }> = [];

  lookupUserByEmail(): Promise<null> {
    return Promise.resolve(null);
  }
  openConversation(): Promise<{ channelId: string }> {
    return Promise.resolve({ channelId: "D_UNUSED" });
  }
  postMessage(
    channelId: string,
    message: SlackIncidentMessage
  ): Promise<SlackMessageReference> {
    this.messages.push({ channelId, text: message.text });
    return Promise.resolve({
      channelId,
      messageTs: `${this.messages.length}.000`
    });
  }
  updateMessage(): Promise<void> {
    return Promise.resolve();
  }
  createConversation(): Promise<{ channelId: string }> {
    return Promise.resolve({ channelId: "C_UNUSED" });
  }
  inviteUsers(): Promise<void> {
    return Promise.resolve();
  }
  pinMessage(): Promise<void> {
    return Promise.resolve();
  }
}

describeDatabase("handoff and digest workflows", () => {
  let prisma: PrismaClient;
  let teamId: string;
  let scheduleId: string;
  let aliceId: string;
  let bobId: string;
  const slack = new CommunicationSlack();
  const handoffs: HandoffWorkflowInput[] = [];
  const digests: DigestWorkflowInput[] = [];
  const starter: CommunicationWorkflowStarter = {
    startDigest(input) {
      digests.push(input);
      return Promise.resolve({ runId: `digest-${digests.length}` });
    },
    startHandoff(input) {
      handoffs.push(input);
      return Promise.resolve({ runId: `handoff-${handoffs.length}` });
    }
  };

  beforeAll(async () => {
    prisma = createPrismaClient(testDatabaseUrl, "pg");
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User", "Team", "OutboxEvent", "WorkflowRun", "SlackInteractionReceipt", "VerificationToken" CASCADE'
    );
    const alice = await prisma.user.create({
      data: {
        email: "handoff-alice@example.com",
        name: "Alice",
        slackUserId: "U_ALICE",
        timezone: "UTC"
      }
    });
    const bob = await prisma.user.create({
      data: {
        email: "handoff-bob@example.com",
        name: "Bob",
        slackUserId: "U_BOB",
        timezone: "UTC"
      }
    });
    aliceId = alice.id;
    bobId = bob.id;
    const team = await prisma.team.create({
      data: {
        digestDayOfWeek: 1,
        digestEnabled: true,
        digestLocalTime: "09:00",
        handoffMessagesEnabled: true,
        name: "Communications Team",
        slackChannelId: "C_TEAM",
        slug: "communications-team",
        timezone: "UTC"
      }
    });
    teamId = team.id;
    const schedule = await prisma.schedule.create({
      data: {
        name: "Daily Primary",
        slug: "daily-primary",
        teamId: team.id,
        timezone: "UTC",
        layers: {
          create: {
            anchorInstant: new Date("2026-01-05T09:00:00.000Z"),
            anchorLocalDate: new Date("2026-01-05T00:00:00.000Z"),
            handoffLocalTime: "09:00",
            name: "Primary",
            position: 0,
            rotationType: RotationType.DAILY,
            participants: {
              create: [
                { position: 0, userId: alice.id },
                { position: 1, userId: bob.id }
              ]
            }
          }
        }
      }
    });
    scheduleId = schedule.id;

    const policy = await prisma.escalationPolicy.create({
      data: {
        name: "Communications Policy",
        slug: "communications-policy",
        teamId: team.id,
        steps: {
          create: {
            position: 0,
            timeoutMinutes: 5,
            targets: { create: { position: 0, teamId: team.id } }
          }
        }
      }
    });
    const key = await generateRoutingKey();
    const service = await prisma.service.create({
      data: {
        escalationPolicyId: policy.id,
        name: "Communications Service",
        routingKeyHash: key.hash,
        routingKeyPrefix: key.prefix,
        slug: "communications-service",
        teamId: team.id
      }
    });
    await prisma.incident.create({
      data: {
        acknowledgedAt: new Date("2026-01-02T10:05:00.000Z"),
        dedupKey: "digest-incident",
        openedAt: new Date("2026-01-02T10:00:00.000Z"),
        resolvedAt: new Date("2026-01-02T10:30:00.000Z"),
        serviceId: service.id,
        severity: Severity.CRITICAL,
        source: "digest-test",
        state: IncidentState.RESOLVED,
        summary: "Digest incident",
        timelineEntries: {
          create: {
            actorKind: ActorKind.SYSTEM,
            message: "Digest test incident",
            type: "INCIDENT_RESOLVED"
          }
        }
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("reconciles and posts a timezone-correct handoff exactly once", async () => {
    const reconciled = await reconcileCommunicationWorkflows(prisma, starter);
    expect(reconciled).toEqual({
      digestsStarted: 1,
      failed: 0,
      handoffsStarted: 1
    });

    const handoff = handoffs[0]!;
    const sleeping = await processHandoffWake(
      prisma,
      { slack },
      handoff,
      new Date("2026-01-05T08:00:00.000Z")
    );
    expect(sleeping).toEqual({
      done: false,
      sleepUntil: "2026-01-05T09:00:00.000Z"
    });

    await processHandoffWake(
      prisma,
      { slack },
      handoff,
      new Date("2026-01-05T09:00:01.000Z")
    );
    expect(slack.messages[0]).toMatchObject({
      channelId: "C_TEAM"
    });
    expect(slack.messages[0]?.text).toContain("<@U_ALICE>");
    expect(slack.messages[0]?.text).toContain("<@U_BOB>");

    await processHandoffWake(
      prisma,
      { slack },
      handoff,
      new Date("2026-01-05T09:00:02.000Z")
    );
    expect(slack.messages).toHaveLength(1);
  });

  it("reschedules immediately when an override changes the rotation", async () => {
    const schedule = await prisma.schedule.findUniqueOrThrow({
      where: { id: scheduleId },
      include: { layers: { include: { participants: true } } }
    });
    const aliceId = schedule.layers[0]!.participants[0]!.userId;
    const bobId = schedule.layers[0]!.participants[1]!.userId;
    await prisma.$transaction([
      prisma.scheduleOverride.create({
        data: {
          endsAt: new Date("2026-01-05T14:00:00.000Z"),
          layerId: schedule.layers[0]!.id,
          replacedUserId: aliceId,
          replacementUserId: bobId,
          scheduleId,
          startsAt: new Date("2026-01-05T12:00:00.000Z")
        }
      }),
      prisma.schedule.update({
        where: { id: scheduleId },
        data: { updatedAt: new Date() }
      })
    ]);
    const updated = await prisma.schedule.findUniqueOrThrow({
      where: { id: scheduleId }
    });
    const input = {
      generation: Math.floor(updated.updatedAt.getTime() / 1000),
      scheduleId
    };
    await dispatchHandoffWorkflow(prisma, starter, input);

    const sleeping = await processHandoffWake(
      prisma,
      { slack },
      input,
      new Date("2026-01-05T10:00:00.000Z")
    );
    expect(sleeping).toEqual({
      done: false,
      sleepUntil: "2026-01-05T12:00:00.000Z"
    });
    await processHandoffWake(
      prisma,
      { slack },
      input,
      new Date("2026-01-05T12:00:01.000Z")
    );
    expect(slack.messages.at(-1)?.text).toContain("<@U_BOB>");
  });

  it("posts a missed weekly digest with known response metrics once", async () => {
    const digest = digests[0]!;
    const sleeping = await processDigestWake(
      prisma,
      { slack, webBaseUrl: "https://pager.example.com" },
      digest,
      new Date("2026-01-05T08:00:00.000Z")
    );
    expect(sleeping).toEqual({
      done: false,
      sleepUntil: "2026-01-05T09:00:00.000Z"
    });

    await processDigestWake(
      prisma,
      { slack, webBaseUrl: "https://pager.example.com" },
      digest,
      new Date("2026-01-07T12:00:00.000Z")
    );
    const digestMessage = slack.messages.find((message) =>
      message.text.includes("Weekly incident digest")
    );
    expect(digestMessage?.text).toContain("1 incidents");
    expect(digestMessage?.text).toContain("MTTA 5m");
    expect(digestMessage?.text).toContain("MTTR 30m");

    const messageCount = slack.messages.length;
    await processDigestWake(
      prisma,
      { slack },
      digest,
      new Date("2026-01-07T12:00:01.000Z")
    );
    expect(slack.messages).toHaveLength(messageCount);
  });

  it("schedules a spring-forward handoff at the first valid instant", async () => {
    const schedule = await prisma.schedule.create({
      data: {
        name: "DST Primary",
        slug: "dst-primary",
        teamId,
        timezone: "America/New_York",
        layers: {
          create: {
            anchorInstant: new Date("2026-03-07T07:30:00.000Z"),
            anchorLocalDate: new Date("2026-03-07T00:00:00.000Z"),
            handoffLocalTime: "02:30",
            name: "Primary",
            position: 0,
            rotationType: RotationType.DAILY,
            participants: {
              create: [
                { position: 0, userId: aliceId },
                { position: 1, userId: bobId }
              ]
            }
          }
        }
      }
    });
    const input = {
      generation: Math.floor(schedule.updatedAt.getTime() / 1000),
      scheduleId: schedule.id
    };
    await dispatchHandoffWorkflow(prisma, starter, input);

    await expect(
      processHandoffWake(
        prisma,
        { slack },
        input,
        new Date("2026-03-08T06:00:00.000Z")
      )
    ).resolves.toEqual({
      done: false,
      sleepUntil: "2026-03-08T07:00:00.000Z"
    });
  });
});
