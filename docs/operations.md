# Operations and deployment

## Production topology

Backbeat Pager uses one repository but three managed control planes:

- **Vercel API project** rooted at `apps/api`: Fastify/Nitro, Slack HTTP
  callbacks, Vercel Workflow routes, and the daily reconciliation Cron.
- **Vercel web project** rooted at `apps/web`: Next.js administration UI and
  Auth.js.
- **Neon project**: canonical PostgreSQL data. Use a production root branch and
  separate preview branches.

Both Vercel projects explicitly enable Fluid Compute and are pinned to `iad1`
by default. Change both regions together to the region nearest the Neon primary.

## Release sequence

1. Create a Neon branch or snapshot before a risky migration.
2. Set `DIRECT_URL` to the direct Neon hostname.
3. Run `pnpm install --frozen-lockfile`.
4. Run `pnpm db:migrate:deploy`.
5. Deploy the API project.
6. Verify `/health`, then `/ready`.
7. Deploy the web project.
8. Exercise the test-alert checklist below.

Never run Prisma migrations during a function cold start. Application queries
use the pooled `DATABASE_URL`; schema commands use `DIRECT_URL`.

## Preview environments

- Use the Vercel/Neon integration to create one Neon branch per preview.
- Apply migrations to that preview branch before testing.
- Protect preview deployments with Vercel Deployment Protection.
- Use preview-specific Google OAuth callback credentials.
- Do not point production Slack event/interactivity URLs at previews.
- Enable automatic Neon branch cleanup when the Git branch is deleted.

## Health and recovery

| Endpoint                   | Meaning                                                                |
| -------------------------- | ---------------------------------------------------------------------- |
| `GET /health`              | Process/router is alive; does not require PostgreSQL                   |
| `GET /ready`               | PostgreSQL query succeeds and the API can accept traffic               |
| `POST /internal/reconcile` | Signed repair scan for missing incident, handoff, and digest workflows |

Vercel calls reconciliation daily with `Authorization: Bearer $CRON_SECRET`.
Core timers do not rely on Cron precision: Vercel Workflow sleeps are durable.
Reconciliation repairs the database-commit/Workflow-start boundary.

### Workflow deployments

Active Workflow runs remain pinned to the Vercel deployment that started them.
Every run checks a database generation before a side effect. Configuration
changes start a current-deployment generation and make old runs stale. After an
emergency rollback, run the signed reconciliation endpoint to repair missing
runs.

### Neon recovery

- Configure the production history window and scheduled snapshots for the
  organization's recovery-point objective.
- Before restoring, use Time Travel Assist/read-only historical queries to
  confirm the target timestamp.
- Neon instant restore/PITR operates on root branches and briefly interrupts
  connections; application connection strings remain stable.
- Prefer restoring a snapshot into a new branch for inspection before moving
  production computes.
- Test restore procedures quarterly, including migration state and application
  readiness.

## Secrets and rotation

Store secrets only in Vercel encrypted environment variables:

- Google: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- Slack: `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `SLACK_ACTION_SECRET`
- Resend: `RESEND_API_KEY`
- Internal: `WORKFLOW_INTERNAL_SECRET`, `CRON_SECRET`
- Database: `DATABASE_URL`, `DIRECT_URL`

Rotate internal and action secrets during a coordinated deployment. Old Slack
buttons signed with the previous action secret stop working, but current message
reconciliation renders fresh buttons. Rotating a service routing key invalidates
the old key immediately and reveals the new plaintext once.

## Logging and observability

- API logs redact authorization, cookies, and routing-key headers.
- Never log event bodies wholesale; monitoring payloads may contain customer
  metadata.
- Review Vercel Workflow runs, event histories, retries, and sleeping runs in
  Vercel Observability.
- Alert on `/ready` failures, Workflow failures, old pending outbox rows, failed
  `NotificationLog` volume, and reconciliation `failed > 0`.
- `AuditLog` records administrative configuration changes and scheduled
  communications.

## Test-alert checklist

1. Seed or create users, a team, schedule, policy, and service.
2. Confirm target users have mapped Slack IDs/work emails and the bot can post
   to the service channel.
3. Trigger with `pnpm demo:alert` or the documented curl payload.
4. Confirm a DM and service message arrive within about five seconds.
5. Acknowledge in Slack and confirm every stored message updates.
6. Confirm escalation/nag deadlines clear.
7. Trigger the same dedup key and confirm no second open incident.
8. Create an override and confirm the replacement receives the next page.
9. Resolve through the events API and confirm messages update in place.

## Incident response for Backbeat Pager itself

- If Slack is degraded, failed attempts remain visible in `NotificationLog`;
  Resend can still deliver to users who enabled email.
- If Workflow start fails, clients receive retryable failure while canonical
  incident state remains committed. Retry the event and invoke reconciliation.
- If Neon is unavailable, `/ready` fails and ingestion must return failure;
  monitoring integrations should retry.
- If a bad deployment ships, use Vercel Instant Rollback, verify readiness, then
  reconcile workflows.
