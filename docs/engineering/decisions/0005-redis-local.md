---
status: accepted
---

# 0005 — Redis stays local in Docker

## Context

The free-tier policy forbids new paid services. BullMQ needs Redis; the app
also caches GitHub pools, repo context, contributor data and admin figures.
A managed Redis (Upstash) would add a card, a second quota and a network hop.

## Decision

Redis 7 runs as a local container from `docker-compose.yml` (and
`docker-compose.dev.yml` for tests). `REDIS_URL` is the only contract. Caches
have a memory fallback in `RedisService`; queue writes fail with 503 when Redis
is down, but reads still work.

## Alternatives rejected

| Option | Why not |
|---|---|
| Upstash free | New external service, card/limits, violates the allowlist |
| Postgres-backed queue | Locks, polling load and no BullMQ semantics |
| In-memory queue only | Loses jobs on deploy and cannot share with the worker |

## Consequences

- Redis data is ephemeral; a wipe loses caches and in-flight jobs, not product
  state.
- The compose stack has one more container, but no account or secret.
- Horizontal API scaling needs a shared rate limiter; the Redis increment
  primitive is ready but the demo uses the single-instance throttler.

## Revisit

If the deployment target cannot run a container, or if queue volume needs a
managed service with a free tier that does not require a card.
