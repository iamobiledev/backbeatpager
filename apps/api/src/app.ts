import Fastify, { type FastifyInstance } from "fastify";

export function buildApp(): FastifyInstance {
  const app = Fastify({
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

  app.get("/", () => ({
    name: "backbeatpager-api",
    status: "ok"
  }));

  app.get("/health", () => ({
    status: "healthy"
  }));

  return app;
}
