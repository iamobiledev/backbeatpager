# Backbeat Pager

Backbeat Pager is a Slack-first, single-organization on-call and incident
management service. It is designed as a lightweight PagerDuty replacement for
internal engineering teams.

> **Current delivery:** Phase 3 adds rich Slack paging, DM and channel message
> synchronization, signed incident buttons, reassignment, nagging, critical
> incident channels, and Resend email delivery.

## Architecture

| Area               | Technology                              |
| ------------------ | --------------------------------------- |
| Admin UI           | Next.js App Router, React, Tailwind CSS |
| API                | Fastify on Vercel Fluid Compute         |
| Database           | PostgreSQL on Neon                      |
| ORM and migrations | Prisma                                  |
| Durable execution  | Vercel Workflows                        |
| Slack              | Bolt for JavaScript over HTTP           |
| Email              | Resend                                  |
| Authentication     | Google OIDC with Auth.js (Phase 5)      |

The repository deploys as two Vercel projects:

- `apps/api` — Fastify API, Slack HTTP receiver, and Workflow definitions.
- `apps/web` — Next.js administration UI.

Both projects use one Neon database. PostgreSQL is the source of truth; durable
workflow state is orchestration metadata.

## Repository layout

```text
apps/api                 Fastify API
apps/web                 Next.js admin UI
packages/config          Runtime configuration validation
packages/contracts       Shared API/domain contracts
packages/db              Prisma schema, migration, client, seed
packages/domain          Incident and schedule domain logic
packages/notifications   Slack and Resend notifications
packages/workflows       Typed Vercel Workflow contracts
tests/integration        Database and service integration tests
```

## Requirements

- Node.js 22 or newer
- pnpm 10.33.3 (Corepack reads the pinned `packageManager`)
- PostgreSQL 16+, or Docker with Compose

Redis is intentionally not required. Vercel Workflows replace BullMQ and
long-running worker processes.

## Local setup

### Run with local Node.js and PostgreSQL

```bash
corepack enable
pnpm install
cp .env.example .env

# Start PostgreSQL however you normally run it, then:
pnpm db:migrate:deploy
pnpm db:seed
pnpm dev
```

The API is available at `http://localhost:3001`; the admin shell is at
`http://localhost:3000`.

### Run everything with Compose

```bash
docker compose up --build
```

Compose starts PostgreSQL, applies migrations once, then starts the API and web
applications. Data is retained in the `postgres-data` volume.

### Demo data

`pnpm db:seed` is repeatable and creates:

- one admin and two responders;
- a Payments team;
- a weekly, two-person primary schedule;
- a two-step escalation policy (schedule, then team);
- a Payments API service.

The seed rotates the demo service routing key on every run and prints it exactly
once with a ready-to-run curl command. The plaintext key is never stored.
Optional Slack IDs can be supplied through the `DEMO_*` environment variables.

To fire a unique demo alert using the printed key:

```bash
DEMO_ROUTING_KEY='bbp_...' pnpm demo:alert
```

## Alert ingestion

The PagerDuty-compatible endpoint is:

```text
POST /api/v1/alerts
```

```json
{
  "routing_key": "bbp_...",
  "event_action": "trigger",
  "dedup_key": "payments-api-production",
  "payload": {
    "summary": "Payment authorization failures",
    "severity": "critical",
    "source": "payments-api",
    "source_url": "https://monitoring.example.com/alerts/123",
    "custom_details": {
      "environment": "production"
    }
  }
}
```

Routing keys may instead be supplied as `Authorization: Bearer <key>` or
`X-Routing-Key`. Trigger, acknowledge, and resolve calls return `202` after the
database transaction and durable Workflow start are accepted. Identical retries
are idempotent; service plus `dedup_key` has at most one open incident.

Adapters:

- `POST /api/v1/integrations/generic`
- `POST /api/v1/integrations/alertmanager`
- `POST /api/v1/integrations/grafana`

See [Alertmanager configuration](docs/alertmanager.md) and
[Grafana configuration](docs/grafana.md).

## Durable escalation

Every incident generation is registered in PostgreSQL before Vercel Workflow
execution. A Workflow sleeps until the escalation or acknowledgment-expiry
deadline, re-reads canonical state, and no-ops if its generation is stale.
Transitions start a new generation, making retries and duplicate delivery safe.

The signed daily `POST /internal/reconcile` Vercel Cron repairs the rare gap
between a committed database transaction and Workflow start. Core escalation
timing uses Workflow sleeps and does not depend on Cron precision.

## Database connections

Prisma 7 uses two connection strings:

- `DATABASE_URL` — runtime connection. In Vercel, use the Neon **pooled**
  hostname (`-pooler`).
- `DIRECT_URL` — migration connection. Use the Neon **direct** hostname.

The runtime automatically selects the Neon adapter for `*.neon.tech` and the
standard PostgreSQL adapter locally. Override this with
`DATABASE_DRIVER=neon|pg`.

Never execute migrations during a function cold start. Run
`pnpm db:migrate:deploy` as an explicit release/CI step using `DIRECT_URL`.

## Useful commands

```bash
pnpm format:check       # Verify Prettier formatting
pnpm lint               # Strict ESLint
pnpm typecheck          # Typecheck every workspace
pnpm test               # Unit tests; DB tests skip without TEST_DATABASE_URL
pnpm build              # Build all packages and both applications
pnpm db:generate        # Generate Prisma Client
pnpm db:migrate:deploy  # Apply checked-in migrations
pnpm db:migrate:dev     # Create a development migration
pnpm db:reset           # Destructively reset a local database
pnpm db:seed            # Create/refresh demo configuration
pnpm demo:alert         # Fire a demo alert using DEMO_ROUTING_KEY
```

To execute database integration tests:

```bash
TEST_DATABASE_URL="$DATABASE_URL" pnpm test
```

Use only an isolated test database: the constraint suite truncates application
tables before running.

## Neon setup

1. Create a Neon project in the region nearest the Vercel functions.
2. Copy the pooled connection string to `DATABASE_URL`.
3. Copy the direct connection string to `DIRECT_URL`.
4. Run `pnpm db:migrate:deploy`.
5. Optionally create a Neon branch per Vercel Preview environment.

The initial migration enables `btree_gist`, which Neon supports, to enforce
non-overlapping schedule overrides. It also enforces open-incident deduplication
and escalation target integrity directly in PostgreSQL.

## Vercel setup

Create two projects from this repository:

1. API project with Root Directory `apps/api`.
2. Web project with Root Directory `apps/web`.

Set the same region as the Neon primary (the checked-in default is `iad1`) and
configure the environment variables from `.env.example`. Add runtime database
variables to both projects once the web administration data layer is enabled.

For production releases:

1. Apply migrations to Neon using `DIRECT_URL`.
2. Deploy the API project.
3. Deploy the web project.

Use Vercel Deployment Protection for previews. Production Slack callbacks
should point only at the production API deployment.

## Slack app setup

1. Open Slack's app management page and create an app **from a manifest**.
2. Copy `manifest.yml`, replace every `YOUR_API_DOMAIN`, and install it in the
   organization workspace.
3. Add `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET` to the API Vercel project.
4. Generate a separate random `SLACK_ACTION_SECRET` of at least 32 bytes. It
   signs every incident button value so client-supplied IDs are never trusted.
5. Set `SLACK_REQUIRED=true` in production after configuration is complete.
6. Map each service to a Slack channel and ensure the bot is in private service
   channels. Public posting uses `chat:write.public`.

Slack sends events, commands, interactive actions, and URL verification to
`POST /slack/events`. Production uses HTTP mode only; Socket Mode is not
compatible with an indefinite serverless deployment.

The manifest includes the scopes needed for DMs, email-based user mapping,
public/private incident channel creation, member invitations, pins, commands,
and App Home. Phase 4 activates the commands and Home listeners already
declared by the manifest.

Slack users are mapped to active Backbeat Pager users by verified work email on
first interaction or delivery. Unmapped users receive a useful error and failed
pages are recorded in both `NotificationLog` and the incident timeline.

## Resend setup

1. Verify the sending domain in Resend.
2. Set `RESEND_API_KEY` and `EMAIL_FROM` in the API Vercel project.
3. Enable email in a user's notification preferences. Slack remains enabled
   unless explicitly disabled.

Every email uses a deterministic Resend idempotency key and a database unique
delivery record. Retryable `429`/`5xx` responses use exponential backoff;
terminal failures are recorded without stopping escalation.

## Slack paging behavior

- Each escalation target receives a DM with Acknowledge, Resolve, Escalate,
  Reassign, and Snooze 15m actions.
- One service-channel message is updated in place as state changes.
- Critical incidents can create and pin a dedicated
  `inc-<number>-<summary>` channel after the configured threshold.
- Severity-specific nag intervals send fresh DMs until acknowledgement.
- Acknowledge and resolve invalidate sleeping escalation/nag generations.
- Double clicks are safe: interaction receipts and signed message versions
  prevent duplicate state transitions.

## Data-model safety

The database migration enforces important invariants independently of the
application:

- only one triggered/acknowledged incident per service and deduplication key;
- exactly one user, schedule, or team for each escalation target;
- positive escalation timeouts and valid ordered positions;
- valid schedule times, ranges, and non-overlapping equivalent overrides;
- lowercase-insensitive unique user emails;
- idempotency keys for timelines, notifications, Slack interactions, outbox
  events, and Workflow runs.

Service routing keys use 256 bits of random secret material and Argon2id hashes.
Only a short lookup prefix and the one-way hash are persisted.

## CI

GitHub Actions starts PostgreSQL 16, applies the migration, seeds twice-safe demo
data, validates constraints, runs formatting/lint/typecheck/tests/builds, and
validates the Compose configuration.

## License

Internal use.
