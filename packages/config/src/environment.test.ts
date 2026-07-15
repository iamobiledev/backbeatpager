import { describe, expect, it } from "vitest";

import {
  parseApiEnvironment,
  parseAppEnvironment,
  parseWebEnvironment
} from "./index.js";

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
        CRON_SECRET: "c".repeat(32),
        SLACK_REQUIRED: "true",
        WEB_BASE_URL: "https://pager.example.com",
        WORKFLOW_INTERNAL_SECRET: "w".repeat(32)
      })
    ).toThrow();

    expect(
      parseApiEnvironment({
        ...database,
        CRON_SECRET: "c".repeat(32),
        EMAIL_FROM: "Pager <pager@example.com>",
        RESEND_API_KEY: "re_test",
        SLACK_ACTION_SECRET: "a".repeat(32),
        SLACK_BOT_TOKEN: "xoxb-test",
        SLACK_REQUIRED: "true",
        SLACK_SIGNING_SECRET: "signing",
        WEB_BASE_URL: "https://pager.example.com",
        WORKFLOW_INTERNAL_SECRET: "w".repeat(32)
      }).SLACK_REQUIRED
    ).toBe("true");
  });

  it("requires an email allowlist or domain and login password", () => {
    expect(() =>
      parseAppEnvironment({
        ...database,
        AUTH_LOGIN_PASSWORD: "password123",
        AUTH_SECRET: "a".repeat(32),
        CRON_SECRET: "c".repeat(32),
        WEB_BASE_URL: "https://pager.example.com",
        WORKFLOW_INTERNAL_SECRET: "w".repeat(32)
      })
    ).toThrow();

    expect(
      parseWebEnvironment({
        ...database,
        AUTH_ALLOWED_DOMAIN: "example.com",
        AUTH_LOGIN_PASSWORD: "password123",
        AUTH_SECRET: "a".repeat(32),
        CRON_SECRET: "c".repeat(32),
        WEB_BASE_URL: "https://pager.example.com",
        WORKFLOW_INTERNAL_SECRET: "w".repeat(32)
      }).AUTH_ALLOWED_DOMAIN
    ).toBe("example.com");
  });
});
