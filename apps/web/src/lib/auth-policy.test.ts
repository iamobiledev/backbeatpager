import { describe, expect, it } from "vitest";

import { emailIsAllowed } from "./auth-policy.js";

describe("console email policy", () => {
  it("allows the configured Workspace domain case-insensitively", () => {
    expect(
      emailIsAllowed("Alice@Example.COM", {
        allowedDomain: "example.com"
      })
    ).toBe(true);
    expect(
      emailIsAllowed("alice@external.com", {
        allowedDomain: "example.com"
      })
    ).toBe(false);
  });

  it("supports explicit exceptions without opening the whole domain", () => {
    expect(
      emailIsAllowed("contractor@partner.example", {
        allowedDomain: "example.com",
        allowedEmails: "contractor@partner.example"
      })
    ).toBe(true);
    expect(emailIsAllowed("unknown@partner.example", {})).toBe(false);
  });
});
