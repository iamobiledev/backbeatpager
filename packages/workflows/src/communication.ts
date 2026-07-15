import {
  OutboxStatus,
  WorkflowKind,
  WorkflowStatus,
  type PrismaClient,
  type User
} from "@backbeat/db";
import {
  findNextScheduleChange,
  getIncidentAnalytics,
  nextWeeklyLocalTime,
  resolveScheduleAt,
  type ScheduleSnapshot
} from "@backbeat/domain";
import type { SlackApi, SlackIncidentMessage } from "@backbeat/notifications";

export interface HandoffWorkflowInput {
  generation: number;
  scheduleId: string;
}

export interface DigestWorkflowInput {
  generation: number;
  teamId: string;
}

export interface CommunicationWorkflowStarter {
  startDigest(input: DigestWorkflowInput): Promise<{ runId: string }>;
  startHandoff(input: HandoffWorkflowInput): Promise<{ runId: string }>;
}

export type CommunicationWakeResult =
  { done: false; sleepUntil: string } | { done: true; sleepUntil: null };

export interface CommunicationDeliveryDependencies {
  slack: SlackApi;
  webBaseUrl?: string;
}

export interface CommunicationReconciliationResult {
  digestsStarted: number;
  failed: number;
  handoffsStarted: number;
}

function generation(updatedAt: Date): number {
  return Math.floor(updatedAt.getTime() / 1000);
}

function workflowKey(
  kind: WorkflowKind,
  entityId: string,
  version: number
): string {
  return `${kind.toLowerCase()}:${entityId}:generation:${version}`;
}

async function waitForRun(
  prisma: PrismaClient,
  id: string
): Promise<{ runId: string; started: false }> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const run = await prisma.workflowRun.findUniqueOrThrow({ where: { id } });
    if (run.vercelRunId) return { runId: run.vercelRunId, started: false };
    if (run.status === WorkflowStatus.FAILED) {
      throw new Error(run.lastError ?? "Communication Workflow start failed");
    }
  }
  throw new Error("Timed out waiting for communication Workflow start");
}

async function dispatchCommunication(
  prisma: PrismaClient,
  input: {
    entityId: string;
    generation: number;
    kind: "DIGEST" | "HANDOFF";
    start: () => Promise<{ runId: string }>;
  }
): Promise<{ runId: string; started: boolean }> {
  const logicalKey = workflowKey(input.kind, input.entityId, input.generation);
  const run = await prisma.workflowRun.upsert({
    where: { logicalKey },
    create: {
      entityId: input.entityId,
      generation: input.generation,
      kind: input.kind,
      logicalKey
    },
    update: {}
  });
  if (run.vercelRunId && run.status !== WorkflowStatus.FAILED) {
    return { runId: run.vercelRunId, started: false };
  }

  const now = new Date();
  const claim = await prisma.workflowRun.updateMany({
    where: {
      id: run.id,
      vercelRunId: null,
      OR: [
        {
          status: {
            in: [WorkflowStatus.PENDING, WorkflowStatus.FAILED]
          }
        },
        {
          startedAt: { lt: new Date(now.getTime() - 30_000) },
          status: WorkflowStatus.RUNNING
        }
      ]
    },
    data: {
      lastError: null,
      startedAt: now,
      status: WorkflowStatus.RUNNING
    }
  });
  if (claim.count === 0) return waitForRun(prisma, run.id);

  try {
    const started = await input.start();
    await prisma.workflowRun.update({
      where: { id: run.id },
      data: {
        status: WorkflowStatus.RUNNING,
        vercelRunId: started.runId
      }
    });
    return { runId: started.runId, started: true };
  } catch (error) {
    await prisma.workflowRun.update({
      where: { id: run.id },
      data: {
        lastError: error instanceof Error ? error.message : String(error),
        status: WorkflowStatus.FAILED
      }
    });
    throw error;
  }
}

export function dispatchHandoffWorkflow(
  prisma: PrismaClient,
  starter: CommunicationWorkflowStarter,
  input: HandoffWorkflowInput
) {
  return dispatchCommunication(prisma, {
    entityId: input.scheduleId,
    generation: input.generation,
    kind: WorkflowKind.HANDOFF,
    start: () => starter.startHandoff(input)
  });
}

export function dispatchDigestWorkflow(
  prisma: PrismaClient,
  starter: CommunicationWorkflowStarter,
  input: DigestWorkflowInput
) {
  return dispatchCommunication(prisma, {
    entityId: input.teamId,
    generation: input.generation,
    kind: WorkflowKind.DIGEST,
    start: () => starter.startDigest(input)
  });
}

export async function reconcileCommunicationWorkflows(
  prisma: PrismaClient,
  starter: CommunicationWorkflowStarter
): Promise<CommunicationReconciliationResult> {
  const [schedules, teams] = await Promise.all([
    prisma.schedule.findMany({
      where: {
        active: true,
        team: {
          active: true,
          handoffMessagesEnabled: true,
          slackChannelId: { not: null }
        }
      }
    }),
    prisma.team.findMany({
      where: {
        active: true,
        digestEnabled: true,
        slackChannelId: { not: null }
      }
    })
  ]);
  const result: CommunicationReconciliationResult = {
    digestsStarted: 0,
    failed: 0,
    handoffsStarted: 0
  };

  for (const schedule of schedules) {
    try {
      const dispatched = await dispatchHandoffWorkflow(prisma, starter, {
        generation: generation(schedule.updatedAt),
        scheduleId: schedule.id
      });
      if (dispatched.started) result.handoffsStarted += 1;
    } catch {
      result.failed += 1;
    }
  }
  for (const team of teams) {
    try {
      const dispatched = await dispatchDigestWorkflow(prisma, starter, {
        generation: generation(team.updatedAt),
        teamId: team.id
      });
      if (dispatched.started) result.digestsStarted += 1;
    } catch {
      result.failed += 1;
    }
  }

  return result;
}

async function setRunState(
  prisma: PrismaClient,
  logicalKey: string,
  status: WorkflowStatus,
  expectedWakeAt: Date | null
): Promise<void> {
  await prisma.workflowRun.updateMany({
    where: { logicalKey },
    data: {
      expectedWakeAt,
      ...(status === WorkflowStatus.STALE || status === WorkflowStatus.SUCCEEDED
        ? { finishedAt: new Date() }
        : {}),
      status
    }
  });
}

async function loadSchedule(prisma: PrismaClient, scheduleId: string) {
  return prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: {
      layers: {
        orderBy: { position: "asc" },
        include: {
          participants: {
            orderBy: { position: "asc" },
            include: { user: true }
          },
          restrictions: true
        }
      },
      overrides: true,
      team: {
        include: {
          memberships: { include: { user: true } }
        }
      }
    }
  });
}

type LoadedSchedule = NonNullable<Awaited<ReturnType<typeof loadSchedule>>>;

function snapshot(schedule: LoadedSchedule): ScheduleSnapshot {
  return {
    id: schedule.id,
    layers: schedule.layers.map((layer) => ({
      activeFrom: layer.activeFrom,
      activeUntil: layer.activeUntil,
      anchorInstant: layer.anchorInstant,
      anchorLocalDate: layer.anchorLocalDate.toISOString().slice(0, 10),
      customIntervalMinutes: layer.customIntervalMinutes,
      handoffLocalTime: layer.handoffLocalTime,
      id: layer.id,
      participants: layer.participants
        .filter((participant) => participant.user.active)
        .map((participant) => ({
          position: participant.position,
          userId: participant.userId
        })),
      position: layer.position,
      restrictions: layer.restrictions.map((restriction) => ({
        dayOfWeek: restriction.dayOfWeek,
        endLocalTime: restriction.endLocalTime,
        startLocalTime: restriction.startLocalTime
      })),
      rotationInterval: layer.rotationInterval,
      rotationType: layer.rotationType
    })),
    overrides: schedule.overrides.map((override) => ({
      createdAt: override.createdAt,
      endsAt: override.endsAt,
      id: override.id,
      layerId: override.layerId,
      replacedUserId: override.replacedUserId,
      replacementUserId: override.replacementUserId,
      startsAt: override.startsAt
    })),
    timezone: schedule.timezone
  };
}

async function slackLabel(
  prisma: PrismaClient,
  slack: SlackApi,
  user: User
): Promise<string> {
  if (user.slackUserId) return `<@${user.slackUserId}>`;
  try {
    const mapped = await slack.lookupUserByEmail(user.email);
    if (mapped) {
      await prisma.user.update({
        where: { id: user.id },
        data: { slackUserId: mapped.userId }
      });
      return `<@${mapped.userId}>`;
    }
  } catch {
    // Handoff still posts with a readable name when email lookup fails.
  }
  return `*${user.name}*`;
}

async function userLabels(
  prisma: PrismaClient,
  slack: SlackApi,
  ids: string[]
): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { active: true, id: { in: ids } }
  });
  const labels: string[] = [];
  for (const user of users) labels.push(await slackLabel(prisma, slack, user));
  return labels;
}

function genericMessage(text: string): SlackIncidentMessage {
  return {
    attachments: [],
    blocks: [
      {
        text: { text, type: "mrkdwn" },
        type: "section"
      }
    ],
    text
  };
}

async function postOnce(
  prisma: PrismaClient,
  dependencies: CommunicationDeliveryDependencies,
  input: {
    auditAction: string;
    channelId: string;
    entityId: string;
    entityType: string;
    key: string;
    message: SlackIncidentMessage;
    payload: Record<string, string | number>;
  }
): Promise<void> {
  const outbox = await prisma.outboxEvent.upsert({
    where: { idempotencyKey: input.key },
    create: {
      idempotencyKey: input.key,
      kind: input.auditAction,
      payload: input.payload
    },
    update: {}
  });
  if (outbox.status === OutboxStatus.DISPATCHED) return;

  try {
    const posted = await dependencies.slack.postMessage(
      input.channelId,
      input.message
    );
    await prisma.$transaction([
      prisma.outboxEvent.update({
        where: { id: outbox.id },
        data: {
          attempts: { increment: 1 },
          dispatchedAt: new Date(),
          lastError: null,
          payload: {
            ...input.payload,
            channelId: posted.channelId,
            messageTs: posted.messageTs
          },
          status: OutboxStatus.DISPATCHED
        }
      }),
      prisma.auditLog.create({
        data: {
          action: input.auditAction,
          changes: {
            channelId: posted.channelId,
            messageTs: posted.messageTs,
            ...input.payload
          },
          entityId: input.entityId,
          entityType: input.entityType
        }
      })
    ]);
  } catch (error) {
    await prisma.outboxEvent.update({
      where: { id: outbox.id },
      data: {
        attempts: { increment: 1 },
        lastError: error instanceof Error ? error.message : String(error),
        status: OutboxStatus.FAILED
      }
    });
    throw error;
  }
}

export async function processHandoffWake(
  prisma: PrismaClient,
  dependencies: CommunicationDeliveryDependencies,
  input: HandoffWorkflowInput,
  now = new Date()
): Promise<CommunicationWakeResult> {
  const key = workflowKey(
    WorkflowKind.HANDOFF,
    input.scheduleId,
    input.generation
  );
  const schedule = await loadSchedule(prisma, input.scheduleId);
  if (
    !schedule ||
    !schedule.active ||
    !schedule.team.active ||
    !schedule.team.handoffMessagesEnabled ||
    !schedule.team.slackChannelId ||
    generation(schedule.updatedAt) !== input.generation
  ) {
    await setRunState(prisma, key, WorkflowStatus.STALE, null);
    return { done: true, sleepUntil: null };
  }

  const run = await prisma.workflowRun.findUnique({
    where: { logicalKey: key }
  });
  const scheduledAt = run?.expectedWakeAt;
  const scheduleSnapshot = snapshot(schedule);
  if (scheduledAt && scheduledAt <= now) {
    const before = resolveScheduleAt(
      scheduleSnapshot,
      new Date(scheduledAt.getTime() - 1)
    );
    const after = resolveScheduleAt(
      scheduleSnapshot,
      new Date(scheduledAt.getTime() + 1)
    );
    const beforeIds = before.map((item) => item.userId).sort();
    const afterIds = after.map((item) => item.userId).sort();
    if (beforeIds.join("|") !== afterIds.join("|")) {
      const [from, to] = await Promise.all([
        userLabels(prisma, dependencies.slack, beforeIds),
        userLabels(prisma, dependencies.slack, afterIds)
      ]);
      const text =
        to.length > 0
          ? `:arrows_counterclockwise: ${to.join(", ")} ${to.length === 1 ? "is" : "are"} now on call for *${schedule.team.name} · ${schedule.name}*${from.length ? `, taking over from ${from.join(", ")}` : ""}.`
          : `:pause_button: *${schedule.team.name} · ${schedule.name}* has no active on-call layer after ${scheduledAt.toISOString()}.`;
      await postOnce(prisma, dependencies, {
        auditAction: "HANDOFF_POSTED",
        channelId: schedule.team.slackChannelId,
        entityId: schedule.id,
        entityType: "Schedule",
        key: `handoff:${schedule.id}:${scheduledAt.toISOString()}`,
        message: genericMessage(text),
        payload: {
          scheduledAt: scheduledAt.toISOString(),
          teamId: schedule.teamId
        }
      });
    }
  }

  const next = findNextScheduleChange(
    scheduleSnapshot,
    scheduledAt && scheduledAt <= now
      ? new Date(scheduledAt.getTime() + 1)
      : now
  );
  if (!next) {
    await setRunState(prisma, key, WorkflowStatus.SUCCEEDED, null);
    return { done: true, sleepUntil: null };
  }
  await setRunState(prisma, key, WorkflowStatus.SLEEPING, next);
  return { done: false, sleepUntil: next.toISOString() };
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "n/a";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

export async function processDigestWake(
  prisma: PrismaClient,
  dependencies: CommunicationDeliveryDependencies,
  input: DigestWorkflowInput,
  now = new Date()
): Promise<CommunicationWakeResult> {
  const key = workflowKey(WorkflowKind.DIGEST, input.teamId, input.generation);
  const team = await prisma.team.findUnique({ where: { id: input.teamId } });
  if (
    !team ||
    !team.active ||
    !team.digestEnabled ||
    !team.slackChannelId ||
    generation(team.updatedAt) !== input.generation
  ) {
    await setRunState(prisma, key, WorkflowStatus.STALE, null);
    return { done: true, sleepUntil: null };
  }

  const run = await prisma.workflowRun.findUnique({
    where: { logicalKey: key }
  });
  const scheduledAt = run?.expectedWakeAt;
  if (scheduledAt && scheduledAt <= now) {
    const from = new Date(scheduledAt.getTime() - 7 * 24 * 60 * 60_000);
    const metrics = await getIncidentAnalytics(prisma, {
      from,
      teamId: team.id,
      to: scheduledAt
    });
    const top = metrics.services[0];
    const text = [
      `*Weekly incident digest · ${team.name}*`,
      `${metrics.incidentCount} incidents · ${metrics.resolvedCount} resolved · ${metrics.openCount} open`,
      `MTTA ${formatDuration(metrics.mttaSeconds)} · MTTR ${formatDuration(metrics.mttrSeconds)} · ${metrics.alertsPerIncident.toFixed(1)} alerts/incident`,
      top
        ? `Noisiest service: *${top.serviceName}* (${top.alertOccurrences} alert occurrences)`
        : "No incident noise this week.",
      dependencies.webBaseUrl
        ? `<${dependencies.webBaseUrl.replace(/\/$/, "")}/analytics?team=${team.id}|Open analytics>`
        : ""
    ]
      .filter(Boolean)
      .join("\n");
    await postOnce(prisma, dependencies, {
      auditAction: "DIGEST_POSTED",
      channelId: team.slackChannelId,
      entityId: team.id,
      entityType: "Team",
      key: `digest:${team.id}:${scheduledAt.toISOString()}`,
      message: genericMessage(text),
      payload: {
        incidentCount: metrics.incidentCount,
        scheduledAt: scheduledAt.toISOString()
      }
    });
  }

  const next = nextWeeklyLocalTime(
    team.timezone,
    team.digestDayOfWeek,
    team.digestLocalTime,
    scheduledAt && scheduledAt <= now
      ? new Date(scheduledAt.getTime() + 1)
      : now
  );
  await setRunState(prisma, key, WorkflowStatus.SLEEPING, next);
  return { done: false, sleepUntil: next.toISOString() };
}
