import type { PrismaClient } from "@backbeat/db";
import {
  acknowledgeIncident,
  advanceIncidentEscalation,
  reassignIncident,
  resolveIncident,
  snoozeIncident
} from "@backbeat/domain";
import { verifySlackActionToken } from "@backbeat/notifications";
import {
  dispatchIncidentWorkflow,
  type IncidentWorkflowStarter
} from "@backbeat/workflows";

import { mapSlackActor, type SlackActorClient } from "./user-mapping.js";

export interface SlackActionDependencies {
  actionSecret: string;
  prisma: PrismaClient;
  workflowStarter: IncidentWorkflowStarter;
}

export interface ProcessSlackActionInput {
  actionToken: string;
  client: SlackActorClient;
  receiptKey: string;
  reassignSlackUserId?: string;
  slackUserId: string;
}

export interface ProcessSlackActionResult {
  changed: boolean;
  duplicate: boolean;
  incidentId: string | null;
}

export class SlackActionError extends Error {
  constructor(
    readonly code: "INVALID_ACTION" | "UNMAPPED_USER",
    message: string
  ) {
    super(message);
    this.name = "SlackActionError";
  }
}

async function claimReceipt(
  prisma: PrismaClient,
  receiptKey: string,
  payload: {
    actionToken: string;
    slackUserId: string;
  }
): Promise<boolean> {
  try {
    await prisma.slackInteractionReceipt.create({
      data: {
        interactionType: "incident_action",
        payload,
        receiptKey,
        slackUserId: payload.slackUserId,
        status: "PROCESSING"
      }
    });
    return true;
  } catch (error) {
    const existing = await prisma.slackInteractionReceipt.findUnique({
      where: { receiptKey }
    });
    if (!existing) throw error;
    if (existing.status !== "FAILED") return false;

    const claimed = await prisma.slackInteractionReceipt.updateMany({
      where: {
        id: existing.id,
        status: "FAILED"
      },
      data: {
        errorMessage: null,
        status: "PROCESSING"
      }
    });
    return claimed.count === 1;
  }
}

export async function processSlackIncidentAction(
  dependencies: SlackActionDependencies,
  input: ProcessSlackActionInput
): Promise<ProcessSlackActionResult> {
  const claimed = await claimReceipt(dependencies.prisma, input.receiptKey, {
    actionToken: input.actionToken,
    slackUserId: input.slackUserId
  });
  if (!claimed) {
    return { changed: false, duplicate: true, incidentId: null };
  }

  const action = verifySlackActionToken(
    input.actionToken,
    dependencies.actionSecret
  );
  try {
    if (!action) {
      throw new SlackActionError(
        "INVALID_ACTION",
        "This incident action is invalid or has been tampered with"
      );
    }

    const actor = await mapSlackActor(
      dependencies.prisma,
      input.client,
      input.slackUserId
    );
    if (!actor) {
      throw new SlackActionError(
        "UNMAPPED_USER",
        "Your Slack account is not linked to an active Backbeat Pager user. Ask an administrator to add your work email."
      );
    }

    const idempotencyKey = `slack:${action.action}:${action.incidentId}:version:${action.version}:user:${actor.id}`;
    const reference = { incidentId: action.incidentId };
    const result =
      action.action === "acknowledge"
        ? await acknowledgeIncident(dependencies.prisma, {
            actor: {
              kind: "SLACK_USER",
              slackUserId: input.slackUserId,
              userId: actor.id
            },
            idempotencyKey,
            reference
          })
        : action.action === "resolve"
          ? await resolveIncident(dependencies.prisma, {
              actor: {
                kind: "SLACK_USER",
                slackUserId: input.slackUserId,
                userId: actor.id
              },
              idempotencyKey,
              reference
            })
          : action.action === "escalate"
            ? await advanceIncidentEscalation(dependencies.prisma, {
                actor: {
                  kind: "SLACK_USER",
                  slackUserId: input.slackUserId,
                  userId: actor.id
                },
                idempotencyKey,
                reference
              })
            : action.action === "snooze"
              ? await snoozeIncident(dependencies.prisma, {
                  actor: {
                    kind: "SLACK_USER",
                    slackUserId: input.slackUserId,
                    userId: actor.id
                  },
                  idempotencyKey,
                  reference
                })
              : await (async () => {
                  if (!input.reassignSlackUserId) {
                    throw new SlackActionError(
                      "INVALID_ACTION",
                      "Choose a user before reassigning this incident"
                    );
                  }
                  const assignee = await mapSlackActor(
                    dependencies.prisma,
                    input.client,
                    input.reassignSlackUserId
                  );
                  if (!assignee) {
                    throw new SlackActionError(
                      "UNMAPPED_USER",
                      "The selected Slack user is not linked to an active Backbeat Pager user"
                    );
                  }
                  return reassignIncident(dependencies.prisma, {
                    actor: {
                      kind: "SLACK_USER",
                      slackUserId: input.slackUserId,
                      userId: actor.id
                    },
                    assigneeId: assignee.id,
                    idempotencyKey,
                    reference
                  });
                })();

    await dispatchIncidentWorkflow(
      dependencies.prisma,
      dependencies.workflowStarter,
      {
        generation: result.incident.escalationGeneration,
        incidentId: result.incident.id
      }
    );
    await dependencies.prisma.slackInteractionReceipt.update({
      where: { receiptKey: input.receiptKey },
      data: {
        processedAt: new Date(),
        result: {
          changed: result.changed,
          incidentId: result.incident.id,
          state: result.incident.state
        },
        status: "SUCCEEDED"
      }
    });

    return {
      changed: result.changed,
      duplicate: false,
      incidentId: result.incident.id
    };
  } catch (error) {
    await dependencies.prisma.slackInteractionReceipt.update({
      where: { receiptKey: input.receiptKey },
      data: {
        errorMessage: error instanceof Error ? error.message : String(error),
        processedAt: new Date(),
        status: "FAILED"
      }
    });
    throw error;
  }
}
