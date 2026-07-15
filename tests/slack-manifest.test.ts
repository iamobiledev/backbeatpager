import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";
import { parse } from "yaml";

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Expected manifest object");
  }
  return value as Record<string, unknown>;
}

describe("Slack app manifest", () => {
  it("declares HTTP mode, commands, events, and paging scopes", async () => {
    const parsed: unknown = parse(
      await readFile(new URL("../manifest.yml", import.meta.url), "utf8")
    );
    const manifest = record(parsed);
    const oauth = record(manifest.oauth_config);
    const scopes = record(oauth.scopes);
    const botScopes = scopes.bot;
    expect(Array.isArray(botScopes)).toBe(true);
    expect(botScopes).toEqual(
      expect.arrayContaining([
        "chat:write",
        "commands",
        "im:write",
        "users:read.email",
        "channels:manage",
        "groups:write",
        "pins:write"
      ])
    );

    const settings = record(manifest.settings);
    expect(settings.socket_mode_enabled).toBe(false);
    expect(record(settings.interactivity).request_url).toContain(
      "/slack/events"
    );
    expect(record(settings.event_subscriptions).bot_events).toContain(
      "app_home_opened"
    );

    const features = record(manifest.features);
    const commands = features.slash_commands;
    expect(Array.isArray(commands)).toBe(true);
    expect(commands).toHaveLength(2);
  });
});
