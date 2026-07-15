import helmet from "@fastify/helmet";
import { DomainError } from "@backbeat/domain";
import Fastify, { type FastifyInstance } from "fastify";

import {
  AlertHttpError,
  registerAlertRoutes,
  type AlertRouteDependencies
} from "./routes/alerts.js";
import { registerReconciliationRoute } from "./routes/reconciliation.js";
import { registerWorkflowRuntimeRoutes } from "./routes/workflow-runtime.js";

export interface BuildAppOptions {
  alertRoutes?: AlertRouteDependencies;
}

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({
    bodyLimit: 1_048_576,
    logger: {
      redact: {
        paths: [
          "req.headers.authorization",
          "req.headers.cookie",
          "req.headers.x-routing-key"
        ],
        censor: "[REDACTED]"
      }
    }
  });

  void app.register(helmet, {
    contentSecurityPolicy: false
  });

  app.get("/", () => ({
    name: "backbeatpager-api",
    status: "ok"
  }));

  app.get("/health", () => ({
    status: "healthy"
  }));

  app.get("/ready", async (request, reply) => {
    if (!options.alertRoutes) {
      return { database: "not-configured", status: "ready" };
    }

    try {
      await options.alertRoutes.prisma.$queryRaw`SELECT 1`;
      return { database: "connected", status: "ready" };
    } catch (error) {
      request.log.error({ error }, "Database readiness check failed");
      return reply.code(503).send({
        database: "unavailable",
        status: "not-ready"
      });
    }
  });

  const alertRoutes = options.alertRoutes;
  if (alertRoutes) {
    void app.register((scope, _options, done) => {
      registerAlertRoutes(scope, alertRoutes);
      registerReconciliationRoute(scope, alertRoutes);
      registerWorkflowRuntimeRoutes(scope, alertRoutes);
      done();
    });
  }

  app.setErrorHandler((error, request, reply) => {
    const statusCode =
      error instanceof DomainError || error instanceof AlertHttpError
        ? error.statusCode
        : 500;

    if (statusCode >= 500) {
      request.log.error({ error }, "Request failed");
    }

    return reply.code(statusCode).send({
      error: {
        code: error instanceof DomainError ? error.code : "REQUEST_FAILED",
        message:
          statusCode >= 500
            ? "Internal server error"
            : error instanceof Error
              ? error.message
              : "Request failed"
      }
    });
  });

  return app;
}
