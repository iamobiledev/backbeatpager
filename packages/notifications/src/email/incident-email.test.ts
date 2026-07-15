import { describe, expect, it } from "vitest";

import {
  renderIncidentEmail,
  renderIncidentEmailText
} from "./incident-email.js";

const incident = {
  incidentId: "00000000-0000-0000-0000-000000000001",
  incidentNumber: 42,
  serviceName: "Payments API",
  severity: "WARNING" as const,
  source: "alertmanager",
  state: "TRIGGERED" as const,
  summary: "Elevated checkout latency",
  webUrl: "https://pager.example.com/incidents/42"
};

describe("incident email", () => {
  it("renders matching HTML and plain-text content", async () => {
    const rendered = await renderIncidentEmail(incident);

    expect(rendered.subject).toBe(
      "[WARNING] Incident #42: Elevated checkout latency"
    );
    expect(rendered.html).toContain("Elevated checkout latency");
    expect(rendered.html).toContain("Payments API");
    expect(rendered.text).toContain("WARNING incident #42");
    expect(renderIncidentEmailText(incident)).toContain(
      "https://pager.example.com/incidents/42"
    );
  });
});
