import {
  ActorKind,
  IncidentState,
  RotationType,
  Severity,
  type PrismaClient
} from "../../packages/db/src/generated/client.js";
import {
  acknowledgeIncident,
  advanceIncidentEscalation,
  expireAcknowledgement,
  resolveIncident,
  snoozeIncident,
  triggerIncident
} from "../../packages/domain/src/index.js";
import type { DomainError } from "../../packages/domain/src/index.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createPrismaClient } from "../../packages/db/src/client.js";
import { generateRoutingKey } from "../../packages/db/src/routing-keys.js";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeDatabase = testDatabaseUrl ? describe : describe.skip;
const baseTime = new Date("2026-01-05T10:00:00.000Z");
const actor = { kind: ActorKind.SYSTEM };

describeDatabase("incident lifecycle", () => {
  let prisma: PrismaClient;
  let serviceId: string;
  let overrideUserId: string;
  let backupUserId: string;

  beforeAll(async () => {
    prisma = createPrismaClient(testDatabaseUrl, "pg");
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User", "Team", "OutboxEvent", "WorkflowRun", "SlackInteractionReceipt", "VerificationToken" CASCADE'
    );

    const primary = await prisma.user.create({
      data: {
        email: "primary-lifecycle@example.com",
        name: "Primary",
        timezone: "UTC"
      }
    });
    const backup = await prisma.user.create({
      data: {
        email: "backup-lifecycle@example.com",
        name: "Backup",
        timezone: "UTC"
      }
    });
    const override = await prisma.user.create({
      data: {
        email: "override-lifecycle@example.com",
        name: "Override",
        timezone: "UTC"
      }
    });
    backupUserId = backup.id;
    overrideUserId = override.id;

    const team = await prisma.team.create({
      data: {
        name: "Lifecycle Team",
        slug: "lifecycle-team",
        memberships: {
          create: [
            { userId: primary.id },
            { userId: backup.id },
            { userId: override.id }
          ]
        }
      }
    });

    const schedule = await prisma.schedule.create({
      data: {
        name: "Lifecycle Schedule",
        slug: "lifecycle-schedule",
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
                { position: 0, userId: primary.id },
                { position: 1, userId: backup.id }
              ]
            }
          }
        }
      },
      include: { layers: true }
    });

    await prisma.scheduleOverride.create({
      data: {
        endsAt: new Date("2026-01-05T12:00:00.000Z"),
        layerId: schedule.layers[0]!.id,
        replacedUserId: primary.id,
        replacementUserId: override.id,
        scheduleId: schedule.id,
        startsAt: new Date("2026-01-05T09:30:00.000Z")
      }
    });

    const policy = await prisma.escalationPolicy.create({
      data: {
        acknowledgementTimeoutMinutes: 1,
        name: "Lifecycle Policy",
        repeatCount: 1,
        slug: "lifecycle-policy",
        teamId: team.id,
        steps: {
          create: [
            {
              position: 0,
              timeoutMinutes: 5,
              targets: {
                create: { position: 0, scheduleId: schedule.id }
              }
            },
            {
              position: 1,
              timeoutMinutes: 10,
              targets: {
                create: { position: 0, userId: backup.id }
              }
            }
          ]
        }
      }
    });

    const routingKey = await generateRoutingKey();
    const service = await prisma.service.create({
      data: {
        escalationPolicyId: policy.id,
        name: "Lifecycle Service",
        routingKeyHash: routingKey.hash,
        routingKeyPrefix: routingKey.prefix,
        slug: "lifecycle-service",
        teamId: team.id
      }
    });
    serviceId = service.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function trigger(dedupKey: string, suffix: string) {
    return triggerIncident(prisma, {
      actor,
      dedupKey,
      idempotencyKey: `trigger:${suffix}`,
      now: baseTime,
      payload: { severity: "critical", summary: suffix },
      requestId: `request:${suffix}`,
      serviceId,
      severity: Severity.CRITICAL,
      source: "lifecycle-test",
      summary: `Incident ${suffix}`
    });
  }

  it("routes a new incident to the active override and deduplicates retriggers", async () => {
    const first = await trigger("override-dedup", "override-first");

    expect(first.changed).toBe(true);
    expect(first.incident.assigneeId).toBe(overrideUserId);
    expect(first.targetUserIds).toEqual([overrideUserId]);
    expect(first.incident.currentEscalationPosition).toBe(0);

    const duplicate = await triggerIncident(prisma, {
      actor,
      dedupKey: "override-dedup",
      idempotencyKey: "trigger:override-second",
      now: new Date(baseTime.getTime() + 30_000),
      payload: { severity: "warning" },
      requestId: "request:override-second",
      serviceId,
      severity: Severity.WARNING,
      source: "lifecycle-test",
      summary: "Updated summary"
    });

    expect(duplicate.incident.id).toBe(first.incident.id);
    await expect(
      prisma.incident.count({
        where: {
          dedupKey: "override-dedup",
          serviceId,
          state: { in: [IncidentState.TRIGGERED, IncidentState.ACKNOWLEDGED] }
        }
      })
    ).resolves.toBe(1);
  });

  it("acknowledges idempotently, cancels deadlines, and resolves", async () => {
    const triggered = await trigger("ack-dedup", "ack");
    const acknowledged = await acknowledgeIncident(prisma, {
      actor,
      idempotencyKey: "ack:ack-dedup",
      now: new Date(baseTime.getTime() + 60_000),
      reference: { incidentId: triggered.incident.id }
    });

    expect(acknowledged.incident.state).toBe(IncidentState.ACKNOWLEDGED);
    expect(acknowledged.incident.escalationDeadline).toBeNull();
    expect(acknowledged.incident.acknowledgementExpiresAt?.toISOString()).toBe(
      "2026-01-05T10:02:00.000Z"
    );

    const duplicate = await acknowledgeIncident(prisma, {
      actor,
      idempotencyKey: "ack:ack-dedup",
      now: new Date(baseTime.getTime() + 90_000),
      reference: { incidentId: triggered.incident.id }
    });
    expect(duplicate.changed).toBe(false);

    const resolved = await resolveIncident(prisma, {
      actor,
      idempotencyKey: "resolve:ack-dedup",
      note: "Recovered",
      now: new Date(baseTime.getTime() + 120_000),
      reference: { incidentId: triggered.incident.id }
    });
    expect(resolved.incident.state).toBe(IncidentState.RESOLVED);
    expect(resolved.incident.resolvedAt?.toISOString()).toBe(
      "2026-01-05T10:02:00.000Z"
    );
  });

  it("advances through steps and repeat loops before exhausting", async () => {
    const triggered = await trigger("escalate-dedup", "escalate");

    const secondStep = await advanceIncidentEscalation(prisma, {
      actor,
      expectedGeneration: 1,
      idempotencyKey: "escalate:step-2",
      now: new Date("2026-01-05T10:06:00.000Z"),
      reference: { incidentId: triggered.incident.id },
      requireDeadline: true
    });
    expect(secondStep.incident.currentEscalationPosition).toBe(1);
    expect(secondStep.incident.assigneeId).toBe(backupUserId);

    const repeated = await advanceIncidentEscalation(prisma, {
      actor,
      expectedGeneration: 2,
      idempotencyKey: "escalate:repeat",
      now: new Date("2026-01-05T10:17:00.000Z"),
      reference: { incidentId: triggered.incident.id },
      requireDeadline: true
    });
    expect(repeated.incident.currentEscalationLoop).toBe(1);
    expect(repeated.incident.currentEscalationPosition).toBe(0);
    expect(repeated.incident.assigneeId).toBe(overrideUserId);

    const repeatedSecond = await advanceIncidentEscalation(prisma, {
      actor,
      expectedGeneration: 3,
      idempotencyKey: "escalate:repeat-step-2",
      now: new Date("2026-01-05T10:23:00.000Z"),
      reference: { incidentId: triggered.incident.id },
      requireDeadline: true
    });
    expect(repeatedSecond.incident.currentEscalationPosition).toBe(1);

    const exhausted = await advanceIncidentEscalation(prisma, {
      actor,
      expectedGeneration: 4,
      idempotencyKey: "escalate:exhausted",
      now: new Date("2026-01-05T10:34:00.000Z"),
      reference: { incidentId: triggered.incident.id },
      requireDeadline: true
    });
    expect(exhausted.incident.escalationDeadline).toBeNull();
    expect(exhausted.targetUserIds).toEqual([]);
  });

  it("re-arms deadlines on snooze and rejects stale timer generations", async () => {
    const triggered = await trigger("snooze-dedup", "snooze");
    const snoozed = await snoozeIncident(
      prisma,
      {
        actor,
        idempotencyKey: "snooze:snooze-dedup",
        now: baseTime,
        reference: { incidentId: triggered.incident.id }
      },
      15
    );

    expect(snoozed.incident.escalationGeneration).toBe(2);
    expect(snoozed.incident.escalationDeadline?.toISOString()).toBe(
      "2026-01-05T10:15:00.000Z"
    );
    expect(snoozed.incident.nagDeadline?.toISOString()).toBe(
      "2026-01-05T10:15:00.000Z"
    );

    await expect(
      advanceIncidentEscalation(prisma, {
        actor,
        expectedGeneration: 1,
        idempotencyKey: "escalate:stale",
        now: new Date("2026-01-05T10:16:00.000Z"),
        reference: { incidentId: triggered.incident.id },
        requireDeadline: true
      })
    ).rejects.toMatchObject({
      code: "STALE_INCIDENT_GENERATION"
    } satisfies Partial<DomainError>);
  });

  it("re-triggers an incident when acknowledgement expires", async () => {
    const triggered = await trigger("expiry-dedup", "expiry");
    const acknowledged = await acknowledgeIncident(prisma, {
      actor,
      idempotencyKey: "ack:expiry",
      now: baseTime,
      reference: { incidentId: triggered.incident.id }
    });

    const expired = await expireAcknowledgement(prisma, {
      actor,
      expectedGeneration: acknowledged.incident.escalationGeneration,
      idempotencyKey: "ack-expired:expiry",
      now: new Date("2026-01-05T10:01:01.000Z"),
      reference: { incidentId: triggered.incident.id }
    });

    expect(expired.changed).toBe(true);
    expect(expired.incident.state).toBe(IncidentState.TRIGGERED);
    expect(expired.incident.assigneeId).toBe(overrideUserId);
    expect(expired.incident.escalationDeadline?.toISOString()).toBe(
      "2026-01-05T10:06:01.000Z"
    );
  });
});
