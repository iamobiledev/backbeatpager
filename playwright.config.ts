import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  expect: {
    timeout: 10_000
  },
  reporter: [["list"]],
  testDir: "./tests/e2e",
  timeout: 60_000,
  webServer:
    process.env.PLAYWRIGHT_START_SERVER === "true"
      ? {
          command: "pnpm --filter @backbeat/web dev --port 3104",
          reuseExistingServer: false,
          timeout: 120_000,
          url: "http://127.0.0.1:3104"
        }
      : undefined,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3104",
    channel: "chrome",
    screenshot: "only-on-failure",
    trace: "retain-on-failure"
  }
});
