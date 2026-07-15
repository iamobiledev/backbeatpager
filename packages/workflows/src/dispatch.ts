import {
  IncidentState,
  OutboxStatus,
  WorkflowKind,
  WorkflowStatus,
  type Incident,
  type PrismaClient
} from "@backbeat/db";

import type {
  IncidentWorkflowInput,
  IncidentWorkflowStarter
} from "./index.js";

export interface DispatchIncidentWorkflowResult {
  runId: string;
  started: boolean;
}

export interface ReconciliationResult {
  failed: number;
  inspected: number;
  started: number;
}

function logicalKey(input: IncidentWorkflowInput): string {
  return `incident:${input.incidentId}:generation:${input.generation}`;
}

async function waitForConcurrentStart(
  prisma: PrismaClient,
  workflowRunId: string
): Promise<DispatchIncidentWorkflowResult> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const run = await prisma.workflowRun.findUniqueOrThrow({
      where: { id: workflowRunId }
    });

    if (run.vercelRunId) {
      return { runId: run.vercelRunId, started: false };
    }
    if (run.status === WorkflowStatus.FAILED) {
      throw new Error(
        run.lastError ?? "The concurrent Workflow start attempt failed"
      );
    }
  }

  throw new Error("Timed out waiting for a concurrent Workflow start");
}

export async function dispatchIncidentWorkflow(
  prisma: PrismaClient,
  starter: IncidentWorkflowStarter,
  input: IncidentWorkflowInput
): Promise<DispatchIncidentWorkflowResult> {
  const key = logicalKey(input);
  const registered = await prisma.workflowRun.upsert({
    where: { logicalKey: key },
    create: {
      entityId: input.incidentId,
      generation: input.generation,
      kind: WorkflowKind.INCIDENT_GENERATION,
      logicalKey: key
    },
    update: {}
  });
  if (registered.vercelRunId && registered.status !== WorkflowStatus.FAILED) {
    return { runId: registered.vercelRunId, started: false };
  }

  const now = new Date();
  const claimed = await prisma.workflowRun.updateMany({
    where: {
      id: registered.id,
      vercelRunId: null,
      OR: [
        {
          status: {
            in: [WorkflowStatus.PENDING, WorkflowStatus.FAILED]
          }
        },
        {
          startedAt: {
            lt: new Date(now.getTime() - 30_000)
          },
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
  if (claimed.count === 0) {
    return waitForConcurrentStart(prisma, registered.id);
  }

  try {
    const started = await starter.startIncidentGeneration(input);
    await prisma.$transaction([
      prisma.workflowRun.update({
        where: { id: registered.id },
        data: {
          lastError: null,
          status: WorkflowStatus.RUNNING,
          vercelRunId: started.runId
        }
      }),
      prisma.outboxEvent.updateMany({
        where: { idempotencyKey: key },
        data: {
          attempts: { increment: 1 },
          dispatchedAt: new Date(),
          lastError: null,
          status: OutboxStatus.DISPATCHED
        }
      })
    ]);

    return { runId: started.runId, started: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.$transaction([
      prisma.workflowRun.update({
        where: { id: registered.id },
        data: {
          lastError: message,
          status: WorkflowStatus.FAILED
        }
      }),
      prisma.outboxEvent.updateMany({
        where: { idempotencyKey: key },
        data: {
          attempts: { increment: 1 },
          lastError: message,
          status: OutboxStatus.FAILED
        }
      })
    ]);
    throw error;
  }
}

function needsWorkflow(incident: Incident): boolean {
  return (
    incident.state === IncidentState.TRIGGERED ||
    (incident.state === IncidentState.ACKNOWLEDGED &&
      incident.acknowledgementExpiresAt !== null)
  );
}

export async function reconcileIncidentWorkflows(
  prisma: PrismaClient,
  starter: IncidentWorkflowStarter
): Promise<ReconciliationResult> {
  const incidents = await prisma.incident.findMany({
    where: {
      OR: [
        { state: IncidentState.TRIGGERED },
        {
          acknowledgementExpiresAt: { not: null },
          state: IncidentState.ACKNOWLEDGED
        }
      ]
    }
  });
  const result: ReconciliationResult = {
    failed: 0,
    inspected: incidents.length,
    started: 0
  };

  for (const incident of incidents) {
    if (!needsWorkflow(incident)) continue;

    const key = logicalKey({
      generation: incident.escalationGeneration,
      incidentId: incident.id
    });
    const run = await prisma.workflowRun.findUnique({
      where: { logicalKey: key }
    });
    if (
      run?.vercelRunId &&
      run.status !== WorkflowStatus.FAILED &&
      run.status !== WorkflowStatus.STALE
    ) {
      continue;
    }

    try {
      const dispatched = await dispatchIncidentWorkflow(prisma, starter, {
        generation: incident.escalationGeneration,
        incidentId: incident.id
      });
      if (dispatched.started) result.started += 1;
    } catch {
      result.failed += 1;
    }
  }

  return result;
}
