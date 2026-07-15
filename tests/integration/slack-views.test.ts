import {
  IncidentState,
  RotationType,
  Severity,
  type PrismaClient
} from "../../packages/db/src/index.js";
import { createPrismaClient } from "../../packages/db/src/client.js";
import { generateRoutingKey } from "../../packages/db/src/routing-keys.js";
import {
  createOnCallOverride,
  publishAppHomeForSlackUser
} from "../../apps/api/src/slack/phase4-listeners.js";
import type { SlackViewClient } from "../../apps/api/src/slack/phase4-listeners.js";
import {
  buildAppHomeView,
  buildIncidentListBlocks,
  getOnCallSchedules,
  renderOnCallBlocks
} from "../../apps/api/src/slack/views.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeDatabase = testDatabaseUrl ? describe : describe.skip;
const now = new Date("2026-01-05T10:00:00.000Z");

describeDatabase("Slack on-call and Home views", () => {
  let prisma: PrismaClient;
  let aliceId: string;
  let carolId: string;
  let scheduleId: string;

  beforeAll(async () => {
    prisma = createPrismaClient(testDatabaseUrl, "pg");
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User", "Team", "OutboxEvent", "WorkflowRun", "SlackInteractionReceipt", "VerificationToken" CASCADE'
    );

    const alice = await prisma.user.create({
      data: {
        email: "views-alice@example.com",
        name: "Alice",
        slackUserId: "U_ALICE",
        timezone: "America/New_York"
      }
    });
    aliceId = alice.id;
    const bob = await prisma.user.create({
      data: {
        email: "views-bob@example.com",
        name: "Bob",
        slackUserId: "U_BOB",
        timezone: "UTC"
      }
    });
    const carol = await prisma.user.create({
      data: {
        email: "views-carol@example.com",
        name: "Carol",
        slackUserId: "U_CAROL",
        timezone: "UTC"
      }
    });
    carolId = carol.id;
    const team = await prisma.team.create({
      data: {
        name: "Views Team",
        slug: "views-team",
        memberships: {
          create: [
            { userId: alice.id },
            { userId: bob.id },
            { userId: carol.id }
          ]
        }
      }
    });
    const schedule = await prisma.schedule.create({
      data: {
        name: "Views Primary",
        slug: "views-primary",
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
              create: [
                { position: 0, userId: alice.id },
                { position: 1, userId: bob.id }
              ]
            }
          }
        }
      },
      include: { layers: true }
    });
    scheduleId = schedule.id;
    await prisma.scheduleOverride.create({
      data: {
        endsAt: new Date("2026-01-05T12:00:00.000Z"),
        layerId: schedule.layers[0]!.id,
        replacedUserId: alice.id,
        replacementUserId: carol.id,
        scheduleId: schedule.id,
        startsAt: new Date("2026-01-05T09:30:00.000Z")
      }
    });
    const policy = await prisma.escalationPolicy.create({
      data: {
        name: "Views Policy",
        slug: "views-policy",
        teamId: team.id,
        steps: {
          create: {
            position: 0,
            timeoutMinutes: 5,
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
        escalationPolicyId: policy.id,
        name: "Views Service",
        routingKeyHash: routingKey.hash,
        routingKeyPrefix: routingKey.prefix,
        slug: "views-service",
        teamId: team.id
      }
    });
    await prisma.incident.create({
      data: {
        assigneeId: alice.id,
        dedupKey: "views-open",
        serviceId: service.id,
        severity: Severity.WARNING,
        source: "views-test",
        state: IncidentState.TRIGGERED,
        summary: "Views open incident"
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("shows override coverage now and the base rotation next", async () => {
    const schedules = await getOnCallSchedules(prisma, "views", now);

    expect(schedules).toHaveLength(1);
    expect(schedules[0]?.current).toHaveLength(1);
    expect(schedules[0]?.current[0]?.name).toBe("Carol");
    expect(schedules[0]?.current[0]?.slackUserId).toBe("U_CAROL");
    expect(schedules[0]?.current[0]?.userId).toMatch(/^[0-9a-f-]{36}$/);
    expect(schedules[0]?.next).toEqual([
      {
        name: "Alice",
        slackUserId: "U_ALICE",
        userId: aliceId
      }
    ]);
    expect(schedules[0]?.nextChange?.toISOString()).toBe(
      "2026-01-05T12:00:00.000Z"
    );
    expect(JSON.stringify(renderOnCallBlocks(schedules))).toContain(
      "<@U_CAROL>"
    );
  });

  it("renders personalized shifts and team incidents in App Home", async () => {
    const view = await buildAppHomeView(
      prisma,
      aliceId,
      "https://pager.example.com",
      now
    );
    const serialized = JSON.stringify(view);

    expect(serialized).toContain("Welcome, Alice");
    expect(serialized).toContain("Views Primary");
    expect(serialized).toContain("Views open incident");
    expect(serialized).toContain("https://pager.example.com/schedules");
  });

  it("renders incident list quick actions with signed values", async () => {
    const blocks = await buildIncidentListBlocks(
      prisma,
      "views-action-secret",
      false
    );
    const serialized = JSON.stringify(blocks);

    expect(serialized).toContain("Views open incident");
    expect(serialized).toContain("incident_acknowledge");
    expect(serialized).toContain("incident_resolve");
  });

  it("applies a created override immediately to on-call and Home views", async () => {
    await createOnCallOverride(prisma, {
      createdById: aliceId,
      endsAt: new Date("2026-01-06T12:00:00.000Z"),
      reason: "Slack modal coverage",
      replacementUserId: carolId,
      scheduleId,
      startsAt: new Date("2026-01-06T10:00:00.000Z")
    });

    const overridden = await getOnCallSchedules(
      prisma,
      "views-primary",
      new Date("2026-01-06T10:30:00.000Z")
    );
    expect(overridden[0]?.current[0]?.name).toBe("Carol");

    const home = await buildAppHomeView(
      prisma,
      aliceId,
      undefined,
      new Date("2026-01-06T10:30:00.000Z")
    );
    expect(JSON.stringify(home)).toContain("Views Primary");
  });

  it("publishes App Home with Slack's optimistic view hash", async () => {
    const published: Parameters<SlackViewClient["views"]["publish"]>[0][] = [];
    const client: SlackViewClient = {
      users: {
        info() {
          return Promise.resolve({});
        }
      },
      views: {
        publish(input) {
          published.push(input);
          return Promise.resolve({});
        }
      }
    };

    await publishAppHomeForSlackUser(
      prisma,
      client,
      "U_ALICE",
      "https://pager.example.com",
      "home-view-hash"
    );

    expect(published).toHaveLength(1);
    expect(published[0]?.hash).toBe("home-view-hash");
    expect(published[0]?.user_id).toBe("U_ALICE");
    expect(JSON.stringify(published[0]?.view)).toContain("Welcome, Alice");
  });
});
