import { createHash } from "node:crypto";

import {
  ActorKind,
  Severity,
  type Prisma,
  type PrismaClient
} from "@backbeat/db";
import {
  alertmanagerWebhookSchema,
  genericWebhookSchema,
  grafanaWebhookSchema,
  pagerDutyEventSchema,
  type PagerDutyEvent
} from "@backbeat/contracts";
import {
  acknowledgeIncident,
  resolveIncident,
  triggerIncident
} from "@backbeat/domain";
import { parseRoutingKey, verifyRoutingKey } from "@backbeat/db/routing-keys";
import {
  dispatchIncidentWorkflow,
  type IncidentWorkflowStarter
} from "@backbeat/workflows";
import type { FastifyInstance, FastifyRequest } from "fastify";

export interface AlertRouteDependencies {
  prisma: PrismaClient;
  workflowStarter: IncidentWorkflowStarter;
}

class AlertHttpError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AlertHttpError";
    this.statusCode = statusCode;
  }
}

interface ProcessedEvent {
  changed: boolean;
  incident: {
    id: string;
    number: number;
    state: string;
  };
}

function headerValue(
  request: FastifyRequest,
  name: string
): string | undefined {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function routingKeyFromRequest(
  request: FastifyRequest,
  bodyRoutingKey?: string
): string | null {
  if (bodyRoutingKey) return bodyRoutingKey;

  const explicit = headerValue(request, "x-routing-key");
  if (explicit) return explicit;

  const authorization = headerValue(request, "authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return null;
}

async function authenticateService(
  prisma: PrismaClient,
  routingKey: string | null
) {
  if (!routingKey) {
    throw new AlertHttpError(401, "A routing key is required");
  }

  const parsed = parseRoutingKey(routingKey);
  if (!parsed) {
    throw new AlertHttpError(401, "The routing key is invalid");
  }

  const service = await prisma.service.findUnique({
    where: { routingKeyPrefix: parsed.prefix }
  });
  if (
    !service?.active ||
    !(await verifyRoutingKey(service.routingKeyHash, routingKey))
  ) {
    throw new AlertHttpError(401, "The routing key is invalid");
  }

  return service;
}

function severity(value: PagerDutyEvent["payload"]["severity"]): Severity {
  switch (value) {
    case "critical":
      return Severity.CRITICAL;
    case "warning":
      return Severity.WARNING;
    case "info":
      return Severity.INFO;
  }
}

function payloadHash(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function idempotencySeed(request: FastifyRequest, payload: unknown): string {
  return (
    headerValue(request, "x-idempotency-key") ??
    headerValue(request, "x-request-id") ??
    payloadHash(payload)
  );
}

async function processEvent(
  dependencies: AlertRouteDependencies,
  event: PagerDutyEvent,
  routingKey: string | null,
  seed: string
): Promise<ProcessedEvent> {
  const service = await authenticateService(dependencies.prisma, routingKey);
  const eventPayload = event as unknown as Prisma.InputJsonValue;
  const requestHash = payloadHash(event);
  const requestId = `${event.event_action}:${service.id}:${event.dedup_key}:${seed}`;
  const idempotencyKey = requestId;
  const reference = {
    dedupKey: event.dedup_key,
    serviceId: service.id
  };

  const result =
    event.event_action === "trigger"
      ? await triggerIncident(dependencies.prisma, {
          actor: { kind: ActorKind.INTEGRATION },
          dedupKey: event.dedup_key,
          idempotencyKey,
          payload: eventPayload,
          requestHash,
          requestId,
          serviceId: service.id,
          severity: severity(event.payload.severity),
          source: event.payload.source,
          ...(event.payload.source_url
            ? { sourceUrl: event.payload.source_url }
            : {}),
          summary: event.payload.summary
        })
      : event.event_action === "acknowledge"
        ? await acknowledgeIncident(dependencies.prisma, {
            actor: { kind: ActorKind.INTEGRATION },
            alertEvent: {
              payload: eventPayload,
              requestHash,
              requestId
            },
            idempotencyKey,
            reference
          })
        : await resolveIncident(dependencies.prisma, {
            actor: { kind: ActorKind.INTEGRATION },
            alertEvent: {
              payload: eventPayload,
              requestHash,
              requestId
            },
            idempotencyKey,
            reference
          });

  try {
    await dispatchIncidentWorkflow(
      dependencies.prisma,
      dependencies.workflowStarter,
      {
        generation: result.incident.escalationGeneration,
        incidentId: result.incident.id
      }
    );
  } catch {
    throw new AlertHttpError(
      503,
      "The incident was saved, but durable processing is temporarily unavailable; retry this event"
    );
  }

  return {
    changed: result.changed,
    incident: {
      id: result.incident.id,
      number: result.incident.number,
      state: result.incident.state
    }
  };
}

function acceptedResponse(event: PagerDutyEvent, processed: ProcessedEvent) {
  return {
    dedup_key: event.dedup_key,
    incident: processed.incident,
    message: processed.changed
      ? "Event processed"
      : "Event was already processed",
    status: "success"
  };
}

function normalizedSeverity(
  value: string | undefined
): PagerDutyEvent["payload"]["severity"] {
  const normalized = value?.toLowerCase();
  if (
    normalized === "critical" ||
    normalized === "warning" ||
    normalized === "info"
  ) {
    return normalized;
  }
  if (normalized === "error" || normalized === "high") return "critical";
  if (normalized === "warn" || normalized === "medium") return "warning";
  return "info";
}

export function registerAlertRoutes(
  app: FastifyInstance,
  dependencies: AlertRouteDependencies
): void {
  app.post("/api/v1/alerts", async (request, reply) => {
    const parsed = pagerDutyEventSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AlertHttpError(
        400,
        `Invalid event payload: ${parsed.error.issues[0]?.message ?? "unknown error"}`
      );
    }

    const processed = await processEvent(
      dependencies,
      parsed.data,
      routingKeyFromRequest(request, parsed.data.routing_key),
      idempotencySeed(request, parsed.data)
    );
    return reply.code(202).send(acceptedResponse(parsed.data, processed));
  });

  app.post("/api/v1/integrations/generic", async (request, reply) => {
    const parsed = genericWebhookSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AlertHttpError(
        400,
        `Invalid generic webhook: ${parsed.error.issues[0]?.message ?? "unknown error"}`
      );
    }

    const event: PagerDutyEvent = {
      dedup_key: parsed.data.dedup_key,
      event_action: parsed.data.event_action,
      payload: {
        custom_details: parsed.data.custom_details ?? parsed.data.details ?? {},
        severity: parsed.data.severity,
        source: parsed.data.source,
        ...(parsed.data.url ? { source_url: parsed.data.url } : {}),
        summary: parsed.data.summary
      }
    };
    const processed = await processEvent(
      dependencies,
      event,
      routingKeyFromRequest(request),
      idempotencySeed(request, parsed.data)
    );
    return reply.code(202).send(acceptedResponse(event, processed));
  });

  app.post("/api/v1/integrations/alertmanager", async (request, reply) => {
    const parsed = alertmanagerWebhookSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AlertHttpError(
        400,
        `Invalid Alertmanager webhook: ${parsed.error.issues[0]?.message ?? "unknown error"}`
      );
    }

    const routingKey = routingKeyFromRequest(request);
    const seed = idempotencySeed(request, parsed.data);
    const results = [];
    for (const [index, alert] of parsed.data.alerts.entries()) {
      const dedupKey =
        alert.fingerprint ??
        `${parsed.data.groupKey ?? "alertmanager"}:${payloadHash(alert.labels).slice(0, 24)}`;
      const event: PagerDutyEvent = {
        dedup_key: dedupKey,
        event_action:
          alert.status === "resolved" || parsed.data.status === "resolved"
            ? "resolve"
            : "trigger",
        payload: {
          custom_details: {
            annotations: alert.annotations,
            labels: alert.labels,
            value: alert.valueString
          },
          severity: normalizedSeverity(alert.labels.severity),
          source:
            alert.labels.instance ??
            alert.labels.job ??
            parsed.data.receiver ??
            "alertmanager",
          ...(alert.generatorURL ? { source_url: alert.generatorURL } : {}),
          summary:
            alert.annotations.summary ??
            alert.annotations.description ??
            alert.labels.alertname ??
            "Alertmanager alert"
        }
      };
      const processed = await processEvent(
        dependencies,
        event,
        routingKey,
        `${seed}:${alert.fingerprint ?? index}`
      );
      results.push(acceptedResponse(event, processed));
    }

    return reply.code(202).send({ results, status: "success" });
  });

  app.post("/api/v1/integrations/grafana", async (request, reply) => {
    const parsed = grafanaWebhookSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AlertHttpError(
        400,
        `Invalid Grafana webhook: ${parsed.error.issues[0]?.message ?? "unknown error"}`
      );
    }

    const routingKey = routingKeyFromRequest(request);
    const seed = idempotencySeed(request, parsed.data);
    const results = [];
    for (const [index, alert] of parsed.data.alerts.entries()) {
      const dedupKey =
        alert.fingerprint ??
        `${parsed.data.groupKey ?? "grafana"}:${payloadHash(alert.labels).slice(0, 24)}`;
      const event: PagerDutyEvent = {
        dedup_key: dedupKey,
        event_action:
          alert.status === "resolved" || parsed.data.status === "resolved"
            ? "resolve"
            : "trigger",
        payload: {
          custom_details: {
            annotations: alert.annotations,
            labels: alert.labels,
            value: alert.valueString
          },
          severity: normalizedSeverity(
            alert.labels.severity ?? parsed.data.commonLabels.severity
          ),
          source:
            alert.labels.instance ?? alert.labels.grafana_folder ?? "grafana",
          ...(alert.generatorURL ? { source_url: alert.generatorURL } : {}),
          summary:
            alert.annotations.summary ??
            parsed.data.title ??
            parsed.data.message ??
            alert.labels.alertname ??
            "Grafana alert"
        }
      };
      const processed = await processEvent(
        dependencies,
        event,
        routingKey,
        `${seed}:${alert.fingerprint ?? index}`
      );
      results.push(acceptedResponse(event, processed));
    }

    return reply.code(202).send({ results, status: "success" });
  });
}

export { AlertHttpError };
