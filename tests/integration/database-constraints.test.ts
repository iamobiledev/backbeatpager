import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createPrismaClient } from "../../packages/db/src/client.js";
import {
  ActorKind,
  IncidentState,
  RotationType,
  Severity,
  TimelineEventType,
  type PrismaClient
} from "../../packages/db/src/generated/client.js";
import { generateRoutingKey } from "../../packages/db/src/routing-keys.js";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeDatabase = testDatabaseUrl ? describe : describe.skip;

describeDatabase("database domain constraints", () => {
  let prisma: PrismaClient;
  let teamId: string;
  let userId: string;
  let scheduleId: string;
  let policyId: string;
  let serviceId: string;

  beforeAll(async () => {
    prisma = createPrismaClient(testDatabaseUrl, "pg");
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User", "Team", "OutboxEvent", "WorkflowRun", "SlackInteractionReceipt", "VerificationToken" CASCADE'
    );

    const user = await prisma.user.create({
      data: {
        email: "constraint-test@example.com",
        name: "Constraint Test",
        timezone: "UTC"
      }
    });
    userId = user.id;

    const team = await prisma.team.create({
      data: {
        name: "Constraint Team",
        slug: "constraint-team"
      }
    });
    teamId = team.id;

    const schedule = await prisma.schedule.create({
      data: {
        name: "Constraint Schedule",
        slug: "constraint-schedule",
        teamId,
        timezone: "UTC",
        layers: {
          create: {
            anchorInstant: new Date("2026-01-01T09:00:00.000Z"),
            anchorLocalDate: new Date("2026-01-01T00:00:00.000Z"),
            handoffLocalTime: "09:00",
            name: "Primary",
            position: 0,
            rotationType: RotationType.WEEKLY,
            participants: {
              create: { position: 0, userId }
            }
          }
        }
      }
    });
    scheduleId = schedule.id;

    const policy = await prisma.escalationPolicy.create({
      data: {
        name: "Constraint Policy",
        slug: "constraint-policy",
        teamId,
        steps: {
          create: {
            position: 0,
            timeoutMinutes: 5,
            targets: {
              create: { position: 0, scheduleId }
            }
          }
        }
      }
    });
    policyId = policy.id;

    const routingKey = await generateRoutingKey();
    const service = await prisma.service.create({
      data: {
        escalationPolicyId: policyId,
        name: "Constraint Service",
        routingKeyHash: routingKey.hash,
        routingKeyPrefix: routingKey.prefix,
        slug: "constraint-service",
        teamId
      }
    });
    serviceId = service.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("allows only one open incident per service and dedup key", async () => {
    const incident = await prisma.incident.create({
      data: {
        dedupKey: "same-alert",
        serviceId,
        severity: Severity.CRITICAL,
        source: "constraint-test",
        state: IncidentState.TRIGGERED,
        summary: "First open incident",
        timelineEntries: {
          create: {
            actorKind: ActorKind.SYSTEM,
            message: "Created by constraint test",
            type: TimelineEventType.INCIDENT_TRIGGERED
          }
        }
      }
    });

    await expect(
      prisma.incident.create({
        data: {
          dedupKey: "same-alert",
          serviceId,
          severity: Severity.CRITICAL,
          source: "constraint-test",
          state: IncidentState.ACKNOWLEDGED,
          summary: "Second open incident"
        }
      })
    ).rejects.toThrow();

    await prisma.incident.update({
      where: { id: incident.id },
      data: {
        resolvedAt: new Date(),
        state: IncidentState.RESOLVED
      }
    });

    await expect(
      prisma.incident.create({
        data: {
          dedupKey: "same-alert",
          serviceId,
          severity: Severity.WARNING,
          source: "constraint-test",
          summary: "New incident after resolution"
        }
      })
    ).resolves.toMatchObject({ dedupKey: "same-alert" });
  });

  it("rejects escalation targets without exactly one destination", async () => {
    const step = await prisma.escalationStep.create({
      data: {
        policyId,
        position: 10,
        timeoutMinutes: 5
      }
    });

    await expect(
      prisma.escalationTarget.create({
        data: {
          position: 0,
          stepId: step.id
        }
      })
    ).rejects.toThrow();
  });

  it("rejects invalid override ranges", async () => {
    await expect(
      prisma.scheduleOverride.create({
        data: {
          endsAt: new Date("2026-02-01T10:00:00.000Z"),
          replacementUserId: userId,
          scheduleId,
          startsAt: new Date("2026-02-01T11:00:00.000Z")
        }
      })
    ).rejects.toThrow();
  });

  it("rejects duplicate ordering within an escalation policy", async () => {
    await expect(
      prisma.escalationStep.create({
        data: {
          policyId,
          position: 0,
          timeoutMinutes: 5
        }
      })
    ).rejects.toThrow();
  });
});
