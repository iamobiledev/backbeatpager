# AGENTS.md

## Cursor Cloud specific instructions

Backbeat Pager is a pnpm monorepo (Node 22, pnpm 10.33.3 via Corepack) with two
runnable dev services plus a PostgreSQL 16 database. Standard commands live in
the root `package.json` scripts and `README.md`; only the non-obvious cloud
caveats are captured here.

### Services

| Service | Dev command | Port | Notes |
| ------- | ----------- | ---- | ----- |
| API (Fastify on Nitro; alerts, Slack receiver, Workflows) | `pnpm --filter @backbeat/api dev` | 3001 | Core service. `pnpm dev` from root runs API + web in parallel. |
| Web admin console (Next.js) | `pnpm --filter @backbeat/web dev` | 3000 | Console UI. |
| PostgreSQL 16 | see below | 5432 | Source of truth. No Redis/queue — durable work uses Vercel Workflows in-process. |

### PostgreSQL startup (not auto-started)

The update script does not install or start Postgres. PostgreSQL 16 is installed
system-wide but is not running on VM boot. Start it and (first time only) create
the databases:

```bash
sudo mkdir -p /var/run/postgresql && sudo chown postgres:postgres /var/run/postgresql
sudo -u postgres /usr/lib/postgresql/16/bin/pg_ctl -D /var/lib/postgresql/16/main \
  -l /tmp/pg.log -o "-c config_file=/etc/postgresql/16/main/postgresql.conf" start
# one-time (safe to re-run; ignore "already exists"):
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres psql -c "CREATE DATABASE backbeatpager;"
sudo -u postgres psql -c "CREATE DATABASE backbeatpager_test;"
```

If Postgres is missing entirely (fresh VM without the snapshot), install it with
`sudo apt-get update && sudo apt-get install -y postgresql postgresql-contrib`.

### Environment variables (critical gotcha)

`packages/db/prisma.config.ts` calls `dotenv/config`, which loads `.env` from the
**current working directory**. Prisma CLI commands (`db:migrate:*`, `db:seed`)
run in `packages/db`, so they do **not** read the repo-root `.env` and will fail
with `Can't reach database server at 127.0.0.1:1` unless `DATABASE_URL` /
`DIRECT_URL` are present in the shell environment. The Nitro (API) and Next.js
(web) dev servers likewise do not load the root `.env` automatically.

Do **not** `source .env` in bash: `.env.example` contains an unquoted value
(`EMAIL_FROM=Backbeat Pager <pager@example.com>`) whose `<` breaks bash parsing.
Export the vars explicitly instead. Minimal working local set:

```bash
export DATABASE_DRIVER=pg
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/backbeatpager"
export DIRECT_URL="postgresql://postgres:postgres@localhost:5432/backbeatpager"
export TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/backbeatpager_test"
export NODE_ENV=development
export API_BASE_URL="http://localhost:3001"
export NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"
export WEB_BASE_URL="http://localhost:3000"
export AUTH_SECRET="local-dev-auth-secret-that-is-longer-than-thirty-two-bytes"
export AUTH_GOOGLE_ALLOWED_DOMAIN="example.com"
export AUTH_TEST_USER_EMAIL="admin@example.com"
export SLACK_REQUIRED=false
export SLACK_ACTION_SECRET="local-dev-slack-action-secret-32-bytes-minimum-value"
export CRON_SECRET="local-dev-cron-secret"
export WORKFLOW_INTERNAL_SECRET="local-dev-workflow-secret"
```

### First-run DB setup and running

With Postgres up and the env vars exported (from the repo root):

```bash
pnpm db:migrate:deploy   # apply migrations to backbeatpager
pnpm db:seed             # demo data; prints the demo routing key ONCE per run
pnpm dev                 # API :3001, web :3000
```

Seeded users (web console): `admin@example.com` (ADMIN), `alice@example.com` /
`bob@example.com` (RESPONDER). Web auth in dev uses the `AUTH_TEST_USER_EMAIL`
bypass (ignored when `NODE_ENV=production`) — no Google login needed. Slack and
Resend are optional in dev (`SLACK_REQUIRED=false`).

### Tests

`pnpm test` runs unit tests. Integration/DB tests only run when
`TEST_DATABASE_URL` is set; that database must have migrations applied first:

```bash
DATABASE_URL="$TEST_DATABASE_URL" DIRECT_URL="$TEST_DATABASE_URL" pnpm db:migrate:deploy
pnpm test
```

The constraint suite truncates tables, so only ever point `TEST_DATABASE_URL` at
an isolated test database (`backbeatpager_test`).

### Hello-world check (verifies the whole stack)

Trigger an incident via the PagerDuty-compatible endpoint using the routing key
printed by `pnpm db:seed`, then acknowledge it in the web console:

```bash
curl -X POST http://localhost:3001/api/v1/alerts -H 'content-type: application/json' \
  --data '{"routing_key":"bbp_...","event_action":"trigger","dedup_key":"smoke","payload":{"summary":"smoke test","severity":"critical","source":"cli"}}'
# -> 202 with {"incident":{"number":1,"state":"TRIGGERED"}}
```
