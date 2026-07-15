import {
  IncidentState,
  Severity,
  type PrismaClient
} from "../../packages/db/src/index.js";
import { createPrismaClient } from "../../packages/db/src/client.js";
import { generateRoutingKey } from "../../packages/db/src/routing-keys.js";
import { getIncidentAnalytics } from "../../packages/domain/src/analytics.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeDatabase = testDatabaseUrl ? describe : describe.skip;

describeDatabase("incident analytics", () => {
  let prisma: PrismaClient;
  let teamId: string;

  beforeAll(async () => {
    prisma = createPrismaClient(testDatabaseUrl, "pg");
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User", "Team", "OutboxEvent", "WorkflowRun", "SlackInteractionReceipt", "VerificationToken" CASCADE'
    );
    const team = await prisma.team.create({
      data: { name: "Analytics Team", slug: "analytics-team" }
    });
    teamId = team.id;
    const policy = await prisma.escalationPolicy.create({
      data: {
        name: "Analytics Policy",
        slug: "analytics-policy",
        teamId: team.id,
        steps: {
          create: {
            position: 0,
            timeoutMinutes: 5,
            targets: {
              create: { position: 0, teamId: team.id }
            }
          }
        }
      }
    });
    const key = await generateRoutingKey();
    const service = await prisma.service.create({
      data: {
        escalationPolicyId: policy.id,
        name: "Analytics Service",
        routingKeyHash: key.hash,
        routingKeyPrefix: key.prefix,
        slug: "analytics-service",
        teamId: team.id
      }
    });
    const alertOne = await prisma.alert.create({
      data: {
        dedupKey: "analytics-one",
        latestPayload: {},
        occurrenceCount: 3,
        serviceId: service.id,
        severity: Severity.CRITICAL,
        source: "analytics",
        status: "RESOLVED"
      }
    });
    const alertTwo = await prisma.alert.create({
      data: {
        dedupKey: "analytics-two",
        latestPayload: {},
        occurrenceCount: 1,
        serviceId: service.id,
        severity: Severity.WARNING,
        source: "analytics",
        status: "TRIGGERED"
      }
    });
    const openedOne = new Date("2026-01-02T10:00:00.000Z");
    await prisma.incident.create({
      data: {
        acknowledgedAt: new Date(openedOne.getTime() + 5 * 60_000),
        alerts: { create: { alertId: alertOne.id } },
        dedupKey: alertOne.dedupKey,
        openedAt: openedOne,
        resolvedAt: new Date(openedOne.getTime() + 30 * 60_000),
        serviceId: service.id,
        severity: Severity.CRITICAL,
        source: "analytics",
        state: IncidentState.RESOLVED,
        summary: "Resolved analytics incident"
      }
    });
    await prisma.incident.create({
      data: {
        alerts: { create: { alertId: alertTwo.id } },
        dedupKey: alertTwo.dedupKey,
        openedAt: new Date("2026-01-03T10:00:00.000Z"),
        serviceId: service.id,
        severity: Severity.WARNING,
        source: "analytics",
        state: IncidentState.TRIGGERED,
        summary: "Open analytics incident"
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("computes volume MTTA MTTR and alert noise precisely", async () => {
    const metrics = await getIncidentAnalytics(prisma, {
      from: new Date("2026-01-01T00:00:00.000Z"),
      teamId,
      to: new Date("2026-01-10T00:00:00.000Z")
    });

    expect(metrics).toMatchObject({
      acknowledgedCount: 1,
      alertOccurrences: 4,
      alertsPerIncident: 2,
      incidentCount: 2,
      mttaSeconds: 300,
      mttrSeconds: 1800,
      openCount: 1,
      resolvedCount: 1,
      severity: {
        critical: 1,
        info: 0,
        warning: 1
      }
    });
    expect(metrics.services[0]).toMatchObject({
      alertOccurrences: 4,
      incidentCount: 2,
      serviceName: "Analytics Service"
    });
    expect(metrics.incidentsByDay).toEqual([
      { count: 1, day: "2026-01-02" },
      { count: 1, day: "2026-01-03" }
    ]);
  });

  it("returns explicit zero and null metrics for an empty range", async () => {
    const metrics = await getIncidentAnalytics(prisma, {
      from: new Date("2025-01-01T00:00:00.000Z"),
      to: new Date("2025-01-02T00:00:00.000Z")
    });

    expect(metrics.incidentCount).toBe(0);
    expect(metrics.alertsPerIncident).toBe(0);
    expect(metrics.mttaSeconds).toBeNull();
    expect(metrics.mttrSeconds).toBeNull();
  });
});
