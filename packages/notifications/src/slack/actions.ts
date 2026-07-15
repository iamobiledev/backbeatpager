import { createHmac, timingSafeEqual } from "node:crypto";

export const slackIncidentActions = [
  "acknowledge",
  "resolve",
  "escalate",
  "reassign",
  "snooze"
] as const;

export type SlackIncidentAction = (typeof slackIncidentActions)[number];

export interface SlackActionPayload {
  action: SlackIncidentAction;
  incidentId: string;
  version: number;
}

function signature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSlackActionToken(
  payload: SlackActionPayload,
  secret: string
): string {
  if (!secret) throw new Error("Slack action signing secret is required");

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signature(encoded, secret)}`;
}

export function verifySlackActionToken(
  token: string,
  secret: string
): SlackActionPayload | null {
  const [encoded, suppliedSignature, extra] = token.split(".");
  if (!encoded || !suppliedSignature || extra || !secret) return null;

  const expectedSignature = signature(encoded, secret);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return null;
  }

  try {
    const value: unknown = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    );
    if (
      typeof value !== "object" ||
      value === null ||
      !("incidentId" in value) ||
      typeof value.incidentId !== "string" ||
      !("action" in value) ||
      typeof value.action !== "string" ||
      !("version" in value) ||
      typeof value.version !== "number" ||
      !Number.isInteger(value.version) ||
      value.version < 0 ||
      !slackIncidentActions.includes(value.action as SlackIncidentAction)
    ) {
      return null;
    }

    return {
      action: value.action as SlackIncidentAction,
      incidentId: value.incidentId,
      version: value.version
    };
  } catch {
    return null;
  }
}
