import { z } from "zod";

export const eventActionSchema = z.enum(["trigger", "acknowledge", "resolve"]);

export const alertSeveritySchema = z.enum(["critical", "warning", "info"]);

export const pagerDutyEventSchema = z.object({
  dedup_key: z.string().trim().min(1).max(255),
  event_action: eventActionSchema,
  payload: z
    .object({
      component: z.string().max(255).optional(),
      custom_details: z.record(z.string(), z.unknown()).optional(),
      group: z.string().max(255).optional(),
      severity: alertSeveritySchema,
      source: z.string().trim().min(1).max(1024),
      source_url: z.url().optional(),
      summary: z.string().trim().min(1).max(1024)
    })
    .passthrough(),
  routing_key: z.string().optional()
});

export type PagerDutyEvent = z.infer<typeof pagerDutyEventSchema>;

export const genericWebhookSchema = z.object({
  custom_details: z.record(z.string(), z.unknown()).optional(),
  dedup_key: z.string().trim().min(1).max(255),
  details: z.record(z.string(), z.unknown()).optional(),
  event_action: eventActionSchema.default("trigger"),
  severity: alertSeveritySchema,
  source: z.string().trim().min(1).max(1024),
  summary: z.string().trim().min(1).max(1024),
  url: z.url().optional()
});

export type GenericWebhook = z.infer<typeof genericWebhookSchema>;

const monitoringAlertSchema = z
  .object({
    annotations: z.record(z.string(), z.string()).default({}),
    endsAt: z.string().optional(),
    fingerprint: z.string().optional(),
    generatorURL: z.string().optional(),
    labels: z.record(z.string(), z.string()).default({}),
    startsAt: z.string().optional(),
    status: z.enum(["firing", "resolved"]).optional(),
    valueString: z.string().optional()
  })
  .passthrough();

export const alertmanagerWebhookSchema = z
  .object({
    alerts: z.array(monitoringAlertSchema).min(1),
    commonAnnotations: z.record(z.string(), z.string()).default({}),
    commonLabels: z.record(z.string(), z.string()).default({}),
    externalURL: z.string().optional(),
    groupKey: z.string().optional(),
    receiver: z.string().optional(),
    status: z.enum(["firing", "resolved"]),
    version: z.string().optional()
  })
  .passthrough();

export type AlertmanagerWebhook = z.infer<typeof alertmanagerWebhookSchema>;

export const grafanaWebhookSchema = alertmanagerWebhookSchema.extend({
  message: z.string().optional(),
  orgId: z.number().optional(),
  title: z.string().optional()
});

export type GrafanaWebhook = z.infer<typeof grafanaWebhookSchema>;
