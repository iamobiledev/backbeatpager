import { getPrismaClient } from "@backbeat/db";
import type { FastifyInstance } from "fastify";

import { buildApp } from "./app";
import { createSlackBoltRuntimeFromEnvironment } from "./slack/bolt-runtime";
import { createNotificationDeliveryFromEnvironment } from "./slack/notification-runtime";
import { vercelCommunicationWorkflowStarter } from "../workflows/communications";
import { vercelIncidentWorkflowStarter } from "../workflows/incident-generation";

let appPromise: Promise<FastifyInstance> | undefined;

export function getServerApp(): Promise<FastifyInstance> {
  if (!appPromise) {
    appPromise = (async () => {
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
      return app;
    })();
  }
  return appPromise;
}

export async function handleServerRequest(request: Request): Promise<Response> {
  const app = await getServerApp();
  const url = new URL(request.url);
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const payload =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : Buffer.from(await request.arrayBuffer());

  const result = await app.inject({
    headers,
    method: request.method as
      | "DELETE"
      | "GET"
      | "HEAD"
      | "OPTIONS"
      | "PATCH"
      | "POST"
      | "PUT",
    remoteAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "127.0.0.1",
    url: `${url.pathname}${url.search}`,
    ...(payload ? { payload } : {})
  });

  const responseHeaders = new Headers();
  for (const [key, value] of Object.entries(result.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) responseHeaders.append(key, String(item));
    } else {
      responseHeaders.set(key, String(value));
    }
  }

  return new Response(result.body, {
    headers: responseHeaders,
    status: result.statusCode
  });
}
