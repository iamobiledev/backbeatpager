import { describe, expect, it } from "vitest";

import {
  buildManualIncidentModal,
  buildOnCallOverrideModal,
  buildResolveIncidentModal
} from "./modals";
import { parseIncidentSlashCommand } from "./phase4-listeners";

describe("incident slash command parser", () => {
  it("parses list modes and lifecycle commands", () => {
    expect(parseIncidentSlashCommand("")).toEqual({
      includeResolved: false,
      kind: "list"
    });
    expect(parseIncidentSlashCommand("list all")).toEqual({
      includeResolved: true,
      kind: "list"
    });
    expect(parseIncidentSlashCommand("trigger")).toEqual({ kind: "trigger" });
    expect(parseIncidentSlashCommand("ack 42")).toEqual({
      kind: "ack",
      number: 42
    });
    expect(parseIncidentSlashCommand("resolve 42")).toEqual({
      kind: "resolve",
      number: 42
    });
  });

  it("returns private usage guidance for invalid input", () => {
    expect(parseIncidentSlashCommand("ack nope")).toMatchObject({
      kind: "invalid"
    });
    expect(parseIncidentSlashCommand("list noisy")).toMatchObject({
      kind: "invalid"
    });
    expect(parseIncidentSlashCommand("unknown")).toMatchObject({
      kind: "invalid"
    });
  });
});

describe("Slack Phase 4 modals", () => {
  it("builds manual trigger and resolution views", () => {
    const trigger = buildManualIncidentModal();
    const resolution = buildResolveIncidentModal(42, "signed-token");

    expect(trigger.callback_id).toBe("incident_trigger_submit");
    expect(JSON.stringify(trigger)).toContain("incident_service_options");
    expect(JSON.stringify(trigger)).toContain("external_select");
    expect(resolution.callback_id).toBe("incident_resolve_submit");
    expect(resolution.private_metadata).toBe("signed-token");
  });

  it("caps override schedule choices at Slack's limit", () => {
    const modal = buildOnCallOverrideModal(
      Array.from({ length: 120 }, (_, index) => ({
        id: `schedule-${index}`,
        name: `Schedule ${index}`,
        teamName: "Team",
        timezone: "UTC"
      })),
      "America/New_York",
      new Date("2026-01-01T00:00:00.000Z")
    );
    const serialized = JSON.stringify(modal);

    expect(modal.callback_id).toBe("oncall_override_submit");
    expect(serialized).toContain("datetimepicker");
    expect(serialized).toContain("America/New_York");
    expect(serialized).not.toContain("schedule-100");
  });
});
