import { describe, expect, it } from "vitest";

import {
  generateRoutingKey,
  hashRoutingKey,
  parseRoutingKey,
  verifyRoutingKey
} from "./routing-keys.js";

describe("service routing keys", () => {
  it("generates a parseable key and one-way hash", async () => {
    const generated = await generateRoutingKey();

    expect(generated.routingKey).toMatch(
      /^bbp_[a-f0-9]{12}\.[A-Za-z0-9_-]{43}$/
    );
    expect(generated.prefix).toBe(
      generated.routingKey.slice(0, generated.routingKey.indexOf("."))
    );
    expect(generated.hash).not.toContain(generated.routingKey);
    expect(parseRoutingKey(generated.routingKey)).toEqual({
      prefix: generated.prefix
    });
    await expect(
      verifyRoutingKey(generated.hash, generated.routingKey)
    ).resolves.toBe(true);
  });

  it("rejects malformed and incorrect keys", async () => {
    const generated = await generateRoutingKey();
    const other = await generateRoutingKey();

    expect(parseRoutingKey("not-a-routing-key")).toBeNull();
    await expect(
      verifyRoutingKey(generated.hash, "not-a-routing-key")
    ).resolves.toBe(false);
    await expect(
      verifyRoutingKey(generated.hash, other.routingKey)
    ).resolves.toBe(false);
    await expect(hashRoutingKey("not-a-routing-key")).rejects.toThrow(
      "Cannot hash a malformed routing key"
    );
  });
});
