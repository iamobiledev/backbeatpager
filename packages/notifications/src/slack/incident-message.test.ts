import { describe, expect, it } from "vitest";

import { createSlackActionToken, verifySlackActionToken } from "./actions.js";
import {
  renderSlackIncidentMessage,
  type IncidentMessageModel
} from "./incident-message.js";

const secret = "test-action-signing-secret";
const incident: IncidentMessageModel = {
  assigneeSlackUserId: "U123",
  escalationLabel: "Step 1 · Payments Primary",
  incidentId: "00000000-0000-0000-0000-000000000001",
  incidentNumber: 42,
  serviceName: "Payments API",
  severity: "CRITICAL",
  source: "grafana",
  sourceUrl: "https://grafana.example.com/alerts/42",
  state: "TRIGGERED",
  summary: "Payment authorization failures",
  webUrl: "https://pager.example.com/incidents/42"
};

describe("Slack action tokens", () => {
  it("round-trips a signed action and rejects tampering", () => {
    const token = createSlackActionToken(
      {
        action: "acknowledge",
        incidentId: incident.incidentId
      },
      secret
    );

    expect(verifySlackActionToken(token, secret)).toEqual({
      action: "acknowledge",
      incidentId: incident.incidentId
    });
    expect(verifySlackActionToken(`${token}x`, secret)).toBeNull();
    expect(verifySlackActionToken(token, "wrong-secret")).toBeNull();
  });
});

describe("Slack incident message", () => {
  it("renders rich triggered actions and severity color", () => {
    const message = renderSlackIncidentMessage(incident, secret);
    const serialized = JSON.stringify(message);

    expect(message.text).toContain("Incident #42");
    expect(message.attachments[0]?.color).toBe("#E5484D");
    expect(serialized).toContain("incident_acknowledge");
    expect(serialized).toContain("incident_resolve");
    expect(serialized).toContain("incident_escalate");
    expect(serialized).toContain("incident_reassign");
    expect(serialized).toContain("incident_snooze");
    expect(serialized).toContain("<@U123>");
  });

  it("removes actions after resolution", () => {
    const message = renderSlackIncidentMessage(
      { ...incident, state: "RESOLVED" },
      secret
    );

    expect(JSON.stringify(message)).not.toContain("incident_resolve");
    expect(message.text).toContain("[RESOLVED]");
  });
});
