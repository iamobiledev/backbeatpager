import type { FastifyInstance, FastifyRequest } from "fastify";

import type { SlackBoltRuntime } from "../slack/bolt-runtime.js";

function requestHeaders(request: FastifyRequest): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(name, item);
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }
  return headers;
}

export function registerSlackHttpRoute(
  app: FastifyInstance,
  runtime: SlackBoltRuntime
): void {
  app.removeContentTypeParser("application/json");
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (_request, body, done) => {
      done(null, body);
    }
  );
  app.addContentTypeParser(
    "application/x-www-form-urlencoded",
    { parseAs: "string" },
    (_request, body, done) => {
      done(null, body);
    }
  );

  app.post("/slack/events", async (request, reply) => {
    const body =
      typeof request.body === "string"
        ? request.body
        : JSON.stringify(request.body ?? {});
    const slackRequest = new Request(
      `http://${request.headers.host ?? "localhost"}${request.url}`,
      {
        body,
        headers: requestHeaders(request),
        method: "POST"
      }
    );
    const response = await runtime.handler(slackRequest);

    response.headers.forEach((value, name) => {
      reply.header(name, value);
    });
    return reply.code(response.status).send(await response.text());
  });
}
