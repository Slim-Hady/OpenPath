---
status: accepted
---

# 0006 — Local Postgres for the demo stack, Supabase for dev and production

## Context

The stack is locked to PostgreSQL on Supabase. Supabase also provides Auth and
Storage, which the app needs in every environment. The free database password
was not available to the build environment, and the free project can pause.
A demo that depends on a paused remote database is not a demo.

## Decision

- The **demo/test stack** (`docker compose up`) runs Postgres 16 locally and
  applies the same Prisma migration before the API starts. Supabase still
  supplies Auth and the private `cvs` bucket.
- The **dev/deployment target** uses the Supabase transaction pooler for
  `DATABASE_URL` and the session pooler for `DIRECT_URL`, exactly as documented
  in `docs/SETUP/01-supabase`.
- Integration tests use a third local database, `osh_test`, never Supabase.
- The schema, migrations and Prisma client are identical in all three.

## Alternatives rejected

| Option | Why not |
|---|---|
| Require Supabase DB for the demo | The free project pauses, the password was not available, and a demo failure is not a product failure |
| SQLite | Different SQL/types from Postgres; invalidates the migration evidence |
| Separate test schema in Supabase | Tests could delete real demo data and consume the free quota |

## Consequences

- `docker compose up --build` is self-contained for data and queue.
- Auth and Storage still require network and a valid Supabase project.
- The human must run `pnpm db:seed` once against the compose Postgres (or use
  the seed script) to create the demo accounts in Supabase Auth and the rows.
- Production uses Supabase by changing two environment values and removing the
  local `postgres`/`migrate` services.

## Revisit

When the project has a paid or stable Supabase database and the demo can depend
on it. Then make Supabase the only database and keep `osh_test` local.
