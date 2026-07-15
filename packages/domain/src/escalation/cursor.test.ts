import { describe, expect, it } from "vitest";

import { advanceEscalationCursor, firstEscalationStep } from "./cursor.js";

const steps = [
  { id: "second", position: 1, timeoutMinutes: 10 },
  { id: "first", position: 0, timeoutMinutes: 5 }
];

describe("escalation cursor", () => {
  it("selects the first ordered step", () => {
    expect(firstEscalationStep(steps)).toEqual({
      exhausted: false,
      next: { loop: 0, position: 0 },
      step: { id: "first", position: 0, timeoutMinutes: 5 }
    });
  });

  it("advances through ordered steps", () => {
    expect(
      advanceEscalationCursor(steps, { loop: 0, position: 0 }, 1)
    ).toMatchObject({
      exhausted: false,
      next: { loop: 0, position: 1 },
      step: { id: "second" }
    });
  });

  it("repeats the configured number of additional loops", () => {
    expect(
      advanceEscalationCursor(steps, { loop: 0, position: 1 }, 1)
    ).toMatchObject({
      exhausted: false,
      next: { loop: 1, position: 0 },
      step: { id: "first" }
    });
    expect(advanceEscalationCursor(steps, { loop: 1, position: 1 }, 1)).toEqual(
      {
        exhausted: true,
        next: null,
        step: null
      }
    );
  });

  it("exhausts an empty policy", () => {
    expect(firstEscalationStep([])).toEqual({
      exhausted: true,
      next: null,
      step: null
    });
  });
});
