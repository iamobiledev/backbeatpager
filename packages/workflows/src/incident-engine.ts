import {
  ActorKind,
  IncidentState,
  WorkflowStatus,
  type PrismaClient
} from "@backbeat/db";
import {
  advanceIncidentEscalation,
  DomainError,
  expireAcknowledgement
} from "@backbeat/domain";

import type { IncidentWorkflowInput } from "./index.js";

export type IncidentWakeResult =
  | {
      done: false;
      nextGeneration: null;
      sleepUntil: string;
    }
  | {
      done: true;
      nextGeneration: number | null;
      sleepUntil: null;
    };

function logicalKey(input: IncidentWorkflowInput): string {
  return `incident:${input.incidentId}:generation:${input.generation}`;
}

async function updateRun(
  prisma: PrismaClient,
  input: IncidentWorkflowInput,
  status: WorkflowStatus,
  expectedWakeAt: Date | null
): Promise<void> {
  await prisma.workflowRun.updateMany({
    where: { logicalKey: logicalKey(input) },
    data: {
      expectedWakeAt,
      ...(status === WorkflowStatus.SUCCEEDED || status === WorkflowStatus.STALE
        ? { finishedAt: new Date() }
        : {}),
      status
    }
  });
}

export async function evaluateIncidentWake(
  prisma: PrismaClient,
  input: IncidentWorkflowInput,
  now = new Date()
): Promise<IncidentWakeResult> {
  const incident = await prisma.incident.findUnique({
    where: { id: input.incidentId }
  });

  if (!incident || incident.escalationGeneration !== input.generation) {
    await updateRun(prisma, input, WorkflowStatus.STALE, null);
    return { done: true, nextGeneration: null, sleepUntil: null };
  }

  if (incident.state === IncidentState.RESOLVED) {
    await updateRun(prisma, input, WorkflowStatus.SUCCEEDED, null);
    return { done: true, nextGeneration: null, sleepUntil: null };
  }

  if (incident.state === IncidentState.ACKNOWLEDGED) {
    if (!incident.acknowledgementExpiresAt) {
      await updateRun(prisma, input, WorkflowStatus.SUCCEEDED, null);
      return { done: true, nextGeneration: null, sleepUntil: null };
    }

    if (incident.acknowledgementExpiresAt > now) {
      await updateRun(
        prisma,
        input,
        WorkflowStatus.SLEEPING,
        incident.acknowledgementExpiresAt
      );
      return {
        done: false,
        nextGeneration: null,
        sleepUntil: incident.acknowledgementExpiresAt.toISOString()
      };
    }

    const expired = await expireAcknowledgement(prisma, {
      actor: { kind: ActorKind.SYSTEM },
      expectedGeneration: input.generation,
      idempotencyKey: `${logicalKey(input)}:acknowledgement-expired`,
      now,
      reference: { incidentId: incident.id }
    });
    await updateRun(prisma, input, WorkflowStatus.SUCCEEDED, null);
    return {
      done: true,
      nextGeneration: expired.changed
        ? expired.incident.escalationGeneration
        : null,
      sleepUntil: null
    };
  }

  const deadlines = [
    incident.escalationDeadline,
    incident.nagDeadline,
    incident.incidentChannelDeadline
  ].filter((deadline): deadline is Date => deadline !== null);
  if (deadlines.length === 0) {
    await updateRun(prisma, input, WorkflowStatus.SUCCEEDED, null);
    return { done: true, nextGeneration: null, sleepUntil: null };
  }

  const nextDeadline = deadlines.reduce((earliest, deadline) =>
    deadline < earliest ? deadline : earliest
  );
  if (nextDeadline > now) {
    await updateRun(prisma, input, WorkflowStatus.SLEEPING, nextDeadline);
    return {
      done: false,
      nextGeneration: null,
      sleepUntil: nextDeadline.toISOString()
    };
  }

  if (!incident.escalationDeadline || incident.escalationDeadline > now) {
    const retryAt = new Date(now.getTime() + 5_000);
    await updateRun(prisma, input, WorkflowStatus.SLEEPING, retryAt);
    return {
      done: false,
      nextGeneration: null,
      sleepUntil: retryAt.toISOString()
    };
  }

  try {
    const advanced = await advanceIncidentEscalation(prisma, {
      actor: { kind: ActorKind.SYSTEM },
      expectedGeneration: input.generation,
      idempotencyKey: `${logicalKey(input)}:escalate:${incident.escalationDeadline.toISOString()}`,
      now,
      reference: { incidentId: incident.id },
      requireDeadline: true
    });
    await updateRun(prisma, input, WorkflowStatus.SUCCEEDED, null);

    return {
      done: true,
      nextGeneration: advanced.incident.escalationDeadline
        ? advanced.incident.escalationGeneration
        : null,
      sleepUntil: null
    };
  } catch (error) {
    if (
      error instanceof DomainError &&
      (error.code === "STALE_INCIDENT_GENERATION" ||
        error.code === "INVALID_INCIDENT_TRANSITION")
    ) {
      await updateRun(prisma, input, WorkflowStatus.STALE, null);
      return { done: true, nextGeneration: null, sleepUntil: null };
    }

    throw error;
  }
}
