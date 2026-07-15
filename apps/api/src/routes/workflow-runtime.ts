import {
  dispatchIncidentWorkflow,
  evaluateIncidentWake,
  type IncidentWorkflowStarter
} from "@backbeat/workflows";
import {
  deliverIncidentGeneration,
  type NotificationDeliveryDependencies
} from "@backbeat/notifications";
import type { PrismaClient } from "@backbeat/db";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

export interface WorkflowRuntimeRouteDependencies {
  notificationDelivery?: NotificationDeliveryDependencies;
  prisma: PrismaClient;
  workflowStarter: IncidentWorkflowStarter;
}

const incidentWorkflowInputSchema = z.object({
  generation: z.number().int().nonnegative(),
  incidentId: z.uuid()
});

export function registerWorkflowRuntimeRoutes(
  app: FastifyInstance,
  dependencies: WorkflowRuntimeRouteDependencies
): void {
  app.post("/internal/workflows/wake", async (request, reply) => {
    const secret = process.env.WORKFLOW_INTERNAL_SECRET;
    if (!secret) {
      return reply.code(503).send({
        error: {
          code: "WORKFLOW_RUNTIME_NOT_CONFIGURED",
          message: "WORKFLOW_INTERNAL_SECRET is not configured"
        }
      });
    }
    if (request.headers.authorization !== `Bearer ${secret}`) {
      return reply.code(401).send({
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid Workflow runtime credentials"
        }
      });
    }

    const parsed = incidentWorkflowInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: {
          code: "INVALID_WORKFLOW_INPUT",
          message: parsed.error.issues[0]?.message ?? "Invalid workflow input"
        }
      });
    }

    if (dependencies.notificationDelivery) {
      await deliverIncidentGeneration(
        dependencies.prisma,
        dependencies.notificationDelivery,
        parsed.data.incidentId,
        parsed.data.generation
      );
    }

    const result = await evaluateIncidentWake(dependencies.prisma, parsed.data);
    if (result.nextGeneration !== null) {
      await dispatchIncidentWorkflow(
        dependencies.prisma,
        dependencies.workflowStarter,
        {
          generation: result.nextGeneration,
          incidentId: parsed.data.incidentId
        }
      );
    }

    return reply.send(result);
  });
}
