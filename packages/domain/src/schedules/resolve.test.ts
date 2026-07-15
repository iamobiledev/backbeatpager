import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import {
  findNextScheduleChange,
  listShifts,
  localDateTimeToInstant,
  resolveScheduleAt,
  type ScheduleLayerSnapshot,
  type ScheduleSnapshot
} from "./resolve.js";

function layer(
  overrides: Partial<ScheduleLayerSnapshot> = {}
): ScheduleLayerSnapshot {
  return {
    activeFrom: null,
    activeUntil: null,
    anchorInstant: new Date("2026-01-05T09:00:00.000Z"),
    anchorLocalDate: "2026-01-05",
    customIntervalMinutes: null,
    handoffLocalTime: "09:00",
    id: "primary",
    participants: [
      { position: 0, userId: "alice" },
      { position: 1, userId: "bob" }
    ],
    position: 0,
    restrictions: [],
    rotationInterval: 1,
    rotationType: "WEEKLY",
    ...overrides
  };
}

function schedule(overrides: Partial<ScheduleSnapshot> = {}): ScheduleSnapshot {
  return {
    id: "schedule",
    layers: [layer()],
    overrides: [],
    timezone: "UTC",
    ...overrides
  };
}

describe("schedule resolution", () => {
  it("rotates weekly at the configured wall-clock handoff", () => {
    const snapshot = schedule();

    expect(
      resolveScheduleAt(snapshot, new Date("2026-01-12T08:59:59.999Z"))[0]
        ?.userId
    ).toBe("alice");
    expect(
      resolveScheduleAt(snapshot, new Date("2026-01-12T09:00:00.000Z"))[0]
        ?.userId
    ).toBe("bob");
    expect(
      resolveScheduleAt(snapshot, new Date("2026-01-19T09:00:00.000Z"))[0]
        ?.userId
    ).toBe("alice");
  });

  it("supports daily intervals and dates before the anchor", () => {
    const snapshot = schedule({
      layers: [
        layer({
          rotationInterval: 2,
          rotationType: "DAILY"
        })
      ]
    });

    expect(
      resolveScheduleAt(snapshot, new Date("2026-01-04T10:00:00.000Z"))[0]
        ?.userId
    ).toBe("bob");
    expect(
      resolveScheduleAt(snapshot, new Date("2026-01-07T08:59:00.000Z"))[0]
        ?.userId
    ).toBe("alice");
    expect(
      resolveScheduleAt(snapshot, new Date("2026-01-07T09:00:00.000Z"))[0]
        ?.userId
    ).toBe("bob");
  });

  it("supports fixed custom intervals", () => {
    const snapshot = schedule({
      layers: [
        layer({
          anchorInstant: new Date("2026-01-01T00:00:00.000Z"),
          customIntervalMinutes: 90,
          rotationType: "CUSTOM"
        })
      ]
    });

    expect(
      resolveScheduleAt(snapshot, new Date("2026-01-01T01:29:59.999Z"))[0]
        ?.userId
    ).toBe("alice");
    expect(
      resolveScheduleAt(snapshot, new Date("2026-01-01T01:30:00.000Z"))[0]
        ?.userId
    ).toBe("bob");
  });

  it("honors same-day and cross-midnight restrictions", () => {
    const snapshot = schedule({
      layers: [
        layer({
          restrictions: [
            {
              dayOfWeek: 1,
              endLocalTime: "17:00",
              startLocalTime: "09:00"
            },
            {
              dayOfWeek: 5,
              endLocalTime: "02:00",
              startLocalTime: "22:00"
            }
          ]
        })
      ]
    });

    expect(
      resolveScheduleAt(snapshot, new Date("2026-01-05T12:00:00.000Z"))
    ).toHaveLength(1);
    expect(
      resolveScheduleAt(snapshot, new Date("2026-01-05T18:00:00.000Z"))
    ).toHaveLength(0);
    expect(
      resolveScheduleAt(snapshot, new Date("2026-01-09T23:00:00.000Z"))
    ).toHaveLength(1);
    expect(
      resolveScheduleAt(snapshot, new Date("2026-01-10T01:59:59.000Z"))
    ).toHaveLength(1);
    expect(
      resolveScheduleAt(snapshot, new Date("2026-01-10T02:00:00.000Z"))
    ).toHaveLength(0);
  });

  it("uses layer-specific overrides and deduplicates users across layers", () => {
    const snapshot = schedule({
      layers: [
        layer(),
        layer({
          id: "secondary",
          participants: [{ position: 0, userId: "carol" }],
          position: 1
        }),
        layer({
          id: "duplicate",
          participants: [{ position: 0, userId: "carol" }],
          position: 2
        })
      ],
      overrides: [
        {
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          endsAt: new Date("2026-02-01T00:00:00.000Z"),
          id: "override",
          layerId: "primary",
          replacedUserId: "alice",
          replacementUserId: "dana",
          startsAt: new Date("2026-01-01T00:00:00.000Z")
        }
      ]
    });

    expect(
      resolveScheduleAt(snapshot, new Date("2026-01-05T10:00:00.000Z"))
    ).toEqual([
      {
        layerIds: ["primary"],
        overrideIds: ["override"],
        userId: "dana"
      },
      {
        layerIds: ["secondary", "duplicate"],
        overrideIds: [],
        userId: "carol"
      }
    ]);
  });

  it("finds override and rotation changes and lists contiguous shifts", () => {
    const snapshot = schedule({
      overrides: [
        {
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          endsAt: new Date("2026-01-06T12:00:00.000Z"),
          id: "override",
          layerId: null,
          replacedUserId: null,
          replacementUserId: "carol",
          startsAt: new Date("2026-01-06T10:00:00.000Z")
        }
      ]
    });

    expect(
      findNextScheduleChange(
        snapshot,
        new Date("2026-01-06T09:00:00.000Z")
      )?.toISOString()
    ).toBe("2026-01-06T10:00:00.000Z");

    expect(
      listShifts(
        snapshot,
        new Date("2026-01-06T09:00:00.000Z"),
        new Date("2026-01-06T13:00:00.000Z")
      ).map((shift) => ({
        end: shift.endsAt.toISOString(),
        start: shift.startsAt.toISOString(),
        userId: shift.userId
      }))
    ).toEqual([
      {
        end: "2026-01-06T10:00:00.000Z",
        start: "2026-01-06T09:00:00.000Z",
        userId: "alice"
      },
      {
        end: "2026-01-06T12:00:00.000Z",
        start: "2026-01-06T10:00:00.000Z",
        userId: "carol"
      },
      {
        end: "2026-01-06T13:00:00.000Z",
        start: "2026-01-06T12:00:00.000Z",
        userId: "alice"
      }
    ]);
  });
});

describe("DST handoff policy", () => {
  it("advances a New York spring gap to the first valid instant", () => {
    const instant = localDateTimeToInstant(
      Temporal.PlainDate.from("2026-03-08"),
      Temporal.PlainTime.from("02:30"),
      "America/New_York"
    );

    expect(instant.toString()).toBe("2026-03-08T07:00:00Z");
  });

  it("chooses the earlier New York fall-back occurrence", () => {
    const instant = localDateTimeToInstant(
      Temporal.PlainDate.from("2026-11-01"),
      Temporal.PlainTime.from("01:30"),
      "America/New_York"
    );

    expect(instant.toString()).toBe("2026-11-01T05:30:00Z");
  });

  it("applies the same policy in Europe/Berlin", () => {
    expect(
      localDateTimeToInstant(
        Temporal.PlainDate.from("2026-03-29"),
        Temporal.PlainTime.from("02:30"),
        "Europe/Berlin"
      ).toString()
    ).toBe("2026-03-29T01:00:00Z");

    expect(
      localDateTimeToInstant(
        Temporal.PlainDate.from("2026-10-25"),
        Temporal.PlainTime.from("02:30"),
        "Europe/Berlin"
      ).toString()
    ).toBe("2026-10-25T00:30:00Z");
  });

  it("keeps daily rotations pinned to local wall clock through DST", () => {
    const snapshot = schedule({
      layers: [
        layer({
          anchorInstant: new Date("2026-03-07T07:30:00.000Z"),
          anchorLocalDate: "2026-03-07",
          handoffLocalTime: "02:30",
          rotationType: "DAILY"
        })
      ],
      timezone: "America/New_York"
    });

    expect(
      resolveScheduleAt(snapshot, new Date("2026-03-08T06:59:59.999Z"))[0]
        ?.userId
    ).toBe("alice");
    expect(
      resolveScheduleAt(snapshot, new Date("2026-03-08T07:00:00.000Z"))[0]
        ?.userId
    ).toBe("bob");
    expect(
      findNextScheduleChange(
        snapshot,
        new Date("2026-03-08T06:00:00.000Z")
      )?.toISOString()
    ).toBe("2026-03-08T07:00:00.000Z");
  });
});
