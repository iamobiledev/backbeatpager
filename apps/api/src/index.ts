import type { IncomingMessage, ServerResponse } from "node:http";

import { parseApiEnvironment } from "@backbeat/config";
import { getPrismaClient } from "@backbeat/db";

import { buildApp } from "./app.js";
import { createSlackBoltRuntimeFromEnvironment } from "./slack/bolt-runtime.js";
import { createNotificationDeliveryFromEnvironment } from "./slack/notification-runtime.js";
import { vercelCommunicationWorkflowStarter } from "./workflows/communications.js";
import { vercelIncidentWorkflowStarter } from "./workflows/incident-generation.js";

if (process.env.VERCEL_ENV === "production") {
  parseApiEnvironment(process.env);
}

const prisma = getPrismaClient();
const notificationDelivery = createNotificationDeliveryFromEnvironment();
const slackRuntime = createSlackBoltRuntimeFromEnvironment(
  {
    communicationStarter: vercelCommunicationWorkflowStarter,
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
  communicationStarter: vercelCommunicationWorkflowStarter,
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
