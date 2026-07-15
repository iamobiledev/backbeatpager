export const incidentStates = [
  "TRIGGERED",
  "ACKNOWLEDGED",
  "RESOLVED"
] as const;

export type IncidentState = (typeof incidentStates)[number];

export const severities = ["CRITICAL", "WARNING", "INFO"] as const;

export type Severity = (typeof severities)[number];

export {
  alertmanagerWebhookSchema,
  alertSeveritySchema,
  eventActionSchema,
  genericWebhookSchema,
  grafanaWebhookSchema,
  pagerDutyEventSchema
} from "./alert-events.js";
export type {
  AlertmanagerWebhook,
  GenericWebhook,
  GrafanaWebhook,
  PagerDutyEvent
} from "./alert-events.js";
