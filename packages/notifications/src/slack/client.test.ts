import { ErrorCode } from "@slack/web-api";
import { describe, expect, it, vi } from "vitest";

import { withSlackRetry } from "./client.js";

describe("Slack API retry policy", () => {
  it("honors rate limits and eventually succeeds", async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce({
        code: ErrorCode.RateLimitedError,
        retryAfter: 1
      })
      .mockRejectedValueOnce({ statusCode: 500 })
      .mockResolvedValue("sent");
    const sleep = vi.fn<(_: number) => Promise<void>>().mockResolvedValue();

    await expect(
      withSlackRetry(operation, { maxAttempts: 4, sleep })
    ).resolves.toBe("sent");
    expect(operation).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenNthCalledWith(1, 1000);
    expect(sleep).toHaveBeenNthCalledWith(2, 2000);
  });

  it("does not retry terminal provider errors", async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValue({ statusCode: 400 });

    await expect(withSlackRetry(operation)).rejects.toMatchObject({
      statusCode: 400
    });
    expect(operation).toHaveBeenCalledOnce();
  });

  it("does not retry Slack platform errors such as invalid_auth", async () => {
    const operation = vi.fn<() => Promise<string>>().mockRejectedValue({
      code: "slack_webapi_platform_error",
      data: { error: "invalid_auth", ok: false }
    });

    await expect(withSlackRetry(operation)).rejects.toMatchObject({
      data: { error: "invalid_auth" }
    });
    expect(operation).toHaveBeenCalledOnce();
  });
});
