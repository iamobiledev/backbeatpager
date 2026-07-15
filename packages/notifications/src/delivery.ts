import {
  ActorKind,
  IncidentState,
  NotificationChannel,
  NotificationStatus,
  Severity,
  SlackMessageDestination,
  TimelineEventType,
  type Prisma,
  type PrismaClient,
  type User
} from "@backbeat/db";
import { expandEscalationTargets } from "@backbeat/domain";

import { sendIncidentEmail, type EmailApi } from "./email/client.js";
import type { IncidentMessageModel } from "./slack/incident-message.js";
import { renderSlackIncidentMessage } from "./slack/incident-message.js";
import type { SlackApi, SlackMessageReference } from "./slack/client.js";

export interface NotificationDeliveryDependencies {
  actionSecret: string;
  email?: EmailApi;
  emailFrom?: string;
  slack: SlackApi;
  webBaseUrl?: string;
}

export interface IncidentDeliveryResult {
  emailFailed: number;
  emailSent: number;
  slackFailed: number;
  slackSent: number;
}

interface DeliveryContext {
  incident: Awaited<ReturnType<typeof loadIncident>>;
  model: IncidentMessageModel;
}

function emptyResult(): IncidentDeliveryResult {
  return {
    emailFailed: 0,
    emailSent: 0,
    slackFailed: 0,
    slackSent: 0
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function notificationPreferences(user: User): {
  email: boolean;
  slack: boolean;
} {
  const preferences =
    typeof user.notificationPreferences === "object" &&
    user.notificationPreferences !== null &&
    !Array.isArray(user.notificationPreferences)
      ? user.notificationPreferences
      : {};

  return {
    email: preferences.email === true,
    slack: preferences.slack !== false
  };
}

async function loadIncident(prisma: PrismaClient, incidentId: string) {
  return prisma.incident.findUniqueOrThrow({
    where: { id: incidentId },
    include: {
      assignee: true,
      currentStep: true,
      service: {
        include: {
          team: {
            include: {
              memberships: {
                include: { user: true }
              }
            }
          }
        }
      }
    }
  });
}

async function mapSlackUser(
  prisma: PrismaClient,
  slack: SlackApi,
  user: User
): Promise<string | null> {
  if (user.slackUserId) return user.slackUserId;

  const mapped = await slack.lookupUserByEmail(user.email);
  if (!mapped) return null;

  await prisma.user.update({
    where: { id: user.id },
    data: { slackUserId: mapped.userId }
  });
  return mapped.userId;
}

async function deliveryContext(
  prisma: PrismaClient,
  dependencies: NotificationDeliveryDependencies,
  incidentId: string
): Promise<DeliveryContext> {
  const incident = await loadIncident(prisma, incidentId);
  const assigneeSlackUserId = incident.assignee
    ? await mapSlackUser(prisma, dependencies.slack, incident.assignee)
    : null;

  return {
    incident,
    model: {
      ...(assigneeSlackUserId ? { assigneeSlackUserId } : {}),
      ...(incident.currentStep
        ? {
            escalationLabel: `Loop ${incident.currentEscalationLoop + 1} · Step ${incident.currentStep.position + 1}`
          }
        : {}),
      incidentId: incident.id,
      incidentNumber: incident.number,
      serviceName: incident.service.name,
      severity: incident.severity,
      source: incident.source,
      ...(incident.sourceUrl ? { sourceUrl: incident.sourceUrl } : {}),
      state: incident.state,
      summary: incident.summary,
      version: incident.version,
      ...(dependencies.webBaseUrl
        ? {
            webUrl: `${dependencies.webBaseUrl.replace(/\/$/, "")}/incidents/${incident.number}`
          }
        : {})
    }
  };
}

async function pendingNotification(
  prisma: PrismaClient,
  input: {
    channel: NotificationChannel;
    idempotencyKey: string;
    incidentId: string;
    targetAddress: string;
    targetUserId?: string;
  }
) {
  return prisma.notificationLog.upsert({
    where: { idempotencyKey: input.idempotencyKey },
    create: {
      channel: input.channel,
      idempotencyKey: input.idempotencyKey,
      incidentId: input.incidentId,
      status: NotificationStatus.PENDING,
      targetAddress: input.targetAddress,
      ...(input.targetUserId ? { targetUserId: input.targetUserId } : {})
    },
    update: {}
  });
}

async function recordSent(
  prisma: PrismaClient,
  notificationId: string,
  input: {
    channelId?: string;
    incidentId: string;
    messageTs?: string;
    providerMessageId?: string;
    timelineKey: string;
  }
): Promise<void> {
  const now = new Date();
  await prisma.$transaction([
    prisma.notificationLog.update({
      where: { id: notificationId },
      data: {
        attempt: { increment: 1 },
        attemptedAt: now,
        deliveredAt: now,
        errorCode: null,
        errorMessage: null,
        ...(input.providerMessageId
          ? { providerMessageId: input.providerMessageId }
          : {}),
        ...(input.channelId ? { slackChannelId: input.channelId } : {}),
        ...(input.messageTs ? { slackMessageTs: input.messageTs } : {}),
        status: NotificationStatus.SENT
      }
    }),
    prisma.incidentTimelineEntry.upsert({
      where: { idempotencyKey: input.timelineKey },
      create: {
        actorKind: ActorKind.SYSTEM,
        idempotencyKey: input.timelineKey,
        incidentId: input.incidentId,
        message: "Notification sent",
        metadata: {
          ...(input.channelId ? { channelId: input.channelId } : {}),
          ...(input.messageTs ? { messageTs: input.messageTs } : {}),
          ...(input.providerMessageId
            ? { providerMessageId: input.providerMessageId }
            : {})
        },
        type: TimelineEventType.NOTIFICATION_SENT
      },
      update: {}
    })
  ]);
}

async function recordFailure(
  prisma: PrismaClient,
  notificationId: string,
  input: {
    error: unknown;
    incidentId: string;
    timelineKey: string;
  }
): Promise<void> {
  const message = errorMessage(input.error);
  await prisma.$transaction([
    prisma.notificationLog.update({
      where: { id: notificationId },
      data: {
        attempt: { increment: 1 },
        attemptedAt: new Date(),
        errorCode: "PROVIDER_ERROR",
        errorMessage: message,
        status: NotificationStatus.FAILED
      }
    }),
    prisma.incidentTimelineEntry.upsert({
      where: { idempotencyKey: input.timelineKey },
      create: {
        actorKind: ActorKind.SYSTEM,
        idempotencyKey: input.timelineKey,
        incidentId: input.incidentId,
        message: `Notification failed: ${message}`,
        metadata: { error: message },
        type: TimelineEventType.NOTIFICATION_FAILED
      },
      update: {}
    })
  ]);
}

async function storeSlackMessage(
  prisma: PrismaClient,
  input: {
    destination: SlackMessageDestination;
    destinationKey: string;
    incidentId: string;
    reference: SlackMessageReference;
    renderVersion: number;
    targetUserId?: string;
  }
): Promise<void> {
  await prisma.slackMessage.upsert({
    where: { destinationKey: input.destinationKey },
    create: {
      channelId: input.reference.channelId,
      destination: input.destination,
      destinationKey: input.destinationKey,
      incidentId: input.incidentId,
      messageTs: input.reference.messageTs,
      renderVersion: input.renderVersion,
      ...(input.targetUserId ? { targetUserId: input.targetUserId } : {})
    },
    update: {
      channelId: input.reference.channelId,
      messageTs: input.reference.messageTs,
      renderVersion: input.renderVersion
    }
  });
}

async function sendSlackPage(
  prisma: PrismaClient,
  dependencies: NotificationDeliveryDependencies,
  context: DeliveryContext,
  user: User,
  kind: "nag" | "page",
  sequence: number
): Promise<boolean> {
  if (!notificationPreferences(user).slack) return true;

  const key = `incident:${context.incident.id}:${kind}:${sequence}:slack:user:${user.id}`;
  const existing = await prisma.notificationLog.findUnique({
    where: { idempotencyKey: key }
  });
  if (existing?.status === NotificationStatus.SENT) return true;

  let slackUserId: string | null;
  try {
    slackUserId = await mapSlackUser(prisma, dependencies.slack, user);
  } catch (error) {
    const notification = await pendingNotification(prisma, {
      channel: NotificationChannel.SLACK,
      idempotencyKey: key,
      incidentId: context.incident.id,
      targetAddress: "unmapped",
      targetUserId: user.id
    });
    await recordFailure(prisma, notification.id, {
      error,
      incidentId: context.incident.id,
      timelineKey: `${key}:failed`
    });
    return false;
  }

  const notification = await pendingNotification(prisma, {
    channel: NotificationChannel.SLACK,
    idempotencyKey: key,
    incidentId: context.incident.id,
    targetAddress: slackUserId ?? "unmapped",
    targetUserId: user.id
  });
  if (!slackUserId) {
    await recordFailure(prisma, notification.id, {
      error: new Error(
        `Slack user is not mapped for app user ${user.id}; ask an administrator to link the account`
      ),
      incidentId: context.incident.id,
      timelineKey: `${key}:failed`
    });
    return false;
  }

  try {
    const conversation = await dependencies.slack.openConversation(slackUserId);
    const message = renderSlackIncidentMessage(
      context.model,
      dependencies.actionSecret
    );
    const destinationKey = `incident:${context.incident.id}:dm:${user.id}:${kind}:${sequence}`;
    const stored = await prisma.slackMessage.findUnique({
      where: { destinationKey }
    });
    let reference: SlackMessageReference;
    if (stored) {
      reference = {
        channelId: stored.channelId,
        messageTs: stored.messageTs
      };
      await dependencies.slack.updateMessage(reference, message);
    } else {
      reference = await dependencies.slack.postMessage(
        conversation.channelId,
        message
      );
      await storeSlackMessage(prisma, {
        destination: SlackMessageDestination.DM,
        destinationKey,
        incidentId: context.incident.id,
        reference,
        renderVersion: context.incident.version,
        targetUserId: user.id
      });
    }
    await recordSent(prisma, notification.id, {
      channelId: reference.channelId,
      incidentId: context.incident.id,
      messageTs: reference.messageTs,
      timelineKey: `${key}:sent`
    });
    return true;
  } catch (error) {
    await recordFailure(prisma, notification.id, {
      error,
      incidentId: context.incident.id,
      timelineKey: `${key}:failed`
    });
    return false;
  }
}

async function sendEmailPage(
  prisma: PrismaClient,
  dependencies: NotificationDeliveryDependencies,
  context: DeliveryContext,
  user: User,
  sequence: number
): Promise<boolean> {
  if (
    !dependencies.email ||
    !dependencies.emailFrom ||
    !notificationPreferences(user).email
  ) {
    return true;
  }

  const key = `incident:${context.incident.id}:page:${sequence}:email:user:${user.id}`;
  const notification = await pendingNotification(prisma, {
    channel: NotificationChannel.EMAIL,
    idempotencyKey: key,
    incidentId: context.incident.id,
    targetAddress: user.email,
    targetUserId: user.id
  });
  if (notification.status === NotificationStatus.SENT) return true;

  try {
    const sent = await sendIncidentEmail(dependencies.email, context.model, {
      from: dependencies.emailFrom,
      idempotencyKey: key,
      to: user.email
    });
    await recordSent(prisma, notification.id, {
      incidentId: context.incident.id,
      providerMessageId: sent.messageId,
      timelineKey: `${key}:sent`
    });
    return true;
  } catch (error) {
    await recordFailure(prisma, notification.id, {
      error,
      incidentId: context.incident.id,
      timelineKey: `${key}:failed`
    });
    return false;
  }
}

async function syncServiceChannel(
  prisma: PrismaClient,
  dependencies: NotificationDeliveryDependencies,
  context: DeliveryContext
): Promise<boolean> {
  const channelId = context.incident.service.slackChannelId;
  if (!channelId) return true;

  const key = `incident:${context.incident.id}:service-channel`;
  const notification = await pendingNotification(prisma, {
    channel: NotificationChannel.SLACK,
    idempotencyKey: `${key}:version:${context.incident.version}`,
    incidentId: context.incident.id,
    targetAddress: channelId
  });
  try {
    const message = renderSlackIncidentMessage(
      context.model,
      dependencies.actionSecret
    );
    const stored = await prisma.slackMessage.findUnique({
      where: { destinationKey: key }
    });
    let reference: SlackMessageReference;
    if (stored) {
      reference = {
        channelId: stored.channelId,
        messageTs: stored.messageTs
      };
      await dependencies.slack.updateMessage(reference, message);
    } else {
      reference = await dependencies.slack.postMessage(channelId, message);
      await storeSlackMessage(prisma, {
        destination: SlackMessageDestination.SERVICE_CHANNEL,
        destinationKey: key,
        incidentId: context.incident.id,
        reference,
        renderVersion: context.incident.version
      });
    }
    await recordSent(prisma, notification.id, {
      channelId: reference.channelId,
      incidentId: context.incident.id,
      messageTs: reference.messageTs,
      timelineKey: `${notification.idempotencyKey}:sent`
    });
    return true;
  } catch (error) {
    await recordFailure(prisma, notification.id, {
      error,
      incidentId: context.incident.id,
      timelineKey: `${notification.idempotencyKey}:failed`
    });
    return false;
  }
}

function nagIntervalMinutes(
  nagIntervals: Prisma.JsonValue,
  severity: Severity
): number | null {
  if (
    typeof nagIntervals !== "object" ||
    nagIntervals === null ||
    Array.isArray(nagIntervals)
  ) {
    return null;
  }
  const value = nagIntervals[severity];
  return typeof value === "number" && value > 0 ? value : null;
}

async function targetUsers(
  prisma: PrismaClient,
  incident: DeliveryContext["incident"],
  at: Date
): Promise<User[]> {
  const ids = incident.currentStepId
    ? await prisma.$transaction((transaction) =>
        expandEscalationTargets(transaction, incident.currentStepId!, at)
      )
    : incident.assigneeId
      ? [incident.assigneeId]
      : [];
  return prisma.user.findMany({
    where: { active: true, id: { in: ids } }
  });
}

function incidentChannelName(number: number, summary: string): string {
  const slug = summary
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 55);
  return `inc-${number}-${slug || "incident"}`.slice(0, 80);
}

async function ensureIncidentChannel(
  prisma: PrismaClient,
  dependencies: NotificationDeliveryDependencies,
  context: DeliveryContext,
  users: User[]
): Promise<boolean> {
  if (context.incident.incidentSlackChannelId) return true;

  const key = `incident:${context.incident.id}:incident-channel`;
  const notification = await pendingNotification(prisma, {
    channel: NotificationChannel.SLACK,
    idempotencyKey: key,
    incidentId: context.incident.id,
    targetAddress: "incident-channel"
  });
  try {
    const channel = await dependencies.slack.createConversation(
      incidentChannelName(context.incident.number, context.incident.summary),
      context.incident.service.incidentChannelsPrivate
    );
    const slackUserIds = (
      await Promise.all(
        users.map((user) => mapSlackUser(prisma, dependencies.slack, user))
      )
    ).filter((userId): userId is string => Boolean(userId));
    await dependencies.slack.inviteUsers(channel.channelId, [
      ...new Set(slackUserIds)
    ]);
    const message = renderSlackIncidentMessage(
      context.model,
      dependencies.actionSecret
    );
    const reference = await dependencies.slack.postMessage(
      channel.channelId,
      message
    );
    await dependencies.slack.pinMessage(
      reference.channelId,
      reference.messageTs
    );
    await prisma.$transaction([
      prisma.incident.update({
        where: { id: context.incident.id },
        data: {
          incidentChannelDeadline: null,
          incidentSlackChannelId: reference.channelId,
          incidentStatusMessageTs: reference.messageTs,
          version: { increment: 1 }
        }
      }),
      prisma.slackMessage.create({
        data: {
          channelId: reference.channelId,
          destination: SlackMessageDestination.INCIDENT_CHANNEL,
          destinationKey: key,
          incidentId: context.incident.id,
          messageTs: reference.messageTs,
          renderVersion: context.incident.version
        }
      }),
      prisma.incidentTimelineEntry.upsert({
        where: { idempotencyKey: `${key}:created` },
        create: {
          actorKind: ActorKind.SYSTEM,
          idempotencyKey: `${key}:created`,
          incidentId: context.incident.id,
          message: `Slack incident channel ${reference.channelId} created`,
          metadata: {
            channelId: reference.channelId
          },
          type: TimelineEventType.INCIDENT_CHANNEL_CREATED
        },
        update: {}
      })
    ]);
    await recordSent(prisma, notification.id, {
      channelId: reference.channelId,
      incidentId: context.incident.id,
      messageTs: reference.messageTs,
      timelineKey: `${key}:sent`
    });
    return true;
  } catch (error) {
    await prisma.incident.update({
      where: { id: context.incident.id },
      data: {
        incidentChannelDeadline: new Date(Date.now() + 60_000)
      }
    });
    await recordFailure(prisma, notification.id, {
      error,
      incidentId: context.incident.id,
      timelineKey: `${key}:failed`
    });
    return false;
  }
}

export async function synchronizeIncidentMessages(
  prisma: PrismaClient,
  dependencies: NotificationDeliveryDependencies,
  incidentId: string
): Promise<IncidentDeliveryResult> {
  const result = emptyResult();
  const context = await deliveryContext(prisma, dependencies, incidentId);
  const message = renderSlackIncidentMessage(
    context.model,
    dependencies.actionSecret
  );
  const storedMessages = await prisma.slackMessage.findMany({
    where: { incidentId }
  });

  for (const stored of storedMessages) {
    try {
      await dependencies.slack.updateMessage(
        { channelId: stored.channelId, messageTs: stored.messageTs },
        message
      );
      await prisma.slackMessage.update({
        where: { id: stored.id },
        data: { renderVersion: context.incident.version }
      });
      result.slackSent += 1;
    } catch (error) {
      const notification = await pendingNotification(prisma, {
        channel: NotificationChannel.SLACK,
        idempotencyKey: `incident:${incidentId}:sync:${stored.id}:version:${context.incident.version}`,
        incidentId,
        targetAddress: stored.channelId,
        ...(stored.targetUserId ? { targetUserId: stored.targetUserId } : {})
      });
      await recordFailure(prisma, notification.id, {
        error,
        incidentId,
        timelineKey: `${notification.idempotencyKey}:failed`
      });
      result.slackFailed += 1;
    }
  }

  if (result.slackSent > 0) {
    await prisma.incidentTimelineEntry.upsert({
      where: {
        idempotencyKey: `incident:${incidentId}:slack-sync:version:${context.incident.version}`
      },
      create: {
        actorKind: ActorKind.SYSTEM,
        idempotencyKey: `incident:${incidentId}:slack-sync:version:${context.incident.version}`,
        incidentId,
        message: "Slack incident messages updated",
        metadata: { messageCount: result.slackSent },
        type: TimelineEventType.SLACK_MESSAGE_UPDATED
      },
      update: {}
    });
  }

  return result;
}

export async function deliverIncidentGeneration(
  prisma: PrismaClient,
  dependencies: NotificationDeliveryDependencies,
  incidentId: string,
  generation: number,
  now = new Date()
): Promise<IncidentDeliveryResult> {
  const result = emptyResult();
  const context = await deliveryContext(prisma, dependencies, incidentId);

  if (context.incident.escalationGeneration !== generation) return result;

  const serviceChannelSent = await syncServiceChannel(
    prisma,
    dependencies,
    context
  );
  if (serviceChannelSent) result.slackSent += 1;
  else result.slackFailed += 1;

  if (context.incident.state !== IncidentState.TRIGGERED) {
    const synchronized = await synchronizeIncidentMessages(
      prisma,
      dependencies,
      incidentId
    );
    result.slackSent += synchronized.slackSent;
    result.slackFailed += synchronized.slackFailed;
    return result;
  }

  const users = await targetUsers(prisma, context.incident, now);
  const pagePrefix = `incident:${incidentId}:page:${generation}:`;
  const initialPageCount = await prisma.notificationLog.count({
    where: {
      idempotencyKey: { startsWith: pagePrefix },
      incidentId
    }
  });
  const snoozed =
    context.incident.snoozedUntil && context.incident.snoozedUntil > now;

  if (initialPageCount === 0 && !snoozed) {
    for (const user of users) {
      const slackSent = await sendSlackPage(
        prisma,
        dependencies,
        context,
        user,
        "page",
        generation
      );
      if (slackSent) result.slackSent += 1;
      else result.slackFailed += 1;

      const emailSent = await sendEmailPage(
        prisma,
        dependencies,
        context,
        user,
        generation
      );
      if (emailSent) result.emailSent += 1;
      else result.emailFailed += 1;
    }

    const interval = nagIntervalMinutes(
      context.incident.service.nagIntervals,
      context.incident.severity
    );
    if (interval) {
      await prisma.incident.update({
        where: { id: incidentId },
        data: {
          nagDeadline: new Date(now.getTime() + interval * 60_000)
        }
      });
    }
  } else if (
    initialPageCount > 0 &&
    context.incident.nagDeadline &&
    context.incident.nagDeadline <= now &&
    !snoozed
  ) {
    const nextNagGeneration = context.incident.nagGeneration + 1;
    for (const user of users) {
      const sent = await sendSlackPage(
        prisma,
        dependencies,
        context,
        user,
        "nag",
        nextNagGeneration
      );
      if (sent) result.slackSent += 1;
      else result.slackFailed += 1;
    }
    const interval = nagIntervalMinutes(
      context.incident.service.nagIntervals,
      context.incident.severity
    );
    await prisma.incident.update({
      where: { id: incidentId },
      data: {
        nagDeadline: interval
          ? new Date(now.getTime() + interval * 60_000)
          : null,
        nagGeneration: nextNagGeneration
      }
    });
  }

  if (
    context.incident.incidentChannelDeadline &&
    context.incident.incidentChannelDeadline <= now &&
    context.incident.severity === Severity.CRITICAL
  ) {
    const created = await ensureIncidentChannel(prisma, dependencies, context, [
      ...users,
      ...context.incident.service.team.memberships.map(
        (membership) => membership.user
      )
    ]);
    if (created) result.slackSent += 1;
    else result.slackFailed += 1;
  }

  return result;
}
