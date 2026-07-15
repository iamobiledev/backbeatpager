import type { IncomingMessage, ServerResponse } from "node:http";

import { getPrismaClient } from "@backbeat/db";

import { buildApp } from "./app.js";
import { createSlackBoltRuntimeFromEnvironment } from "./slack/bolt-runtime.js";
import { createNotificationDeliveryFromEnvironment } from "./slack/notification-runtime.js";
import { vercelIncidentWorkflowStarter } from "./workflows/incident-generation.js";

const prisma = getPrismaClient();
const notificationDelivery = createNotificationDeliveryFromEnvironment();
const slackRuntime = createSlackBoltRuntimeFromEnvironment(
  {
    prisma,
    workflowStarter: vercelIncidentWorkflowStarter
  },
  { required: process.env.SLACK_REQUIRED === "true" }
);
const app = buildApp({
  alertRoutes: {
    prisma,
    workflowStarter: vercelIncidentWorkflowStarter
  },
  ...(notificationDelivery ? { notificationDelivery } : {}),
  ...(slackRuntime ? { slackRuntime } : {})
});
await app.ready();

export default function handler(
  request: IncomingMessage,
  response: ServerResponse
): void {
  app.server.emit("request", request, response);
}
