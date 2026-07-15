import {
  ActorKind,
  AlertAction,
  AlertStatus,
  IncidentState,
  TimelineEventType,
  type Incident,
  type Prisma,
  type PrismaClient,
  type Severity
} from "@backbeat/db";

import {
  advanceEscalationCursor,
  firstEscalationStep,
  type EscalationAdvance
} from "../escalation/cursor.js";
import { expandEscalationTargets } from "../escalation/targets.js";
import { DomainError } from "./errors.js";

export interface IncidentActor {
  kind: ActorKind;
  slackUserId?: string;
  userId?: string;
}

export interface IncidentActionResult {
  changed: boolean;
  incident: Incident;
  targetUserIds: string[];
}

export interface TriggerIncidentInput {
  actor?: IncidentActor;
  dedupKey: string;
  idempotencyKey: string;
  now?: Date;
  payload: Prisma.InputJsonValue;
  requestHash?: string;
  requestId?: string;
  serviceId: string;
  severity: Severity;
  source: string;
  sourceUrl?: string;
  summary: string;
}

export interface IncidentReference {
  dedupKey?: string;
  incidentId?: string;
  serviceId?: string;
}

export interface IncidentMutationInput {
  actor: IncidentActor;
  alertEvent?: {
    payload: Prisma.InputJsonValue;
    requestHash?: string;
    requestId?: string;
  };
  idempotencyKey: string;
  now?: Date;
  reference: IncidentReference;
}

export interface ResolveIncidentInput extends IncidentMutationInput {
  note?: string;
}

export interface ReassignIncidentInput extends IncidentMutationInput {
  assigneeId: string;
}

export interface AdvanceIncidentInput extends IncidentMutationInput {
  expectedGeneration?: number;
  requireDeadline?: boolean;
}

const OPEN_STATES = [IncidentState.TRIGGERED, IncidentState.ACKNOWLEDGED];

async function lock(
  transaction: Prisma.TransactionClient,
  key: string
): Promise<void> {
  await transaction.$queryRaw`
    SELECT 1::int AS "locked"
    FROM pg_advisory_xact_lock(hashtextextended(${key}, 0))
  `;
}

function actorData(actor: IncidentActor | undefined): {
  actorKind: ActorKind;
  actorUserId?: string;
  slackUserId?: string;
} {
  return {
    actorKind: actor?.kind ?? ActorKind.INTEGRATION,
    ...(actor?.userId ? { actorUserId: actor.userId } : {}),
    ...(actor?.slackUserId ? { slackUserId: actor.slackUserId } : {})
  };
}

async function findIncident(
  transaction: Prisma.TransactionClient,
  reference: IncidentReference
): Promise<Incident | null> {
  if (reference.incidentId) {
    return transaction.incident.findUnique({
      where: { id: reference.incidentId }
    });
  }

  if (reference.serviceId && reference.dedupKey) {
    return transaction.incident.findFirst({
      where: {
        dedupKey: reference.dedupKey,
        serviceId: reference.serviceId,
        state: { in: OPEN_STATES }
      },
      orderBy: { openedAt: "desc" }
    });
  }

  return null;
}

async function idempotentIncidentResult(
  transaction: Prisma.TransactionClient,
  idempotencyKey: string
): Promise<IncidentActionResult | null> {
  const timeline = await transaction.incidentTimelineEntry.findUnique({
    where: { idempotencyKey },
    include: { incident: true }
  });

  return timeline
    ? {
        changed: false,
        incident: timeline.incident,
        targetUserIds: []
      }
    : null;
}

async function enqueueIncidentWorkflow(
  transaction: Prisma.TransactionClient,
  incident: Incident,
  reason: string,
  idempotencyKey: string
): Promise<void> {
  await transaction.outboxEvent.upsert({
    where: { idempotencyKey },
    create: {
      idempotencyKey,
      kind: "INCIDENT_GENERATION_REQUESTED",
      payload: {
        generation: incident.escalationGeneration,
        incidentId: incident.id,
        reason
      }
    },
    update: {}
  });
}

async function escalationPolicy(
  transaction: Prisma.TransactionClient,
  serviceId: string
) {
  const service = await transaction.service.findUniqueOrThrow({
    where: { id: serviceId },
    include: {
      escalationPolicy: {
        include: {
          steps: {
            orderBy: { position: "asc" }
          }
        }
      }
    }
  });

  return service.escalationPolicy;
}

async function recordAlertAction(
  transaction: Prisma.TransactionClient,
  reference: IncidentReference,
  event: IncidentMutationInput["alertEvent"],
  action: AlertAction,
  status: AlertStatus
): Promise<void> {
  if (!event || !reference.serviceId || !reference.dedupKey) return;

  if (event.requestId) {
    const existing = await transaction.alertOccurrence.findUnique({
      where: { requestId: event.requestId }
    });
    if (existing) return;
  }

  const alert = await transaction.alert.findUnique({
    where: {
      serviceId_dedupKey: {
        dedupKey: reference.dedupKey,
        serviceId: reference.serviceId
      }
    }
  });
  if (!alert) return;

  await transaction.alert.update({
    where: { id: alert.id },
    data: {
      lastSeenAt: new Date(),
      status,
      occurrences: {
        create: {
          action,
          payload: event.payload,
          ...(event.requestHash ? { requestHash: event.requestHash } : {}),
          ...(event.requestId ? { requestId: event.requestId } : {})
        }
      }
    }
  });
}

function deadlineFor(step: { timeoutMinutes: number }, now: Date): Date {
  return new Date(now.getTime() + step.timeoutMinutes * 60_000);
}

export async function triggerIncident(
  prisma: PrismaClient,
  input: TriggerIncidentInput
): Promise<IncidentActionResult> {
  return prisma.$transaction(async (transaction) => {
    await lock(transaction, `alert:${input.serviceId}:${input.dedupKey}`);

    if (input.requestId) {
      const occurrence = await transaction.alertOccurrence.findUnique({
        where: { requestId: input.requestId }
      });
      if (occurrence) {
        const incident = await transaction.incident.findFirst({
          where: {
            alerts: { some: { alertId: occurrence.alertId } }
          },
          orderBy: { openedAt: "desc" }
        });
        if (incident) {
          return { changed: false, incident, targetUserIds: [] };
        }
      }
    }

    const now = input.now ?? new Date();
    const alert = await transaction.alert.upsert({
      where: {
        serviceId_dedupKey: {
          dedupKey: input.dedupKey,
          serviceId: input.serviceId
        }
      },
      create: {
        dedupKey: input.dedupKey,
        latestPayload: input.payload,
        serviceId: input.serviceId,
        severity: input.severity,
        source: input.source,
        status: AlertStatus.TRIGGERED
      },
      update: {
        lastSeenAt: now,
        latestPayload: input.payload,
        occurrenceCount: { increment: 1 },
        severity: input.severity,
        source: input.source,
        status: AlertStatus.TRIGGERED
      }
    });

    await transaction.alertOccurrence.create({
      data: {
        action: AlertAction.TRIGGER,
        alertId: alert.id,
        payload: input.payload,
        ...(input.requestHash ? { requestHash: input.requestHash } : {}),
        ...(input.requestId ? { requestId: input.requestId } : {})
      }
    });

    const existing = await transaction.incident.findFirst({
      where: {
        dedupKey: input.dedupKey,
        serviceId: input.serviceId,
        state: { in: OPEN_STATES }
      },
      orderBy: { openedAt: "desc" }
    });

    if (existing) {
      const incident = await transaction.incident.update({
        where: { id: existing.id },
        data: {
          severity: input.severity,
          source: input.source,
          sourceUrl: input.sourceUrl ?? null,
          summary: input.summary,
          version: { increment: 1 },
          alerts: {
            connectOrCreate: {
              where: {
                incidentId_alertId: {
                  alertId: alert.id,
                  incidentId: existing.id
                }
              },
              create: { alertId: alert.id }
            }
          },
          timelineEntries: {
            create: {
              ...actorData(input.actor),
              idempotencyKey: input.idempotencyKey,
              message: "Alert retriggered and grouped into the open incident",
              metadata: {
                alertId: alert.id
              },
              type: TimelineEventType.INCIDENT_RETRIGGERED
            }
          }
        }
      });

      return { changed: true, incident, targetUserIds: [] };
    }

    const policy = await escalationPolicy(transaction, input.serviceId);
    const first = firstEscalationStep(policy.steps);
    const targets = first.exhausted
      ? []
      : await expandEscalationTargets(transaction, first.step.id, now);
    const generation = 1;

    const incident = await transaction.incident.create({
      data: {
        assigneeId: targets[0] ?? null,
        currentEscalationLoop: first.exhausted ? 0 : first.next.loop,
        currentEscalationPosition: first.exhausted ? 0 : first.next.position,
        currentStepId: first.exhausted ? null : first.step.id,
        dedupKey: input.dedupKey,
        escalationDeadline: first.exhausted
          ? null
          : deadlineFor(first.step, now),
        escalationGeneration: generation,
        serviceId: input.serviceId,
        severity: input.severity,
        source: input.source,
        sourceUrl: input.sourceUrl ?? null,
        summary: input.summary,
        alerts: {
          create: { alertId: alert.id }
        },
        timelineEntries: {
          create: [
            {
              ...actorData(input.actor),
              idempotencyKey: input.idempotencyKey,
              message: "Incident triggered",
              metadata: {
                alertId: alert.id,
                dedupKey: input.dedupKey
              },
              type: TimelineEventType.INCIDENT_TRIGGERED
            },
            ...(first.exhausted
              ? [
                  {
                    actorKind: ActorKind.SYSTEM,
                    idempotencyKey: `${input.idempotencyKey}:exhausted`,
                    message: "Escalation policy has no steps",
                    metadata: {},
                    type: TimelineEventType.ESCALATION_EXHAUSTED
                  }
                ]
              : [
                  {
                    actorKind: ActorKind.SYSTEM,
                    idempotencyKey: `${input.idempotencyKey}:escalation`,
                    message: "Escalation started",
                    metadata: {
                      loop: first.next.loop,
                      position: first.next.position,
                      targetUserIds: targets
                    },
                    type: TimelineEventType.ESCALATION_STARTED
                  }
                ])
          ]
        }
      }
    });

    await enqueueIncidentWorkflow(
      transaction,
      incident,
      "triggered",
      `incident:${incident.id}:generation:${generation}`
    );

    return { changed: true, incident, targetUserIds: targets };
  });
}

export async function acknowledgeIncident(
  prisma: PrismaClient,
  input: IncidentMutationInput
): Promise<IncidentActionResult> {
  return prisma.$transaction(async (transaction) => {
    const idempotent = await idempotentIncidentResult(
      transaction,
      input.idempotencyKey
    );
    if (idempotent) return idempotent;

    const incident = await findIncident(transaction, input.reference);
    if (!incident) {
      throw new DomainError(
        "INCIDENT_NOT_FOUND",
        "No open incident matches this reference",
        404
      );
    }
    await lock(transaction, `incident:${incident.id}`);

    const current = await transaction.incident.findUniqueOrThrow({
      where: { id: incident.id },
      include: {
        service: {
          include: { escalationPolicy: true }
        }
      }
    });
    await recordAlertAction(
      transaction,
      input.reference,
      input.alertEvent,
      AlertAction.ACKNOWLEDGE,
      AlertStatus.ACKNOWLEDGED
    );

    if (current.state === IncidentState.ACKNOWLEDGED) {
      return { changed: false, incident: current, targetUserIds: [] };
    }
    if (current.state === IncidentState.RESOLVED) {
      throw new DomainError(
        "INVALID_INCIDENT_TRANSITION",
        "A resolved incident cannot be acknowledged",
        409
      );
    }

    const now = input.now ?? new Date();
    const acknowledgementTimeout =
      current.service.escalationPolicy.acknowledgementTimeoutMinutes;
    const generation = current.escalationGeneration + 1;
    const updated = await transaction.incident.update({
      where: { id: current.id },
      data: {
        acknowledgementExpiresAt: acknowledgementTimeout
          ? new Date(now.getTime() + acknowledgementTimeout * 60_000)
          : null,
        acknowledgedAt: current.acknowledgedAt ?? now,
        escalationDeadline: null,
        escalationGeneration: generation,
        nagDeadline: null,
        nagGeneration: { increment: 1 },
        snoozedUntil: null,
        state: IncidentState.ACKNOWLEDGED,
        version: { increment: 1 },
        timelineEntries: {
          create: {
            ...actorData(input.actor),
            idempotencyKey: input.idempotencyKey,
            message: "Incident acknowledged",
            metadata: {},
            type: TimelineEventType.INCIDENT_ACKNOWLEDGED
          }
        }
      }
    });

    await enqueueIncidentWorkflow(
      transaction,
      updated,
      "acknowledged",
      `incident:${updated.id}:generation:${generation}`
    );

    return { changed: true, incident: updated, targetUserIds: [] };
  });
}

export async function resolveIncident(
  prisma: PrismaClient,
  input: ResolveIncidentInput
): Promise<IncidentActionResult> {
  return prisma.$transaction(async (transaction) => {
    const idempotent = await idempotentIncidentResult(
      transaction,
      input.idempotencyKey
    );
    if (idempotent) return idempotent;

    let incident = await findIncident(transaction, input.reference);
    if (!incident && input.reference.serviceId && input.reference.dedupKey) {
      incident = await transaction.incident.findFirst({
        where: {
          dedupKey: input.reference.dedupKey,
          serviceId: input.reference.serviceId
        },
        orderBy: { openedAt: "desc" }
      });
    }
    if (!incident) {
      throw new DomainError(
        "INCIDENT_NOT_FOUND",
        "No incident matches this reference",
        404
      );
    }
    await lock(transaction, `incident:${incident.id}`);

    const current = await transaction.incident.findUniqueOrThrow({
      where: { id: incident.id }
    });
    await recordAlertAction(
      transaction,
      input.reference,
      input.alertEvent,
      AlertAction.RESOLVE,
      AlertStatus.RESOLVED
    );
    if (current.state === IncidentState.RESOLVED) {
      return { changed: false, incident: current, targetUserIds: [] };
    }

    const now = input.now ?? new Date();
    const generation = current.escalationGeneration + 1;
    const updated = await transaction.incident.update({
      where: { id: current.id },
      data: {
        acknowledgementExpiresAt: null,
        escalationDeadline: null,
        escalationGeneration: generation,
        nagDeadline: null,
        nagGeneration: { increment: 1 },
        resolvedAt: now,
        snoozedUntil: null,
        state: IncidentState.RESOLVED,
        version: { increment: 1 },
        timelineEntries: {
          create: {
            ...actorData(input.actor),
            idempotencyKey: input.idempotencyKey,
            message: input.note
              ? `Incident resolved: ${input.note}`
              : "Incident resolved",
            metadata: input.note ? { note: input.note } : {},
            type: TimelineEventType.INCIDENT_RESOLVED
          }
        }
      }
    });

    await transaction.alert.updateMany({
      where: {
        incidents: { some: { incidentId: updated.id } }
      },
      data: { status: AlertStatus.RESOLVED }
    });
    await enqueueIncidentWorkflow(
      transaction,
      updated,
      "resolved",
      `incident:${updated.id}:generation:${generation}`
    );

    return { changed: true, incident: updated, targetUserIds: [] };
  });
}

export async function reassignIncident(
  prisma: PrismaClient,
  input: ReassignIncidentInput
): Promise<IncidentActionResult> {
  return prisma.$transaction(async (transaction) => {
    const idempotent = await idempotentIncidentResult(
      transaction,
      input.idempotencyKey
    );
    if (idempotent) return idempotent;

    const incident = await findIncident(transaction, input.reference);
    if (!incident) {
      throw new DomainError(
        "INCIDENT_NOT_FOUND",
        "No open incident matches this reference",
        404
      );
    }
    await lock(transaction, `incident:${incident.id}`);

    const assignee = await transaction.user.findFirst({
      where: { active: true, id: input.assigneeId }
    });
    if (!assignee) {
      throw new DomainError(
        "INVALID_INCIDENT_TRANSITION",
        "The requested assignee is not active",
        409
      );
    }

    const updated = await transaction.incident.update({
      where: { id: incident.id },
      data: {
        assigneeId: assignee.id,
        version: { increment: 1 },
        timelineEntries: {
          create: {
            ...actorData(input.actor),
            idempotencyKey: input.idempotencyKey,
            message: `Incident reassigned to ${assignee.name}`,
            metadata: { assigneeId: assignee.id },
            type: TimelineEventType.INCIDENT_REASSIGNED
          }
        }
      }
    });

    await enqueueIncidentWorkflow(
      transaction,
      updated,
      "reassigned",
      `incident:${updated.id}:reassign:${input.idempotencyKey}`
    );

    return {
      changed: true,
      incident: updated,
      targetUserIds: [assignee.id]
    };
  });
}

export async function snoozeIncident(
  prisma: PrismaClient,
  input: IncidentMutationInput,
  durationMinutes = 15
): Promise<IncidentActionResult> {
  return prisma.$transaction(async (transaction) => {
    const idempotent = await idempotentIncidentResult(
      transaction,
      input.idempotencyKey
    );
    if (idempotent) return idempotent;

    const incident = await findIncident(transaction, input.reference);
    if (!incident) {
      throw new DomainError(
        "INCIDENT_NOT_FOUND",
        "No open incident matches this reference",
        404
      );
    }
    await lock(transaction, `incident:${incident.id}`);

    const current = await transaction.incident.findUniqueOrThrow({
      where: { id: incident.id }
    });
    if (current.state !== IncidentState.TRIGGERED) {
      throw new DomainError(
        "INVALID_INCIDENT_TRANSITION",
        "Only triggered incidents can be snoozed",
        409
      );
    }

    const now = input.now ?? new Date();
    const snoozedUntil = new Date(now.getTime() + durationMinutes * 60_000);
    const generation = current.escalationGeneration + 1;
    const updated = await transaction.incident.update({
      where: { id: current.id },
      data: {
        escalationDeadline: snoozedUntil,
        escalationGeneration: generation,
        nagDeadline: snoozedUntil,
        nagGeneration: { increment: 1 },
        snoozedUntil,
        version: { increment: 1 },
        timelineEntries: {
          create: {
            ...actorData(input.actor),
            idempotencyKey: input.idempotencyKey,
            message: `Incident notifications snoozed for ${durationMinutes} minutes`,
            metadata: {
              durationMinutes,
              snoozedUntil: snoozedUntil.toISOString()
            },
            type: TimelineEventType.INCIDENT_SNOOZED
          }
        }
      }
    });

    await enqueueIncidentWorkflow(
      transaction,
      updated,
      "snoozed",
      `incident:${updated.id}:generation:${generation}`
    );

    return { changed: true, incident: updated, targetUserIds: [] };
  });
}

async function advanceResult(
  transaction: Prisma.TransactionClient,
  current: Incident,
  advance: EscalationAdvance,
  input: AdvanceIncidentInput,
  now: Date
): Promise<IncidentActionResult> {
  const generation = current.escalationGeneration + 1;

  if (advance.exhausted) {
    const updated = await transaction.incident.update({
      where: { id: current.id },
      data: {
        escalationDeadline: null,
        escalationGeneration: generation,
        version: { increment: 1 },
        timelineEntries: {
          create: {
            ...actorData(input.actor),
            idempotencyKey: input.idempotencyKey,
            message: "Escalation policy exhausted",
            metadata: {
              loop: current.currentEscalationLoop,
              position: current.currentEscalationPosition
            },
            type: TimelineEventType.ESCALATION_EXHAUSTED
          }
        }
      }
    });

    return { changed: true, incident: updated, targetUserIds: [] };
  }

  const targets = await expandEscalationTargets(
    transaction,
    advance.step.id,
    now
  );
  const updated = await transaction.incident.update({
    where: { id: current.id },
    data: {
      assigneeId: targets[0] ?? current.assigneeId,
      currentEscalationLoop: advance.next.loop,
      currentEscalationPosition: advance.next.position,
      currentStepId: advance.step.id,
      escalationDeadline: deadlineFor(advance.step, now),
      escalationGeneration: generation,
      snoozedUntil: null,
      version: { increment: 1 },
      timelineEntries: {
        create: {
          ...actorData(input.actor),
          idempotencyKey: input.idempotencyKey,
          message: "Escalation advanced",
          metadata: {
            loop: advance.next.loop,
            position: advance.next.position,
            targetUserIds: targets
          },
          type: TimelineEventType.ESCALATION_ADVANCED
        }
      }
    }
  });

  await enqueueIncidentWorkflow(
    transaction,
    updated,
    "escalated",
    `incident:${updated.id}:generation:${generation}`
  );

  return { changed: true, incident: updated, targetUserIds: targets };
}

export async function advanceIncidentEscalation(
  prisma: PrismaClient,
  input: AdvanceIncidentInput
): Promise<IncidentActionResult> {
  return prisma.$transaction(async (transaction) => {
    const idempotent = await idempotentIncidentResult(
      transaction,
      input.idempotencyKey
    );
    if (idempotent) return idempotent;

    const incident = await findIncident(transaction, input.reference);
    if (!incident) {
      throw new DomainError(
        "INCIDENT_NOT_FOUND",
        "No open incident matches this reference",
        404
      );
    }
    await lock(transaction, `incident:${incident.id}`);

    const current = await transaction.incident.findUniqueOrThrow({
      where: { id: incident.id }
    });
    if (current.state !== IncidentState.TRIGGERED) {
      throw new DomainError(
        "INVALID_INCIDENT_TRANSITION",
        "Only triggered incidents can escalate",
        409
      );
    }
    if (
      input.expectedGeneration !== undefined &&
      current.escalationGeneration !== input.expectedGeneration
    ) {
      throw new DomainError(
        "STALE_INCIDENT_GENERATION",
        "This escalation generation is stale",
        409
      );
    }

    const now = input.now ?? new Date();
    if (
      input.requireDeadline &&
      (!current.escalationDeadline || current.escalationDeadline > now)
    ) {
      return { changed: false, incident: current, targetUserIds: [] };
    }

    const policy = await escalationPolicy(transaction, current.serviceId);
    const advance = advanceEscalationCursor(
      policy.steps,
      {
        loop: current.currentEscalationLoop,
        position: current.currentEscalationPosition
      },
      policy.repeatCount
    );

    return advanceResult(transaction, current, advance, input, now);
  });
}

export async function expireAcknowledgement(
  prisma: PrismaClient,
  input: IncidentMutationInput & { expectedGeneration: number }
): Promise<IncidentActionResult> {
  return prisma.$transaction(async (transaction) => {
    const incident = await findIncident(transaction, input.reference);
    if (!incident) {
      throw new DomainError(
        "INCIDENT_NOT_FOUND",
        "No open incident matches this reference",
        404
      );
    }
    await lock(transaction, `incident:${incident.id}`);

    const current = await transaction.incident.findUniqueOrThrow({
      where: { id: incident.id }
    });
    const now = input.now ?? new Date();
    if (
      current.state !== IncidentState.ACKNOWLEDGED ||
      current.escalationGeneration !== input.expectedGeneration ||
      !current.acknowledgementExpiresAt ||
      current.acknowledgementExpiresAt > now
    ) {
      return { changed: false, incident: current, targetUserIds: [] };
    }

    const policy = await escalationPolicy(transaction, current.serviceId);
    const currentStep =
      policy.steps.find(
        (step) => step.position === current.currentEscalationPosition
      ) ?? policy.steps[0];
    const targets = currentStep
      ? await expandEscalationTargets(transaction, currentStep.id, now)
      : [];
    const generation = current.escalationGeneration + 1;
    const updated = await transaction.incident.update({
      where: { id: current.id },
      data: {
        acknowledgementExpiresAt: null,
        assigneeId: targets[0] ?? current.assigneeId,
        currentStepId: currentStep?.id ?? null,
        escalationDeadline: currentStep ? deadlineFor(currentStep, now) : null,
        escalationGeneration: generation,
        state: IncidentState.TRIGGERED,
        version: { increment: 1 },
        timelineEntries: {
          create: {
            ...actorData(input.actor),
            idempotencyKey: input.idempotencyKey,
            message: "Acknowledgement expired; escalation resumed",
            metadata: { targetUserIds: targets },
            type: TimelineEventType.ACKNOWLEDGEMENT_EXPIRED
          }
        }
      }
    });

    await enqueueIncidentWorkflow(
      transaction,
      updated,
      "acknowledgement-expired",
      `incident:${updated.id}:generation:${generation}`
    );

    return { changed: true, incident: updated, targetUserIds: targets };
  });
}
