import { buildApp } from "../../apps/api/src/app.js";
import {
  createPrismaClient,
  IncidentState,
  RotationType,
  type PrismaClient
} from "../../packages/db/src/index.js";
import { generateRoutingKey } from "../../packages/db/src/routing-keys.js";
import type {
  IncidentWorkflowInput,
  IncidentWorkflowStarter
} from "../../packages/workflows/src/index.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeDatabase = testDatabaseUrl ? describe : describe.skip;

describeDatabase("alert ingestion API", () => {
  let prisma: PrismaClient;
  let routingKey: string;
  let serviceId: string;
  const workflowStarts: IncidentWorkflowInput[] = [];
  let app: ReturnType<typeof buildApp>;

  beforeAll(async () => {
    process.env.CRON_SECRET = "test-cron-secret";
    process.env.WORKFLOW_INTERNAL_SECRET = "test-workflow-secret";
    prisma = createPrismaClient(testDatabaseUrl, "pg");
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User", "Team", "OutboxEvent", "WorkflowRun", "SlackInteractionReceipt", "VerificationToken" CASCADE'
    );

    const primary = await prisma.user.create({
      data: {
        email: "api-primary@example.com",
        name: "API Primary",
        timezone: "UTC"
      }
    });
    const override = await prisma.user.create({
      data: {
        email: "api-override@example.com",
        name: "API Override",
        timezone: "UTC"
      }
    });
    const team = await prisma.team.create({
      data: {
        name: "API Team",
        slug: "api-team",
        memberships: {
          create: [{ userId: primary.id }, { userId: override.id }]
        }
      }
    });
    const schedule = await prisma.schedule.create({
      data: {
        name: "API Schedule",
        slug: "api-schedule",
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
        name: "API Policy",
        slug: "api-policy",
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
    const generated = await generateRoutingKey();
    routingKey = generated.routingKey;
    const service = await prisma.service.create({
      data: {
        escalationPolicyId: policy.id,
        name: "API Service",
        routingKeyHash: generated.hash,
        routingKeyPrefix: generated.prefix,
        slug: "api-service",
        teamId: team.id
      }
    });
    serviceId = service.id;

    const workflowStarter: IncidentWorkflowStarter = {
      startIncidentGeneration(input) {
        workflowStarts.push(input);
        return Promise.resolve({
          runId: `test-run-${workflowStarts.length}`
        });
      }
    };
    app = buildApp({
      alertRoutes: { prisma, workflowStarter }
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    delete process.env.CRON_SECRET;
    delete process.env.WORKFLOW_INTERNAL_SECRET;
  });

  function event(dedupKey: string, eventAction = "trigger") {
    return {
      dedup_key: dedupKey,
      event_action: eventAction,
      payload: {
        custom_details: { environment: "test" },
        severity: "critical",
        source: "api-test",
        summary: `Alert ${dedupKey}`
      },
      routing_key: routingKey
    };
  }

  it("rejects missing or malformed routing keys", async () => {
    const missing = await app.inject({
      method: "POST",
      url: "/api/v1/alerts",
      payload: { ...event("auth"), routing_key: undefined }
    });
    expect(missing.statusCode).toBe(401);

    const malformed = await app.inject({
      method: "POST",
      url: "/api/v1/alerts",
      payload: { ...event("auth"), routing_key: "invalid" }
    });
    expect(malformed.statusCode).toBe(401);
  });

  it("triggers and deduplicates PagerDuty-compatible events", async () => {
    const first = await app.inject({
      method: "POST",
      url: "/api/v1/alerts",
      payload: event("pagerduty-dedup")
    });
    expect(first.statusCode).toBe(202);
    expect(first.json()).toMatchObject({
      dedup_key: "pagerduty-dedup",
      message: "Event processed",
      status: "success"
    });

    const duplicate = await app.inject({
      method: "POST",
      url: "/api/v1/alerts",
      payload: event("pagerduty-dedup")
    });
    expect(duplicate.statusCode).toBe(202);
    expect(duplicate.json()).toMatchObject({
      message: "Event was already processed"
    });
    await expect(
      prisma.incident.count({
        where: {
          dedupKey: "pagerduty-dedup",
          serviceId
        }
      })
    ).resolves.toBe(1);
  });

  it("acknowledges and resolves through events while updating the alert", async () => {
    await app.inject({
      method: "POST",
      url: "/api/v1/alerts",
      payload: event("lifecycle-api")
    });

    const acknowledged = await app.inject({
      method: "POST",
      url: "/api/v1/alerts",
      payload: event("lifecycle-api", "acknowledge")
    });
    expect(acknowledged.statusCode).toBe(202);
    expect(acknowledged.json()).toMatchObject({
      incident: { state: IncidentState.ACKNOWLEDGED }
    });

    const resolved = await app.inject({
      method: "POST",
      url: "/api/v1/alerts",
      payload: event("lifecycle-api", "resolve")
    });
    expect(resolved.statusCode).toBe(202);
    expect(resolved.json()).toMatchObject({
      incident: { state: IncidentState.RESOLVED }
    });

    const alert = await prisma.alert.findUniqueOrThrow({
      where: {
        serviceId_dedupKey: {
          dedupKey: "lifecycle-api",
          serviceId
        }
      },
      include: { occurrences: true }
    });
    expect(alert.status).toBe("RESOLVED");
    expect(alert.occurrences).toHaveLength(3);
  });

  it("adapts generic webhooks", async () => {
    const response = await app.inject({
      headers: { "x-routing-key": routingKey },
      method: "POST",
      url: "/api/v1/integrations/generic",
      payload: {
        dedup_key: "generic-adapter",
        details: { check: "latency" },
        severity: "warning",
        source: "custom-monitor",
        summary: "Latency is high",
        url: "https://monitoring.example.com/alerts/1"
      }
    });

    expect(response.statusCode).toBe(202);
    expect(response.json()).toMatchObject({
      dedup_key: "generic-adapter",
      status: "success"
    });
  });

  it("adapts Alertmanager and Grafana firing and resolved payloads", async () => {
    const alertmanager = await app.inject({
      headers: { authorization: `Bearer ${routingKey}` },
      method: "POST",
      url: "/api/v1/integrations/alertmanager",
      payload: {
        alerts: [
          {
            annotations: { summary: "Instance down" },
            fingerprint: "alertmanager-fingerprint",
            generatorURL: "https://prometheus.example.com/graph",
            labels: {
              alertname: "InstanceDown",
              instance: "api-1",
              severity: "critical"
            },
            status: "firing"
          }
        ],
        commonAnnotations: {},
        commonLabels: {},
        status: "firing"
      }
    });
    expect(alertmanager.statusCode).toBe(202);
    expect(alertmanager.json()).toMatchObject({
      results: [{ dedup_key: "alertmanager-fingerprint" }]
    });

    const grafanaFiring = {
      alerts: [
        {
          annotations: { summary: "Checkout errors" },
          fingerprint: "grafana-fingerprint",
          labels: {
            alertname: "CheckoutErrors",
            severity: "error"
          },
          status: "firing"
        }
      ],
      commonAnnotations: {},
      commonLabels: {},
      status: "firing",
      title: "Grafana checkout alert"
    };
    const triggered = await app.inject({
      headers: { "x-routing-key": routingKey },
      method: "POST",
      url: "/api/v1/integrations/grafana",
      payload: grafanaFiring
    });
    expect(triggered.statusCode).toBe(202);

    const resolved = await app.inject({
      headers: { "x-routing-key": routingKey },
      method: "POST",
      url: "/api/v1/integrations/grafana",
      payload: {
        ...grafanaFiring,
        alerts: grafanaFiring.alerts.map((alert) => ({
          ...alert,
          status: "resolved"
        })),
        status: "resolved"
      }
    });
    expect(resolved.statusCode).toBe(202);
    expect(resolved.json()).toMatchObject({
      results: [{ incident: { state: IncidentState.RESOLVED } }]
    });
  });

  it("reports database readiness", async () => {
    const response = await app.inject({ method: "GET", url: "/ready" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      database: "connected",
      status: "ready"
    });
    expect(workflowStarts.length).toBeGreaterThan(0);
  });

  it("protects Workflow runtime and reconciliation routes", async () => {
    const unauthorized = await app.inject({
      method: "POST",
      url: "/internal/workflows/wake",
      payload: {
        generation: 1,
        incidentId: "00000000-0000-0000-0000-000000000000"
      }
    });
    expect(unauthorized.statusCode).toBe(401);

    const invalid = await app.inject({
      headers: { authorization: "Bearer test-workflow-secret" },
      method: "POST",
      url: "/internal/workflows/wake",
      payload: { generation: -1, incidentId: "invalid" }
    });
    expect(invalid.statusCode).toBe(400);

    const reconciled = await app.inject({
      headers: { authorization: "Bearer test-cron-secret" },
      method: "POST",
      url: "/internal/reconcile"
    });
    expect(reconciled.statusCode).toBe(200);
    expect(reconciled.json()).toMatchObject({ status: "success" });
  });
});
