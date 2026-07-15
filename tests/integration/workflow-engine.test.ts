import {
  ActorKind,
  createPrismaClient,
  RotationType,
  Severity,
  WorkflowStatus,
  type PrismaClient
} from "../../packages/db/src/index.js";
import { generateRoutingKey } from "../../packages/db/src/routing-keys.js";
import { triggerIncident } from "../../packages/domain/src/index.js";
import {
  dispatchIncidentWorkflow,
  evaluateIncidentWake,
  reconcileIncidentWorkflows,
  type IncidentWorkflowInput,
  type IncidentWorkflowStarter
} from "../../packages/workflows/src/index.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeDatabase = testDatabaseUrl ? describe : describe.skip;
const triggeredAt = new Date("2026-01-05T10:00:00.000Z");

describeDatabase("durable incident workflow engine", () => {
  let prisma: PrismaClient;
  let serviceId: string;
  let runSequence = 0;
  const workingStarter: IncidentWorkflowStarter = {
    startIncidentGeneration() {
      runSequence += 1;
      return Promise.resolve({ runId: `durable-run-${runSequence}` });
    }
  };

  beforeAll(async () => {
    prisma = createPrismaClient(testDatabaseUrl, "pg");
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User", "Team", "OutboxEvent", "WorkflowRun", "SlackInteractionReceipt", "VerificationToken" CASCADE'
    );

    const primary = await prisma.user.create({
      data: {
        email: "workflow-primary@example.com",
        name: "Workflow Primary",
        timezone: "UTC"
      }
    });
    const backup = await prisma.user.create({
      data: {
        email: "workflow-backup@example.com",
        name: "Workflow Backup",
        timezone: "UTC"
      }
    });
    const team = await prisma.team.create({
      data: {
        name: "Workflow Team",
        slug: "workflow-team"
      }
    });
    const schedule = await prisma.schedule.create({
      data: {
        name: "Workflow Schedule",
        slug: "workflow-schedule",
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
        name: "Workflow Policy",
        slug: "workflow-policy",
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
        name: "Workflow Service",
        routingKeyHash: routingKey.hash,
        routingKeyPrefix: routingKey.prefix,
        slug: "workflow-service",
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
      dedupKey: `workflow-${suffix}`,
      idempotencyKey: `workflow-trigger:${suffix}`,
      now: triggeredAt,
      payload: { source: "workflow-test" },
      requestId: `workflow-request:${suffix}`,
      serviceId,
      severity: Severity.CRITICAL,
      source: "workflow-test",
      summary: `Workflow ${suffix}`
    });
  }

  it("persists a sleep and advances exactly once after a client restart", async () => {
    const triggered = await trigger("restart");
    const input: IncidentWorkflowInput = {
      generation: triggered.incident.escalationGeneration,
      incidentId: triggered.incident.id
    };
    await dispatchIncidentWorkflow(prisma, workingStarter, input);

    const sleeping = await evaluateIncidentWake(
      prisma,
      input,
      new Date("2026-01-05T10:01:00.000Z")
    );
    expect(sleeping).toEqual({
      done: false,
      nextGeneration: null,
      sleepUntil: new Date("2026-01-05T10:05:00.000Z")
    });

    await prisma.$disconnect();
    prisma = createPrismaClient(testDatabaseUrl, "pg");

    const advanced = await evaluateIncidentWake(
      prisma,
      input,
      new Date("2026-01-05T10:05:01.000Z")
    );
    expect(advanced).toEqual({
      done: true,
      nextGeneration: 2,
      sleepUntil: null
    });

    const incident = await prisma.incident.findUniqueOrThrow({
      where: { id: triggered.incident.id }
    });
    expect(incident.currentEscalationPosition).toBe(1);
    expect(incident.escalationGeneration).toBe(2);

    const staleReplay = await evaluateIncidentWake(
      prisma,
      input,
      new Date("2026-01-05T10:06:00.000Z")
    );
    expect(staleReplay.nextGeneration).toBeNull();
    expect(
      await prisma.incidentTimelineEntry.count({
        where: {
          incidentId: incident.id,
          type: "ESCALATION_ADVANCED"
        }
      })
    ).toBe(1);
  });

  it("records failed starts and reconciliation repairs them", async () => {
    const triggered = await trigger("repair");
    const input: IncidentWorkflowInput = {
      generation: triggered.incident.escalationGeneration,
      incidentId: triggered.incident.id
    };
    const failingStarter: IncidentWorkflowStarter = {
      startIncidentGeneration() {
        return Promise.reject(new Error("simulated workflow outage"));
      }
    };

    await expect(
      dispatchIncidentWorkflow(prisma, failingStarter, input)
    ).rejects.toThrow("simulated workflow outage");

    await expect(
      prisma.workflowRun.findUniqueOrThrow({
        where: {
          logicalKey: `incident:${input.incidentId}:generation:${input.generation}`
        }
      })
    ).resolves.toMatchObject({
      lastError: "simulated workflow outage",
      status: WorkflowStatus.FAILED
    });

    const reconciled = await reconcileIncidentWorkflows(prisma, workingStarter);
    expect(reconciled.failed).toBe(0);
    expect(reconciled.started).toBeGreaterThanOrEqual(1);

    await expect(
      prisma.workflowRun.findUniqueOrThrow({
        where: {
          logicalKey: `incident:${input.incidentId}:generation:${input.generation}`
        }
      })
    ).resolves.toMatchObject({
      lastError: null,
      status: WorkflowStatus.RUNNING
    });
  });
});
