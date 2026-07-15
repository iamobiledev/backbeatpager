# Incident, escalation, and schedule semantics

## Alert deduplication

- A routing key authenticates one service.
- The logical alert key is `(service, dedup_key)`.
- PostgreSQL enforces at most one triggered/acknowledged incident for that key.
- Every accepted webhook is preserved as an `AlertOccurrence`; retries with the
  same request/idempotency identity are harmless.
- A trigger after resolution opens a new incident.

## Lifecycle

```text
TRIGGERED → ACKNOWLEDGED → RESOLVED
     └──────────────────────→
```

- Trigger refreshes summary/source/severity but does not unacknowledge an
  already acknowledged incident.
- Acknowledge cancels escalation, nag, and incident-channel deadlines.
- Resolve is allowed from triggered or acknowledged and cancels all timers.
- Optional acknowledgement expiry returns an incident to triggered and resumes
  its current escalation step.
- Every mutation is attributed and appended to the immutable timeline.

## Escalation

- Steps are ordered by position.
- All targets in one step are expanded in parallel and deduplicated by user.
- User targets page that user.
- Schedule targets page every active layer's current user.
- Team targets page active members.
- After a step timeout, the next step starts. At the final step, the policy
  returns to step one until its configured repeat loops are exhausted.
- Exhaustion never silently resolves the incident.
- Workflow generations make stale delayed work a no-op.

## Nagging and snooze

- Nag intervals are configured per severity on the service.
- A nag posts a fresh DM while canonical service/incident/previous DM messages
  are updated in place.
- Acknowledge stops nags immediately by invalidating the generation.
- **Snooze 15m** moves both the current escalation deadline and nag deadline 15
  minutes forward. An earlier critical-channel deadline is also moved forward.

## Schedule rotations

- Instants are stored in UTC; rotation rules are interpreted in the schedule's
  IANA timezone.
- Daily and weekly rotations use local calendar arithmetic, not fixed
  24-hour/7-day milliseconds.
- Custom rotations use fixed minute durations from the anchor instant.
- Layer restrictions are local weekday/time windows and may cross midnight.
- Every active layer contributes a current user; duplicate users across layers
  are notified once.

### DST policy

- A nonexistent spring-forward handoff moves to the first valid local instant
  after the gap.
- An ambiguous fall-back handoff uses the earlier occurrence.
- Daily/weekly handoffs remain pinned to the configured wall-clock time.

## Overrides

- Overrides are half-open UTC intervals: `[startsAt, endsAt)`.
- Layer-specific and replaced-user-specific overrides are more specific than
  schedule-wide coverage.
- Equivalent scopes cannot overlap; PostgreSQL enforces this with a GiST
  exclusion constraint.
- Override start/end is a schedule change and can produce a handoff message.

## Scheduled communication

- Handoff workflows sleep until the resolver's next actual user-set change,
  recompute both sides at wake time, and post once using a deterministic outbox
  key.
- Downtime catch-up processes missed boundaries in order.
- Weekly digests run at the team's configured local weekday/time and cover the
  preceding seven days.
- MTTA is opening to first acknowledgement; MTTR is opening to resolution.
  Incidents missing an endpoint are excluded from that average but included in
  explicit counts.
