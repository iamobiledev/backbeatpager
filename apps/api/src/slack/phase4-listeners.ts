import { randomUUID } from "node:crypto";

import { ActorKind, Severity, type PrismaClient } from "@backbeat/db";
import { triggerIncident } from "@backbeat/domain";
import { createSlackActionToken } from "@backbeat/notifications";
import { dispatchIncidentWorkflow } from "@backbeat/workflows";
import type { App } from "@slack/bolt";
import type { HomeView } from "@slack/types";

import {
  processSlackIncidentAction,
  type SlackActionDependencies
} from "./actions.js";
import {
  buildManualIncidentModal,
  buildOnCallOverrideModal,
  buildResolveIncidentModal
} from "./modals.js";
import {
  buildAppHomeView,
  buildIncidentListBlocks,
  getOnCallSchedules,
  renderOnCallBlocks
} from "./views.js";
import { mapSlackActor, type SlackActorClient } from "./user-mapping.js";

export type IncidentSlashCommand =
  | { kind: "ack"; number: number }
  | { kind: "invalid"; message: string }
  | { includeResolved: boolean; kind: "list" }
  | { kind: "resolve"; number: number }
  | { kind: "trigger" };

export function parseIncidentSlashCommand(text: string): IncidentSlashCommand {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  const command = parts[0]?.toLowerCase() ?? "list";

  if (command === "list") {
    const mode = parts[1]?.toLowerCase() ?? "open";
    if (mode !== "open" && mode !== "all") {
      return {
        kind: "invalid",
        message: "Usage: `/incident list [open|all]`"
      };
    }
    return { includeResolved: mode === "all", kind: "list" };
  }
  if (command === "trigger") return { kind: "trigger" };
  if (command === "ack" || command === "resolve") {
    const number = Number(parts[1]);
    if (!Number.isInteger(number) || number <= 0) {
      return {
        kind: "invalid",
        message: `Usage: \`/incident ${command} <incident-number>\``
      };
    }
    return { kind: command, number };
  }

  return {
    kind: "invalid",
    message:
      "Usage: `/incident list [open|all]`, `/incident trigger`, `/incident ack <id>`, or `/incident resolve <id>`"
  };
}

export interface SlackViewClient extends SlackActorClient {
  views: {
    publish(input: {
      hash?: string;
      user_id: string;
      view: HomeView;
    }): Promise<unknown>;
  };
}

export interface Phase4Dependencies extends SlackActionDependencies {
  webBaseUrl?: string;
}

function object(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stateElement(
  view: { state: { values: unknown } },
  blockId: string,
  actionId = "value"
): Record<string, unknown> {
  const block = object(object(view.state.values)[blockId]);
  return object(block[actionId]);
}

function selectedOption(
  view: { state: { values: unknown } },
  blockId: string
): string | null {
  const option = object(stateElement(view, blockId).selected_option);
  return typeof option.value === "string" ? option.value : null;
}

function plainValue(
  view: { state: { values: unknown } },
  blockId: string
): string | null {
  const value = stateElement(view, blockId).value;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function selectedUser(
  view: { state: { values: unknown } },
  blockId: string
): string | null {
  const value = stateElement(view, blockId).selected_user;
  return typeof value === "string" ? value : null;
}

function selectedDateTime(
  view: { state: { values: unknown } },
  blockId: string
): Date | null {
  const value = stateElement(view, blockId).selected_date_time;
  return typeof value === "number" && Number.isFinite(value)
    ? new Date(value * 1000)
    : null;
}

function homeError(message: string): HomeView {
  return {
    blocks: [
      {
        text: {
          text: `:warning: ${message}`,
          type: "mrkdwn"
        },
        type: "section"
      }
    ],
    type: "home"
  };
}

export async function publishAppHomeForSlackUser(
  prisma: PrismaClient,
  client: SlackViewClient,
  slackUserId: string,
  webBaseUrl?: string,
  hash?: string
): Promise<void> {
  const user = await mapSlackActor(prisma, client, slackUserId);
  const view = user
    ? await buildAppHomeView(prisma, user.id, webBaseUrl)
    : homeError(
        "Your Slack account is not linked to an active Backbeat Pager user. Ask an administrator to add your work email."
      );
  await client.views.publish({
    ...(hash ? { hash } : {}),
    user_id: slackUserId,
    view
  });
}

async function incidentByNumber(prisma: PrismaClient, number: number) {
  return prisma.incident.findUnique({ where: { number } });
}

export async function createOnCallOverride(
  prisma: PrismaClient,
  input: {
    createdById: string;
    endsAt: Date;
    reason?: string;
    replacementUserId: string;
    scheduleId: string;
    startsAt: Date;
  }
) {
  if (input.endsAt <= input.startsAt) {
    throw new Error("Override end must be after its start");
  }
  const [schedule, replacement] = await Promise.all([
    prisma.schedule.findFirst({
      where: {
        active: true,
        id: input.scheduleId,
        team: {
          memberships: { some: { userId: input.createdById } }
        }
      }
    }),
    prisma.user.findFirst({
      where: { active: true, id: input.replacementUserId }
    })
  ]);
  if (!schedule) throw new Error("Schedule is not available to this user");
  if (!replacement) throw new Error("Replacement user is not active");

  return prisma.scheduleOverride.create({
    data: {
      createdById: input.createdById,
      endsAt: input.endsAt,
      ...(input.reason ? { reason: input.reason } : {}),
      replacedUserId: input.createdById,
      replacementUserId: replacement.id,
      scheduleId: schedule.id,
      startsAt: input.startsAt
    }
  });
}

async function claimViewSubmission(
  prisma: PrismaClient,
  receiptKey: string,
  slackUserId: string,
  interactionType: string
): Promise<boolean> {
  try {
    await prisma.slackInteractionReceipt.create({
      data: {
        interactionType,
        receiptKey,
        slackUserId,
        status: "PROCESSING"
      }
    });
    return true;
  } catch {
    return false;
  }
}

async function completeViewSubmission(
  prisma: PrismaClient,
  receiptKey: string,
  result: Record<string, string>
): Promise<void> {
  await prisma.slackInteractionReceipt.update({
    where: { receiptKey },
    data: {
      processedAt: new Date(),
      result,
      status: "SUCCEEDED"
    }
  });
}

async function failViewSubmission(
  prisma: PrismaClient,
  receiptKey: string,
  error: unknown
): Promise<void> {
  await prisma.slackInteractionReceipt.update({
    where: { receiptKey },
    data: {
      errorMessage: error instanceof Error ? error.message : String(error),
      processedAt: new Date(),
      status: "FAILED"
    }
  });
}

export function registerPhase4Listeners(
  app: App,
  dependencies: Phase4Dependencies
): void {
  app.command("/oncall", async ({ ack, client, command, respond }) => {
    await ack();
    const text = command.text.trim();
    if (text.toLowerCase() === "override") {
      const actor = await mapSlackActor(
        dependencies.prisma,
        client,
        command.user_id
      );
      if (!actor) {
        await respond({
          response_type: "ephemeral",
          text: "Your Slack account is not linked to an active Backbeat Pager user."
        });
        return;
      }
      const schedules = await dependencies.prisma.schedule.findMany({
        where: {
          active: true,
          team: {
            memberships: {
              some: { userId: actor.id }
            }
          }
        },
        include: { team: true },
        orderBy: { name: "asc" },
        take: 100
      });
      if (schedules.length === 0) {
        await respond({
          response_type: "ephemeral",
          text: "You are not a member of any active schedule team."
        });
        return;
      }
      await client.views.open({
        trigger_id: command.trigger_id,
        view: buildOnCallOverrideModal(
          schedules.map((schedule) => ({
            id: schedule.id,
            name: schedule.name,
            teamName: schedule.team.name,
            timezone: schedule.timezone
          })),
          actor.timezone
        )
      });
      return;
    }

    const schedules = await getOnCallSchedules(
      dependencies.prisma,
      text || undefined
    );
    await respond({
      blocks: renderOnCallBlocks(schedules),
      response_type: "ephemeral",
      text: schedules.length
        ? "Current on-call schedules"
        : "No schedules matched"
    });
  });

  app.command("/incident", async ({ ack, client, command, respond }) => {
    await ack();
    const parsed = parseIncidentSlashCommand(command.text);
    if (parsed.kind === "invalid") {
      await respond({ response_type: "ephemeral", text: parsed.message });
      return;
    }
    if (parsed.kind === "list") {
      await respond({
        blocks: await buildIncidentListBlocks(
          dependencies.prisma,
          dependencies.actionSecret,
          parsed.includeResolved
        ),
        response_type: "ephemeral",
        text: "Backbeat Pager incidents"
      });
      return;
    }
    if (parsed.kind === "trigger") {
      await client.views.open({
        trigger_id: command.trigger_id,
        view: buildManualIncidentModal()
      });
      return;
    }

    const incident = await incidentByNumber(dependencies.prisma, parsed.number);
    if (!incident) {
      await respond({
        response_type: "ephemeral",
        text: `Incident #${parsed.number} was not found.`
      });
      return;
    }
    const token = createSlackActionToken(
      {
        action: parsed.kind === "ack" ? "acknowledge" : "resolve",
        incidentId: incident.id,
        version: incident.version
      },
      dependencies.actionSecret
    );
    if (parsed.kind === "resolve") {
      await client.views.open({
        trigger_id: command.trigger_id,
        view: buildResolveIncidentModal(incident.number, token)
      });
      return;
    }

    const result = await processSlackIncidentAction(dependencies, {
      actionToken: token,
      client,
      receiptKey: `slash:incident:ack:${incident.id}:${command.user_id}:${incident.version}`,
      slackUserId: command.user_id
    });
    await respond({
      response_type: "ephemeral",
      text: result.changed
        ? `Incident #${incident.number} acknowledged.`
        : `Incident #${incident.number} was already acknowledged.`
    });
  });

  app.options("incident_service_options", async ({ ack, options }) => {
    const query = options.value.trim();
    const services = await dependencies.prisma.service.findMany({
      where: {
        active: true,
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { slug: { contains: query, mode: "insensitive" } }
              ]
            }
          : {})
      },
      include: { team: true },
      orderBy: { name: "asc" },
      take: 100
    });
    await ack({
      options: services.map((service) => ({
        text: {
          text: `${service.team.name} · ${service.name}`.slice(0, 75),
          type: "plain_text"
        },
        value: service.id
      }))
    });
  });

  app.view("incident_trigger_submit", async ({ ack, body, client, view }) => {
    const serviceId = selectedOption(view, "service");
    const severity = selectedOption(view, "severity");
    const summary = plainValue(view, "summary");
    const sourceUrl = plainValue(view, "source_url");
    if (!serviceId || !severity || !summary) {
      await ack({
        response_action: "errors",
        errors: {
          summary: "Service, severity, and summary are required."
        }
      });
      return;
    }
    if (sourceUrl) {
      try {
        new URL(sourceUrl);
      } catch {
        await ack({
          response_action: "errors",
          errors: { source_url: "Enter a valid URL." }
        });
        return;
      }
    }
    await ack();

    const receiptKey = `view:incident-trigger:${view.id}`;
    if (
      !(await claimViewSubmission(
        dependencies.prisma,
        receiptKey,
        body.user.id,
        "incident_trigger"
      ))
    ) {
      return;
    }
    try {
      const actor = await mapSlackActor(
        dependencies.prisma,
        client,
        body.user.id
      );
      if (!actor) throw new Error("Slack user is not mapped");
      const result = await triggerIncident(dependencies.prisma, {
        actor: {
          kind: ActorKind.SLACK_USER,
          slackUserId: body.user.id,
          userId: actor.id
        },
        dedupKey: `manual:${randomUUID()}`,
        idempotencyKey: receiptKey,
        payload: {
          manual: true,
          slackUserId: body.user.id
        },
        requestId: receiptKey,
        serviceId,
        severity:
          severity === "critical"
            ? Severity.CRITICAL
            : severity === "warning"
              ? Severity.WARNING
              : Severity.INFO,
        source: "Slack manual trigger",
        ...(sourceUrl ? { sourceUrl } : {}),
        summary
      });
      await dispatchIncidentWorkflow(
        dependencies.prisma,
        dependencies.workflowStarter,
        {
          generation: result.incident.escalationGeneration,
          incidentId: result.incident.id
        }
      );
      await completeViewSubmission(dependencies.prisma, receiptKey, {
        incidentId: result.incident.id
      });
      await publishAppHomeForSlackUser(
        dependencies.prisma,
        client,
        body.user.id,
        dependencies.webBaseUrl
      );
    } catch (error) {
      await failViewSubmission(dependencies.prisma, receiptKey, error);
      throw error;
    }
  });

  app.view("incident_resolve_submit", async ({ ack, body, client, view }) => {
    await ack();
    await processSlackIncidentAction(dependencies, {
      actionToken: view.private_metadata,
      client,
      receiptKey: `view:incident-resolve:${view.id}`,
      ...(plainValue(view, "resolution_note")
        ? { resolutionNote: plainValue(view, "resolution_note")! }
        : {}),
      slackUserId: body.user.id
    });
    await publishAppHomeForSlackUser(
      dependencies.prisma,
      client,
      body.user.id,
      dependencies.webBaseUrl
    );
  });

  app.view("oncall_override_submit", async ({ ack, body, client, view }) => {
    const scheduleId = selectedOption(view, "schedule");
    const replacementSlackUserId = selectedUser(view, "replacement");
    const startsAt = selectedDateTime(view, "starts_at");
    const endsAt = selectedDateTime(view, "ends_at");
    if (
      !scheduleId ||
      !replacementSlackUserId ||
      !startsAt ||
      !endsAt ||
      endsAt <= startsAt
    ) {
      await ack({
        response_action: "errors",
        errors: {
          ends_at: "Choose a valid end time after the start time."
        }
      });
      return;
    }
    await ack();

    const receiptKey = `view:oncall-override:${view.id}`;
    if (
      !(await claimViewSubmission(
        dependencies.prisma,
        receiptKey,
        body.user.id,
        "oncall_override"
      ))
    ) {
      return;
    }
    try {
      const [actor, replacement] = await Promise.all([
        mapSlackActor(dependencies.prisma, client, body.user.id),
        mapSlackActor(dependencies.prisma, client, replacementSlackUserId)
      ]);
      if (!actor || !replacement) {
        throw new Error(
          "Both Slack users must map to active Backbeat Pager users"
        );
      }
      const reason = plainValue(view, "reason");
      const created = await createOnCallOverride(dependencies.prisma, {
        createdById: actor.id,
        endsAt,
        ...(reason ? { reason } : {}),
        replacementUserId: replacement.id,
        scheduleId,
        startsAt
      });
      await completeViewSubmission(dependencies.prisma, receiptKey, {
        overrideId: created.id
      });
      await publishAppHomeForSlackUser(
        dependencies.prisma,
        client,
        body.user.id,
        dependencies.webBaseUrl
      );
    } catch (error) {
      await failViewSubmission(dependencies.prisma, receiptKey, error);
      throw error;
    }
  });

  app.event("app_home_opened", async ({ client, event }) => {
    await publishAppHomeForSlackUser(
      dependencies.prisma,
      client,
      event.user,
      dependencies.webBaseUrl,
      "view" in event && event.view && "hash" in event.view
        ? String(event.view.hash)
        : undefined
    );
  });
}
