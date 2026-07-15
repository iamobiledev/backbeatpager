import {
  dispatchIncidentWorkflow,
  evaluateIncidentWake,
  processDigestWake,
  processHandoffWake,
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
const handoffWorkflowInputSchema = z.object({
  generation: z.number().int().nonnegative(),
  scheduleId: z.uuid()
});
const digestWorkflowInputSchema = z.object({
  generation: z.number().int().nonnegative(),
  teamId: z.uuid()
});

function authorized(headers: { authorization: string | undefined }): boolean {
  const secret = process.env.WORKFLOW_INTERNAL_SECRET;
  return Boolean(secret && headers.authorization === `Bearer ${secret}`);
}

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

  app.post("/internal/workflows/handoff", async (request, reply) => {
    if (!authorized({ authorization: request.headers.authorization })) {
      return reply.code(401).send({
        error: { code: "UNAUTHORIZED", message: "Invalid Workflow credentials" }
      });
    }
    if (!dependencies.notificationDelivery) {
      return reply.code(503).send({
        error: {
          code: "SLACK_NOT_CONFIGURED",
          message: "Slack delivery is required for handoffs"
        }
      });
    }
    const parsed = handoffWorkflowInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: {
          code: "INVALID_WORKFLOW_INPUT",
          message: parsed.error.issues[0]?.message ?? "Invalid input"
        }
      });
    }
    return processHandoffWake(
      dependencies.prisma,
      {
        slack: dependencies.notificationDelivery.slack,
        ...(dependencies.notificationDelivery.webBaseUrl
          ? { webBaseUrl: dependencies.notificationDelivery.webBaseUrl }
          : {})
      },
      parsed.data
    );
  });

  app.post("/internal/workflows/digest", async (request, reply) => {
    if (!authorized({ authorization: request.headers.authorization })) {
      return reply.code(401).send({
        error: { code: "UNAUTHORIZED", message: "Invalid Workflow credentials" }
      });
    }
    if (!dependencies.notificationDelivery) {
      return reply.code(503).send({
        error: {
          code: "SLACK_NOT_CONFIGURED",
          message: "Slack delivery is required for digests"
        }
      });
    }
    const parsed = digestWorkflowInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: {
          code: "INVALID_WORKFLOW_INPUT",
          message: parsed.error.issues[0]?.message ?? "Invalid input"
        }
      });
    }
    return processDigestWake(
      dependencies.prisma,
      {
        slack: dependencies.notificationDelivery.slack,
        ...(dependencies.notificationDelivery.webBaseUrl
          ? { webBaseUrl: dependencies.notificationDelivery.webBaseUrl }
          : {})
      },
      parsed.data
    );
  });
}
