import type { IncomingMessage, ServerResponse } from "node:http";

import { getPrismaClient } from "@backbeat/db";

import { buildApp } from "./app.js";
import { vercelIncidentWorkflowStarter } from "./workflows/incident-generation.js";

const app = buildApp({
  alertRoutes: {
    prisma: getPrismaClient(),
    workflowStarter: vercelIncidentWorkflowStarter
  }
});
await app.ready();

export default function handler(
  request: IncomingMessage,
  response: ServerResponse
): void {
  app.server.emit("request", request, response);
}
