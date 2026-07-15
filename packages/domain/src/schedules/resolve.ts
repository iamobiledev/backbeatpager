import { Temporal } from "@js-temporal/polyfill";

export type RotationType = "CUSTOM" | "DAILY" | "WEEKLY";

export interface ScheduleParticipantSnapshot {
  position: number;
  userId: string;
}

export interface ScheduleRestrictionSnapshot {
  dayOfWeek: number;
  endLocalTime: string;
  startLocalTime: string;
}

export interface ScheduleLayerSnapshot {
  activeFrom: Date | null;
  activeUntil: Date | null;
  anchorInstant: Date;
  anchorLocalDate: string;
  customIntervalMinutes: number | null;
  handoffLocalTime: string;
  id: string;
  participants: ScheduleParticipantSnapshot[];
  position: number;
  restrictions: ScheduleRestrictionSnapshot[];
  rotationInterval: number;
  rotationType: RotationType;
}

export interface ScheduleOverrideSnapshot {
  createdAt: Date;
  endsAt: Date;
  id: string;
  layerId: string | null;
  replacedUserId: string | null;
  replacementUserId: string;
  startsAt: Date;
}

export interface ScheduleSnapshot {
  id: string;
  layers: ScheduleLayerSnapshot[];
  overrides: ScheduleOverrideSnapshot[];
  timezone: string;
}

export interface ResolvedOnCall {
  layerIds: string[];
  overrideIds: string[];
  userId: string;
}

export interface ScheduleShift {
  endsAt: Date;
  startsAt: Date;
  userId: string;
}

function floorDiv(value: number, divisor: number): number {
  return Math.floor(value / divisor);
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function toInstant(date: Date): Temporal.Instant {
  return Temporal.Instant.fromEpochMilliseconds(date.getTime());
}

function toDate(instant: Temporal.Instant): Date {
  return new Date(instant.epochMilliseconds);
}

function plainDateTimeAt(
  date: Temporal.PlainDate,
  time: Temporal.PlainTime
): Temporal.PlainDateTime {
  return date.toPlainDateTime(time);
}

/**
 * Converts a wall-clock handoff to an instant. Ambiguous fall-back times choose
 * the earlier occurrence. Nonexistent spring-forward times advance minute by
 * minute to the first valid wall-clock instant after the gap.
 */
export function localDateTimeToInstant(
  date: Temporal.PlainDate,
  time: Temporal.PlainTime,
  timezone: string
): Temporal.Instant {
  const requested = plainDateTimeAt(date, time);
  const fields = {
    calendar: requested.calendarId,
    day: requested.day,
    hour: requested.hour,
    microsecond: requested.microsecond,
    millisecond: requested.millisecond,
    minute: requested.minute,
    month: requested.month,
    nanosecond: requested.nanosecond,
    second: requested.second,
    timeZone: timezone,
    year: requested.year
  };
  const earlier = Temporal.ZonedDateTime.from(fields, {
    disambiguation: "earlier"
  });

  if (earlier.toPlainDateTime().equals(requested)) {
    return earlier.toInstant();
  }

  const later = Temporal.ZonedDateTime.from(fields, {
    disambiguation: "later"
  });

  if (later.toPlainDateTime().equals(requested)) {
    return later.toInstant();
  }

  for (let minute = 1; minute <= 180; minute += 1) {
    const candidate = requested.add({ minutes: minute });
    try {
      return Temporal.ZonedDateTime.from(
        {
          calendar: candidate.calendarId,
          day: candidate.day,
          hour: candidate.hour,
          microsecond: candidate.microsecond,
          millisecond: candidate.millisecond,
          minute: candidate.minute,
          month: candidate.month,
          nanosecond: candidate.nanosecond,
          second: candidate.second,
          timeZone: timezone,
          year: candidate.year
        },
        { disambiguation: "reject" }
      ).toInstant();
    } catch {
      // Continue through the timezone gap.
    }
  }

  throw new Error(
    `Could not resolve local time ${requested.toString()} in ${timezone}`
  );
}

function isLayerActive(layer: ScheduleLayerSnapshot, at: Date): boolean {
  return (
    (!layer.activeFrom || layer.activeFrom.getTime() <= at.getTime()) &&
    (!layer.activeUntil || at.getTime() < layer.activeUntil.getTime())
  );
}

function localDayOfWeek(date: Temporal.PlainDate): number {
  return date.dayOfWeek % 7;
}

function isRestrictionActive(
  restriction: ScheduleRestrictionSnapshot,
  local: Temporal.ZonedDateTime
): boolean {
  const currentDate = local.toPlainDate();
  const currentTime = local.toPlainTime();
  const start = Temporal.PlainTime.from(restriction.startLocalTime);
  const end = Temporal.PlainTime.from(restriction.endLocalTime);
  const sameDayWindow = Temporal.PlainTime.compare(start, end) < 0;

  if (sameDayWindow) {
    return (
      localDayOfWeek(currentDate) === restriction.dayOfWeek &&
      Temporal.PlainTime.compare(currentTime, start) >= 0 &&
      Temporal.PlainTime.compare(currentTime, end) < 0
    );
  }

  const nextDay = (restriction.dayOfWeek + 1) % 7;
  return (
    (localDayOfWeek(currentDate) === restriction.dayOfWeek &&
      Temporal.PlainTime.compare(currentTime, start) >= 0) ||
    (localDayOfWeek(currentDate) === nextDay &&
      Temporal.PlainTime.compare(currentTime, end) < 0)
  );
}

function restrictionsAllow(
  layer: ScheduleLayerSnapshot,
  local: Temporal.ZonedDateTime
): boolean {
  return (
    layer.restrictions.length === 0 ||
    layer.restrictions.some((restriction) =>
      isRestrictionActive(restriction, local)
    )
  );
}

function calendarRotationIndex(
  layer: ScheduleLayerSnapshot,
  local: Temporal.ZonedDateTime
): number {
  const anchorDate = Temporal.PlainDate.from(layer.anchorLocalDate);
  const handoff = Temporal.PlainTime.from(layer.handoffLocalTime);
  const effectiveDate =
    Temporal.PlainTime.compare(local.toPlainTime(), handoff) < 0
      ? local.toPlainDate().subtract({ days: 1 })
      : local.toPlainDate();
  const elapsedDays = anchorDate.until(effectiveDate, {
    largestUnit: "days"
  }).days;
  const periodDays =
    layer.rotationType === "WEEKLY"
      ? 7 * layer.rotationInterval
      : layer.rotationInterval;

  return floorDiv(elapsedDays, periodDays);
}

function customRotationIndex(layer: ScheduleLayerSnapshot, at: Date): number {
  if (!layer.customIntervalMinutes) {
    throw new Error(`Custom layer ${layer.id} has no interval`);
  }

  const elapsedMilliseconds = at.getTime() - layer.anchorInstant.getTime();
  const periodMilliseconds = layer.customIntervalMinutes * 60_000;
  return floorDiv(elapsedMilliseconds, periodMilliseconds);
}

export function resolveLayerAt(
  layer: ScheduleLayerSnapshot,
  timezone: string,
  at: Date
): string | null {
  if (!isLayerActive(layer, at) || layer.participants.length === 0) {
    return null;
  }

  const local = toInstant(at).toZonedDateTimeISO(timezone);
  if (!restrictionsAllow(layer, local)) {
    return null;
  }

  const participants = [...layer.participants].sort(
    (left, right) => left.position - right.position
  );
  const rotationIndex =
    layer.rotationType === "CUSTOM"
      ? customRotationIndex(layer, at)
      : calendarRotationIndex(layer, local);

  return participants[positiveModulo(rotationIndex, participants.length)]!
    .userId;
}

function activeOverrideFor(
  schedule: ScheduleSnapshot,
  layer: ScheduleLayerSnapshot,
  baseUserId: string,
  at: Date
): ScheduleOverrideSnapshot | null {
  const active = schedule.overrides.filter(
    (override) =>
      override.startsAt.getTime() <= at.getTime() &&
      at.getTime() < override.endsAt.getTime() &&
      (!override.layerId || override.layerId === layer.id) &&
      (!override.replacedUserId || override.replacedUserId === baseUserId)
  );

  active.sort((left, right) => {
    const layerSpecificity =
      Number(Boolean(right.layerId)) - Number(Boolean(left.layerId));
    if (layerSpecificity !== 0) return layerSpecificity;

    const userSpecificity =
      Number(Boolean(right.replacedUserId)) -
      Number(Boolean(left.replacedUserId));
    if (userSpecificity !== 0) return userSpecificity;

    const startsAt = right.startsAt.getTime() - left.startsAt.getTime();
    if (startsAt !== 0) return startsAt;

    return right.createdAt.getTime() - left.createdAt.getTime();
  });

  return active[0] ?? null;
}

export function resolveScheduleAt(
  schedule: ScheduleSnapshot,
  at: Date
): ResolvedOnCall[] {
  const users = new Map<string, ResolvedOnCall>();
  const layers = [...schedule.layers].sort(
    (left, right) => left.position - right.position
  );

  for (const layer of layers) {
    const baseUserId = resolveLayerAt(layer, schedule.timezone, at);
    if (!baseUserId) continue;

    const override = activeOverrideFor(schedule, layer, baseUserId, at);
    const userId = override?.replacementUserId ?? baseUserId;
    const existing = users.get(userId);

    if (existing) {
      existing.layerIds.push(layer.id);
      if (override) existing.overrideIds.push(override.id);
    } else {
      users.set(userId, {
        layerIds: [layer.id],
        overrideIds: override ? [override.id] : [],
        userId
      });
    }
  }

  return [...users.values()];
}

function onCallSignature(onCall: ResolvedOnCall[]): string {
  return onCall
    .map(({ userId }) => userId)
    .sort()
    .join("|");
}

function addCandidate(
  candidates: Map<number, Date>,
  candidate: Date,
  after: Date
): void {
  if (candidate.getTime() > after.getTime()) {
    candidates.set(candidate.getTime(), candidate);
  }
}

function nextRotationBoundary(
  layer: ScheduleLayerSnapshot,
  timezone: string,
  after: Date
): Date | null {
  if (layer.participants.length <= 1) return null;

  if (layer.rotationType === "CUSTOM") {
    if (!layer.customIntervalMinutes) return null;
    const periodMilliseconds = layer.customIntervalMinutes * 60_000;
    const elapsed = after.getTime() - layer.anchorInstant.getTime();
    const nextIndex = floorDiv(elapsed, periodMilliseconds) + 1;
    return new Date(
      layer.anchorInstant.getTime() + nextIndex * periodMilliseconds
    );
  }

  const local = toInstant(after).toZonedDateTimeISO(timezone);
  const currentIndex = calendarRotationIndex(layer, local);
  const periodDays =
    layer.rotationType === "WEEKLY"
      ? 7 * layer.rotationInterval
      : layer.rotationInterval;
  const boundaryDate = Temporal.PlainDate.from(layer.anchorLocalDate).add({
    days: (currentIndex + 1) * periodDays
  });
  const boundary = localDateTimeToInstant(
    boundaryDate,
    Temporal.PlainTime.from(layer.handoffLocalTime),
    timezone
  );

  return toDate(boundary);
}

function restrictionBoundaries(
  layer: ScheduleLayerSnapshot,
  timezone: string,
  after: Date
): Date[] {
  const localDate = toInstant(after).toZonedDateTimeISO(timezone).toPlainDate();
  const boundaries: Date[] = [];

  for (let offset = -1; offset <= 8; offset += 1) {
    const date = localDate.add({ days: offset });
    for (const restriction of layer.restrictions) {
      if (localDayOfWeek(date) !== restriction.dayOfWeek) continue;

      const start = Temporal.PlainTime.from(restriction.startLocalTime);
      const end = Temporal.PlainTime.from(restriction.endLocalTime);
      const endDate =
        Temporal.PlainTime.compare(start, end) < 0
          ? date
          : date.add({ days: 1 });

      boundaries.push(
        toDate(localDateTimeToInstant(date, start, timezone)),
        toDate(localDateTimeToInstant(endDate, end, timezone))
      );
    }
  }

  return boundaries;
}

export function findNextScheduleChange(
  schedule: ScheduleSnapshot,
  after: Date
): Date | null {
  const candidates = new Map<number, Date>();

  for (const override of schedule.overrides) {
    addCandidate(candidates, override.startsAt, after);
    addCandidate(candidates, override.endsAt, after);
  }

  for (const layer of schedule.layers) {
    if (layer.activeFrom) addCandidate(candidates, layer.activeFrom, after);
    if (layer.activeUntil) addCandidate(candidates, layer.activeUntil, after);

    const rotationBoundary = nextRotationBoundary(
      layer,
      schedule.timezone,
      after
    );
    if (rotationBoundary) addCandidate(candidates, rotationBoundary, after);

    for (const boundary of restrictionBoundaries(
      layer,
      schedule.timezone,
      after
    )) {
      addCandidate(candidates, boundary, after);
    }
  }

  const signature = onCallSignature(resolveScheduleAt(schedule, after));
  const sorted = [...candidates.values()].sort(
    (left, right) => left.getTime() - right.getTime()
  );

  for (const candidate of sorted) {
    if (onCallSignature(resolveScheduleAt(schedule, candidate)) !== signature) {
      return candidate;
    }
  }

  return null;
}

export function listShifts(
  schedule: ScheduleSnapshot,
  startsAt: Date,
  endsAt: Date
): ScheduleShift[] {
  if (endsAt.getTime() <= startsAt.getTime()) {
    throw new Error("Shift range must end after it starts");
  }

  const shifts: ScheduleShift[] = [];
  let cursor = startsAt;

  for (let iteration = 0; iteration < 10_000; iteration += 1) {
    if (cursor.getTime() >= endsAt.getTime()) return shifts;

    const onCall = resolveScheduleAt(schedule, cursor);
    const nextChange = findNextScheduleChange(schedule, cursor);
    const segmentEnd =
      nextChange && nextChange.getTime() < endsAt.getTime()
        ? nextChange
        : endsAt;

    for (const resolved of onCall) {
      const previous = shifts.at(-1);
      if (
        previous?.userId === resolved.userId &&
        previous.endsAt.getTime() === cursor.getTime()
      ) {
        previous.endsAt = segmentEnd;
      } else {
        shifts.push({
          endsAt: segmentEnd,
          startsAt: cursor,
          userId: resolved.userId
        });
      }
    }

    cursor = segmentEnd;
  }

  throw new Error("Schedule produced too many changes for the requested range");
}
