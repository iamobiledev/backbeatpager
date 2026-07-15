import { createHmac } from "node:crypto";

import {
  ActorKind,
  IncidentState,
  RotationType,
  Severity,
  type PrismaClient
} from "../../packages/db/src/index.js";
import { createPrismaClient } from "../../packages/db/src/client.js";
import { generateRoutingKey } from "../../packages/db/src/routing-keys.js";
import { triggerIncident } from "../../packages/domain/src/index.js";
import { createSlackActionToken } from "../../packages/notifications/src/index.js";
import { processSlackIncidentAction } from "../../apps/api/src/slack/actions.js";
import type { SlackActionError } from "../../apps/api/src/slack/actions.js";
import { buildApp } from "../../apps/api/src/app.js";
import { createSlackBoltRuntime } from "../../apps/api/src/slack/bolt-runtime.js";
import type { SlackActorClient } from "../../apps/api/src/slack/user-mapping.js";
import type {
  IncidentWorkflowInput,
  IncidentWorkflowStarter
} from "../../packages/workflows/src/index.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeDatabase = testDatabaseUrl ? describe : describe.skip;
const actionSecret = "slack-action-test-secret";
const baseTime = new Date("2026-01-05T10:00:00.000Z");

describeDatabase("Slack incident actions", () => {
  let prisma: PrismaClient;
  let serviceId: string;
  let backupUserId: string;
  const workflowStarts: IncidentWorkflowInput[] = [];
  const workflowStarter: IncidentWorkflowStarter = {
    startIncidentGeneration(input) {
      workflowStarts.push(input);
      return Promise.resolve({
        runId: `slack-action-${workflowStarts.length}`
      });
    }
  };
  const emailBySlackId: Record<string, string> = {
    U_ACTOR: "slack-actor@example.com",
    U_BACKUP: "slack-backup@example.com"
  };
  const client: SlackActorClient = {
    users: {
      info({ user }) {
        const email = emailBySlackId[user];
        return Promise.resolve(email ? { user: { profile: { email } } } : {});
      }
    }
  };

  beforeAll(async () => {
    prisma = createPrismaClient(testDatabaseUrl, "pg");
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User", "Team", "OutboxEvent", "WorkflowRun", "SlackInteractionReceipt", "VerificationToken" CASCADE'
    );

    const actor = await prisma.user.create({
      data: {
        email: "slack-actor@example.com",
        name: "Slack Actor",
        timezone: "UTC"
      }
    });
    const backup = await prisma.user.create({
      data: {
        email: "slack-backup@example.com",
        name: "Slack Backup",
        timezone: "UTC"
      }
    });
    backupUserId = backup.id;
    const team = await prisma.team.create({
      data: {
        name: "Slack Action Team",
        slug: "slack-action-team",
        memberships: {
          create: [{ userId: actor.id }, { userId: backup.id }]
        }
      }
    });
    const schedule = await prisma.schedule.create({
      data: {
        name: "Slack Action Schedule",
        slug: "slack-action-schedule",
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
              create: { position: 0, userId: actor.id }
            }
          }
        }
      }
    });
    const policy = await prisma.escalationPolicy.create({
      data: {
        name: "Slack Action Policy",
        slug: "slack-action-policy",
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
        name: "Slack Action Service",
        routingKeyHash: routingKey.hash,
        routingKeyPrefix: routingKey.prefix,
        slug: "slack-action-service",
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
      dedupKey: `slack-action-${suffix}`,
      idempotencyKey: `slack-action-trigger:${suffix}`,
      now: baseTime,
      payload: { test: suffix },
      requestId: `slack-action-request:${suffix}`,
      serviceId,
      severity: Severity.CRITICAL,
      source: "slack-action-test",
      summary: `Slack action ${suffix}`
    });
  }

  it("maps the Slack actor and acknowledges idempotently", async () => {
    const triggered = await trigger("ack");
    const token = createSlackActionToken(
      {
        action: "acknowledge",
        incidentId: triggered.incident.id,
        version: triggered.incident.version
      },
      actionSecret
    );
    const dependencies = {
      actionSecret,
      prisma,
      workflowStarter
    };

    const processed = await processSlackIncidentAction(dependencies, {
      actionToken: token,
      client,
      receiptKey: "slack-receipt-ack",
      slackUserId: "U_ACTOR"
    });
    expect(processed.changed).toBe(true);
    await expect(
      prisma.incident.findUniqueOrThrow({
        where: { id: triggered.incident.id }
      })
    ).resolves.toMatchObject({ state: IncidentState.ACKNOWLEDGED });
    await expect(
      prisma.user.findFirstOrThrow({
        where: { email: "slack-actor@example.com" }
      })
    ).resolves.toMatchObject({ slackUserId: "U_ACTOR" });

    const duplicateReceipt = await processSlackIncidentAction(dependencies, {
      actionToken: token,
      client,
      receiptKey: "slack-receipt-ack",
      slackUserId: "U_ACTOR"
    });
    expect(duplicateReceipt.duplicate).toBe(true);
  });

  it("prevents a double-clicked manual escalation from advancing twice", async () => {
    const triggered = await trigger("escalate");
    const token = createSlackActionToken(
      {
        action: "escalate",
        incidentId: triggered.incident.id,
        version: triggered.incident.version
      },
      actionSecret
    );
    const dependencies = { actionSecret, prisma, workflowStarter };

    await processSlackIncidentAction(dependencies, {
      actionToken: token,
      client,
      receiptKey: "slack-receipt-escalate-1",
      slackUserId: "U_ACTOR"
    });
    const second = await processSlackIncidentAction(dependencies, {
      actionToken: token,
      client,
      receiptKey: "slack-receipt-escalate-2",
      slackUserId: "U_ACTOR"
    });

    expect(second.changed).toBe(false);
    await expect(
      prisma.incident.findUniqueOrThrow({
        where: { id: triggered.incident.id }
      })
    ).resolves.toMatchObject({
      assigneeId: backupUserId,
      currentEscalationPosition: 1
    });
  });

  it("reassigns to a mapped Slack user", async () => {
    const triggered = await trigger("reassign");
    const token = createSlackActionToken(
      {
        action: "reassign",
        incidentId: triggered.incident.id,
        version: triggered.incident.version
      },
      actionSecret
    );

    await processSlackIncidentAction(
      { actionSecret, prisma, workflowStarter },
      {
        actionToken: token,
        client,
        receiptKey: "slack-receipt-reassign",
        reassignSlackUserId: "U_BACKUP",
        slackUserId: "U_ACTOR"
      }
    );

    await expect(
      prisma.incident.findUniqueOrThrow({
        where: { id: triggered.incident.id }
      })
    ).resolves.toMatchObject({ assigneeId: backupUserId });
  });

  it("rejects tampered actions and unmapped users gracefully", async () => {
    const triggered = await trigger("invalid");
    const token = createSlackActionToken(
      {
        action: "resolve",
        incidentId: triggered.incident.id,
        version: triggered.incident.version
      },
      actionSecret
    );

    await expect(
      processSlackIncidentAction(
        { actionSecret, prisma, workflowStarter },
        {
          actionToken: `${token}tampered`,
          client,
          receiptKey: "slack-receipt-tampered",
          slackUserId: "U_ACTOR"
        }
      )
    ).rejects.toMatchObject({
      code: "INVALID_ACTION"
    } satisfies Partial<SlackActionError>);

    await expect(
      processSlackIncidentAction(
        { actionSecret, prisma, workflowStarter },
        {
          actionToken: token,
          client,
          receiptKey: "slack-receipt-unmapped",
          slackUserId: "U_UNKNOWN"
        }
      )
    ).rejects.toMatchObject({
      code: "UNMAPPED_USER"
    } satisfies Partial<SlackActionError>);
  });

  it("verifies Slack signatures and answers URL challenges promptly", async () => {
    const signingSecret = "slack-http-signing-secret";
    const runtime = createSlackBoltRuntime({
      actionSecret,
      botToken: "xoxb-test-token",
      prisma,
      signingSecret,
      workflowStarter
    });
    const app = buildApp({ slackRuntime: runtime });
    await app.ready();

    const body = JSON.stringify({
      challenge: "phase-3-challenge",
      token: "legacy-token",
      type: "url_verification"
    });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = `v0=${createHmac("sha256", signingSecret)
      .update(`v0:${timestamp}:${body}`)
      .digest("hex")}`;
    const startedAt = performance.now();
    const response = await app.inject({
      headers: {
        "content-type": "application/json",
        "x-slack-request-timestamp": timestamp,
        "x-slack-signature": signature
      },
      method: "POST",
      payload: body,
      url: "/slack/events"
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain("phase-3-challenge");
    expect(performance.now() - startedAt).toBeLessThan(3_000);

    const invalid = await app.inject({
      headers: {
        "content-type": "application/json",
        "x-slack-request-timestamp": timestamp,
        "x-slack-signature": "v0=invalid"
      },
      method: "POST",
      payload: body,
      url: "/slack/events"
    });
    expect(invalid.statusCode).toBe(401);
    await app.close();
  });
});
