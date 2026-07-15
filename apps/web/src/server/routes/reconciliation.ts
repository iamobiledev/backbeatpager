import type { PrismaClient } from "@backbeat/db";
import {
  reconcileCommunicationWorkflows,
  reconcileIncidentWorkflows,
  type CommunicationWorkflowStarter,
  type IncidentWorkflowStarter
} from "@backbeat/workflows";
import type { FastifyInstance } from "fastify";

export interface ReconciliationRouteDependencies {
  communicationStarter?: CommunicationWorkflowStarter;
  prisma: PrismaClient;
  workflowStarter: IncidentWorkflowStarter;
}

export function registerReconciliationRoute(
  app: FastifyInstance,
  dependencies: ReconciliationRouteDependencies
): void {
  app.route({
    method: ["GET", "POST"],
    url: "/internal/reconcile",
    async handler(request, reply) {
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

      const [incidents, communications] = await Promise.all([
        reconcileIncidentWorkflows(
          dependencies.prisma,
          dependencies.workflowStarter
        ),
        dependencies.communicationStarter
          ? reconcileCommunicationWorkflows(
              dependencies.prisma,
              dependencies.communicationStarter
            )
          : Promise.resolve({
              digestsStarted: 0,
              failed: 0,
              handoffsStarted: 0
            })
      ]);
      return reply.send({
        result: { communications, incidents },
        status: "success"
      });
    }
  });
}
