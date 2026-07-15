export const incidentStates = [
  "TRIGGERED",
  "ACKNOWLEDGED",
  "RESOLVED"
] as const;

export type IncidentState = (typeof incidentStates)[number];

export const severities = ["CRITICAL", "WARNING", "INFO"] as const;

export type Severity = (typeof severities)[number];
