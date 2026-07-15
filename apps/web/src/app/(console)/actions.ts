"use server";

import {
  ActorKind,
  getPrismaClient,
  type RotationType,
  type UserRole
} from "@backbeat/db";
import { acknowledgeIncident, resolveIncident } from "@backbeat/domain";
import { revalidatePath } from "next/cache";

import {
  createEscalationPolicy,
  createSchedule,
  createScheduleOverride,
  createService,
  createTeam,
  createUser,
  deleteScheduleOverride,
  rotateServiceRoutingKey,
  setEntityActive,
  updateEscalationPolicy,
  updateSchedule,
  updateService,
  updateSlackChannels,
  updateTeam,
  updateUser,
  type AdminMutationActor,
  type PolicyInput,
  type ScheduleInput,
  type ServiceInput,
  type TeamInput,
  type UserInput
} from "@/lib/admin/mutations";
import { requireActor, requireAdmin } from "@/lib/authz";

export interface SecretActionState {
  error: string | null;
  routingKey: string | null;
  success: boolean;
}

function value(form: FormData, key: string): string {
  const item = form.get(key);
  return typeof item === "string" ? item.trim() : "";
}

function nullableValue(form: FormData, key: string): string | null {
  return value(form, key) || null;
}

function checked(form: FormData, key: string): boolean {
  return form.get(key) === "on" || form.get(key) === "true";
}

function optionalPositiveNumber(form: FormData, key: string): number | null {
  const raw = value(form, key);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function adminActor(
  actor: Awaited<ReturnType<typeof requireAdmin>>
): AdminMutationActor {
  return { id: actor.id, role: actor.role };
}

function userInput(form: FormData): UserInput {
  return {
    email: value(form, "email"),
    emailNotifications: checked(form, "emailNotifications"),
    name: value(form, "name"),
    role: value(form, "role") as UserRole,
    slackNotifications: checked(form, "slackNotifications"),
    slackUserId: nullableValue(form, "slackUserId"),
    timezone: value(form, "timezone") || "UTC"
  };
}

function teamInput(form: FormData): TeamInput {
  return {
    description: nullableValue(form, "description"),
    digestDayOfWeek: Number(value(form, "digestDayOfWeek") || 1),
    digestEnabled: checked(form, "digestEnabled"),
    digestLocalTime: value(form, "digestLocalTime") || "09:00",
    handoffMessagesEnabled: checked(form, "handoffMessagesEnabled"),
    memberIds: form
      .getAll("memberIds")
      .filter((item): item is string => typeof item === "string"),
    name: value(form, "name"),
    slackChannelId: nullableValue(form, "slackChannelId"),
    slug: value(form, "slug"),
    timezone: value(form, "timezone") || "UTC"
  };
}

function scheduleInput(form: FormData): ScheduleInput {
  const rotationType = value(form, "rotationType") as RotationType;
  const restrictionDays = form
    .getAll("restrictionDays")
    .filter((item): item is string => typeof item === "string")
    .map(Number);
  return {
    anchorLocalDate: value(form, "anchorLocalDate"),
    customIntervalMinutes: optionalPositiveNumber(
      form,
      "customIntervalMinutes"
    ),
    handoffLocalTime: value(form, "handoffLocalTime"),
    name: value(form, "name"),
    participantIds: form
      .getAll("participantIds")
      .filter((item): item is string => typeof item === "string"),
    restrictions: checked(form, "restrictionEnabled")
      ? restrictionDays.map((dayOfWeek) => ({
          dayOfWeek,
          endLocalTime: value(form, "restrictionEnd") || "17:00",
          startLocalTime: value(form, "restrictionStart") || "09:00"
        }))
      : [],
    rotationInterval: Number(value(form, "rotationInterval") || 1),
    rotationType,
    slug: value(form, "slug"),
    teamId: value(form, "teamId"),
    timezone: value(form, "timezone") || "UTC"
  };
}

function policyInput(form: FormData): PolicyInput {
  const targets = form
    .getAll("target")
    .filter((item): item is string => typeof item === "string");
  const timeouts = form
    .getAll("timeoutMinutes")
    .filter((item): item is string => typeof item === "string");
  return {
    acknowledgementTimeoutMinutes: optionalPositiveNumber(
      form,
      "acknowledgementTimeoutMinutes"
    ),
    name: value(form, "name"),
    repeatCount: Number(value(form, "repeatCount") || 0),
    slug: value(form, "slug"),
    steps: targets.map((target, index) => {
      const [targetType, targetId] = target.split(":");
      return {
        targetId: targetId ?? "",
        targetType: (targetType ?? "schedule") as "schedule" | "team" | "user",
        timeoutMinutes: Number(timeouts[index] || 5)
      };
    }),
    teamId: value(form, "teamId")
  };
}

function serviceInput(form: FormData): ServiceInput {
  return {
    autoCreateIncidentChannel: checked(form, "autoCreateIncidentChannel"),
    criticalChannelThresholdMinutes: optionalPositiveNumber(
      form,
      "criticalChannelThresholdMinutes"
    ),
    escalationPolicyId: value(form, "escalationPolicyId"),
    incidentChannelsPrivate: checked(form, "incidentChannelsPrivate"),
    name: value(form, "name"),
    nagCriticalMinutes: optionalPositiveNumber(form, "nagCriticalMinutes"),
    nagWarningMinutes: optionalPositiveNumber(form, "nagWarningMinutes"),
    slackChannelId: nullableValue(form, "slackChannelId"),
    slug: value(form, "slug"),
    teamId: value(form, "teamId")
  };
}

export async function createUserAction(form: FormData): Promise<void> {
  const actor = await requireAdmin();
  await createUser(getPrismaClient(), adminActor(actor), userInput(form));
  revalidatePath("/users");
}

export async function updateUserAction(form: FormData): Promise<void> {
  const actor = await requireAdmin();
  await updateUser(
    getPrismaClient(),
    adminActor(actor),
    value(form, "id"),
    userInput(form)
  );
  revalidatePath("/users");
}

export async function createTeamAction(form: FormData): Promise<void> {
  const actor = await requireAdmin();
  await createTeam(getPrismaClient(), adminActor(actor), teamInput(form));
  await requestWorkflowReconciliation();
  revalidatePath("/teams");
}

export async function updateTeamAction(form: FormData): Promise<void> {
  const actor = await requireAdmin();
  await updateTeam(
    getPrismaClient(),
    adminActor(actor),
    value(form, "id"),
    teamInput(form)
  );
  await requestWorkflowReconciliation();
  revalidatePath("/teams");
}

export async function createScheduleAction(form: FormData): Promise<void> {
  const actor = await requireAdmin();
  await createSchedule(
    getPrismaClient(),
    adminActor(actor),
    scheduleInput(form)
  );
  await requestWorkflowReconciliation();
  revalidatePath("/schedules");
}

export async function updateScheduleAction(form: FormData): Promise<void> {
  const actor = await requireAdmin();
  await updateSchedule(
    getPrismaClient(),
    adminActor(actor),
    value(form, "id"),
    scheduleInput(form)
  );
  await requestWorkflowReconciliation();
  revalidatePath("/schedules");
}

export async function createOverrideAction(form: FormData): Promise<void> {
  const actor = await requireAdmin();
  await createScheduleOverride(getPrismaClient(), adminActor(actor), {
    endsAt: new Date(value(form, "endsAt")),
    reason: nullableValue(form, "reason"),
    replacedUserId: nullableValue(form, "replacedUserId"),
    replacementUserId: value(form, "replacementUserId"),
    scheduleId: value(form, "scheduleId"),
    startsAt: new Date(value(form, "startsAt"))
  });
  await requestWorkflowReconciliation();
  revalidatePath("/schedules");
}

export async function deleteOverrideAction(form: FormData): Promise<void> {
  const actor = await requireAdmin();
  await deleteScheduleOverride(
    getPrismaClient(),
    adminActor(actor),
    value(form, "id")
  );
  await requestWorkflowReconciliation();
  revalidatePath("/schedules");
}

export async function createPolicyAction(form: FormData): Promise<void> {
  const actor = await requireAdmin();
  await createEscalationPolicy(
    getPrismaClient(),
    adminActor(actor),
    policyInput(form)
  );
  revalidatePath("/policies");
}

export async function updatePolicyAction(form: FormData): Promise<void> {
  const actor = await requireAdmin();
  await updateEscalationPolicy(
    getPrismaClient(),
    adminActor(actor),
    value(form, "id"),
    policyInput(form)
  );
  revalidatePath("/policies");
}

export async function createServiceAction(
  _previous: SecretActionState,
  form: FormData
): Promise<SecretActionState> {
  try {
    const actor = await requireAdmin();
    const created = await createService(
      getPrismaClient(),
      adminActor(actor),
      serviceInput(form)
    );
    revalidatePath("/services");
    return {
      error: null,
      routingKey: created.routingKey,
      success: true
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not create service",
      routingKey: null,
      success: false
    };
  }
}

export async function updateServiceAction(form: FormData): Promise<void> {
  const actor = await requireAdmin();
  await updateService(
    getPrismaClient(),
    adminActor(actor),
    value(form, "id"),
    serviceInput(form)
  );
  revalidatePath("/services");
}

export async function rotateServiceKeyAction(
  _previous: SecretActionState,
  form: FormData
): Promise<SecretActionState> {
  try {
    const actor = await requireAdmin();
    const routingKey = await rotateServiceRoutingKey(
      getPrismaClient(),
      adminActor(actor),
      value(form, "id")
    );
    revalidatePath("/services");
    return { error: null, routingKey, success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not rotate key",
      routingKey: null,
      success: false
    };
  }
}

export async function toggleEntityAction(form: FormData): Promise<void> {
  const actor = await requireAdmin();
  const entity = value(form, "entity") as
    "EscalationPolicy" | "Schedule" | "Service" | "Team" | "User";
  await setEntityActive(
    getPrismaClient(),
    adminActor(actor),
    entity,
    value(form, "id"),
    value(form, "active") === "true"
  );
  revalidatePath("/");
}

async function requestWorkflowReconciliation(): Promise<void> {
  const appBaseUrl =
    process.env.WEB_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  const cronSecret = process.env.CRON_SECRET;
  if (!appBaseUrl || !cronSecret) return;
  await fetch(`${appBaseUrl.replace(/\/$/, "")}/internal/reconcile`, {
    headers: { authorization: `Bearer ${cronSecret}` },
    method: "POST"
  });
}

export async function incidentAction(form: FormData): Promise<void> {
  const actor = await requireActor();
  const incidentId = value(form, "incidentId");
  const action = value(form, "action");
  const input = {
    actor: {
      kind: ActorKind.USER,
      userId: actor.id
    },
    idempotencyKey: `web:${action}:${incidentId}:version:${value(form, "version")}:user:${actor.id}`,
    reference: { incidentId }
  };
  if (action === "acknowledge") {
    await acknowledgeIncident(getPrismaClient(), input);
  } else if (action === "resolve") {
    await resolveIncident(getPrismaClient(), {
      ...input,
      ...(nullableValue(form, "note")
        ? { note: nullableValue(form, "note")! }
        : {})
    });
  }
  await requestWorkflowReconciliation();
  revalidatePath("/incidents");
  revalidatePath(`/incidents/${value(form, "number")}`);
}

export async function updateChannelsAction(form: FormData): Promise<void> {
  const actor = await requireAdmin();
  const teams: Array<{ id: string; slackChannelId: string | null }> = [];
  const services: Array<{ id: string; slackChannelId: string | null }> = [];
  for (const [key, item] of form.entries()) {
    if (typeof item !== "string") continue;
    if (key.startsWith("team:")) {
      teams.push({
        id: key.slice("team:".length),
        slackChannelId: item.trim() || null
      });
    }
    if (key.startsWith("service:")) {
      services.push({
        id: key.slice("service:".length),
        slackChannelId: item.trim() || null
      });
    }
  }
  await updateSlackChannels(getPrismaClient(), adminActor(actor), {
    services,
    teams
  });
  await requestWorkflowReconciliation();
  revalidatePath("/settings");
}
