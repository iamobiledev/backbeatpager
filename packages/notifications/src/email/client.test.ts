import { describe, expect, it, vi } from "vitest";

import { withEmailRetry } from "./client.js";

describe("Resend retry policy", () => {
  it("retries rate limits and server failures", async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce({ statusCode: 429 })
      .mockRejectedValueOnce({ statusCode: 503 })
      .mockResolvedValue("email-id");
    const sleep = vi.fn<(_: number) => Promise<void>>().mockResolvedValue();

    await expect(
      withEmailRetry(operation, { maxAttempts: 4, sleep })
    ).resolves.toBe("email-id");
    expect(operation).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenNthCalledWith(1, 1000);
    expect(sleep).toHaveBeenNthCalledWith(2, 2000);
  });

  it("does not retry invalid requests", async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValue({ statusCode: 422 });

    await expect(withEmailRetry(operation)).rejects.toMatchObject({
      statusCode: 422
    });
    expect(operation).toHaveBeenCalledOnce();
  });
});
