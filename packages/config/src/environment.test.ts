import { describe, expect, it } from "vitest";

import { parseApiEnvironment, parseWebEnvironment } from "./index.js";

const database = {
  DATABASE_URL: "postgresql://user:password@example.com/database",
  NODE_ENV: "production" as const,
  VERCEL_ENV: "production" as const
};

describe("production environment contracts", () => {
  it("requires complete Slack and paired Resend configuration", () => {
    expect(() =>
      parseApiEnvironment({
        ...database,
        API_BASE_URL: "https://api.example.com",
        CRON_SECRET: "c".repeat(32),
        SLACK_REQUIRED: "true",
        WORKFLOW_INTERNAL_SECRET: "w".repeat(32)
      })
    ).toThrow();

    expect(
      parseApiEnvironment({
        ...database,
        API_BASE_URL: "https://api.example.com",
        CRON_SECRET: "c".repeat(32),
        EMAIL_FROM: "Pager <pager@example.com>",
        RESEND_API_KEY: "re_test",
        SLACK_ACTION_SECRET: "a".repeat(32),
        SLACK_BOT_TOKEN: "xoxb-test",
        SLACK_REQUIRED: "true",
        SLACK_SIGNING_SECRET: "signing",
        WORKFLOW_INTERNAL_SECRET: "w".repeat(32)
      }).SLACK_REQUIRED
    ).toBe("true");
  });

  it("requires an Auth.js domain or allowlist", () => {
    expect(() =>
      parseWebEnvironment({
        ...database,
        API_BASE_URL: "https://api.example.com",
        AUTH_GOOGLE_ID: "google-id",
        AUTH_GOOGLE_SECRET: "google-secret",
        AUTH_SECRET: "a".repeat(32),
        CRON_SECRET: "c".repeat(32),
        WEB_BASE_URL: "https://pager.example.com"
      })
    ).toThrow();

    expect(
      parseWebEnvironment({
        ...database,
        API_BASE_URL: "https://api.example.com",
        AUTH_GOOGLE_ALLOWED_DOMAIN: "example.com",
        AUTH_GOOGLE_ID: "google-id",
        AUTH_GOOGLE_SECRET: "google-secret",
        AUTH_SECRET: "a".repeat(32),
        CRON_SECRET: "c".repeat(32),
        WEB_BASE_URL: "https://pager.example.com"
      }).AUTH_GOOGLE_ALLOWED_DOMAIN
    ).toBe("example.com");
  });
});
