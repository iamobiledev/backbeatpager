import type { PrismaClient } from "@backbeat/db";
import {
  reconcileIncidentWorkflows,
  type IncidentWorkflowStarter
} from "@backbeat/workflows";
import type { FastifyInstance } from "fastify";

export interface ReconciliationRouteDependencies {
  prisma: PrismaClient;
  workflowStarter: IncidentWorkflowStarter;
}

export function registerReconciliationRoute(
  app: FastifyInstance,
  dependencies: ReconciliationRouteDependencies
): void {
  app.post("/internal/reconcile", async (request, reply) => {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
      return reply.code(503).send({
        error: {
          code: "RECONCILIATION_NOT_CONFIGURED",
          message: "CRON_SECRET is not configured"
        }
      });
    }

    const authorization = request.headers.authorization;
    if (authorization !== `Bearer ${secret}`) {
      return reply.code(401).send({
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid reconciliation credentials"
        }
      });
    }

    const result = await reconcileIncidentWorkflows(
      dependencies.prisma,
      dependencies.workflowStarter
    );
    return reply.send({ result, status: "success" });
  });
}
