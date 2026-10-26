# Build Progress

The order to build in. Tick a slice only when its "done when" is true. Keep this file short — detail lives in the sprint files.

**Status:** stack locked (Nest + Next), no application code yet.

## Rules

- One slice at a time; a slice ends with a runnable system.
- Every slice has a manual check a human runs.
- Stop coding 3 hours before the demo and switch to regression + rehearsal.

## Slice 1 — Workspace and containers

- [ ] pnpm workspace: `apps/web`, `apps/api`, `packages/contracts`
- [ ] `apps/api` Nest app with `/health`, global validation pipe, error filter
- [ ] `apps/web` Next app with layout, theme tokens, one animated page
- [ ] `Dockerfile` per app, `docker-compose.yml` with `web`, `api`, `worker`, `redis`
- [ ] `ci.yml` green, `docker.yml` pushes both images to GHCR

**Done when:** `docker compose up --build` serves the web app, `/health` returns ok, and a push to `main` publishes two GHCR tags.

## Slice 2 — Database and identity

- [ ] Prisma schema: `users`, `profiles`, `user_skills`, `user_languages`, `ai_settings`
- [ ] Supabase project wired (email + GitHub providers), access token verified in Nest via JWKS
- [ ] `JwtAuthGuard` + `RolesGuard` + `@CurrentUser()`
- [ ] Seed: Developer, Maintainer, Admin

**Done when:** M1.1, M1.2, M1.4, M1.5, M1.8 pass from `sprint1/02-testing.md`.

## Slice 3 — Profile and AI settings

- [ ] Profile read/update, skills, level, languages, username uniqueness
- [ ] Admin AI settings read/update with validation
- [ ] Profile-completeness gate for recommendations

**Done when:** M1.9, M1.10, M1.14 pass.

## Slice 4 — GitHub discovery

- [ ] Octokit client, encrypted token storage, connect/disconnect
- [ ] Shared candidate pool by language/label/activity, cached
- [ ] Filters, exclusions (closed, assigned, inactive, selected, ignored), empty state

**Done when:** M2.1–M2.5 pass, and two searches within the TTL hit the cache (log proof).

## Slice 5 — Ranking and selection

- [ ] Gemini rank endpoint, JSON schema, id validation, deterministic fallback
- [ ] Three recommendation cards with reason, details view, regenerate
- [ ] Confirm/cancel selection, ignore list
- [ ] AI usage row written before every provider call

**Done when:** M2.6–M2.11, M2.14 pass; a forced Gemini timeout still returns three ranked issues.

## Slice 6 — Onboarding and AI guide

- [ ] Repository onboarding (cached per repo + commit), issue onboarding
- [ ] Chat with history and streaming
- [ ] Guardrail: prompt + post-filter
- [ ] Guardrail eval suite from `sprint3/02-testing.md`

**Done when:** M3.1–M3.12 pass and the guardrail suite is 100% refusal.

## Slice 7 — Progress and sync

- [ ] Progress dashboard, manual status, PR link
- [ ] `github.sync.progress` BullMQ job + worker bootstrap, 5-minute schedule
- [ ] Status history with source (`manual` / `sync`)

**Done when:** opening a PR flips the status to PR Open within 5 minutes; merging flips to Merged; a replayed event creates no duplicate row.

## Slice 8 — Notifications and admin

- [ ] In-app notifications + read state + preferences
- [ ] Admin metrics (users, suggested/regenerated, status counts)
- [ ] AI usage totals with period filter, ≤5 min freshness

**Done when:** M4.4, M4.5, M4.12, M4.13 pass.

## Slice 9 — Breadth (visible, honest)

- [ ] Saved items and lists
- [ ] Badges and streaks (rules in code, seeded awards)
- [ ] Public profile with visibility toggles + OG tags
- [ ] Contributor search + outreach request
- [ ] Learning resources with topic search

**Done when:** every remaining FR has a reachable screen backed by real or clearly seeded data; anything unfinished is labelled "preview" in the UI.

## Slice 10 — Release

- [ ] Full manual regression from Sprints 1–5 (golden path in full, others sampled)
- [ ] Seed script that builds the demo account end to end
- [ ] Backup video of the golden path
- [ ] `docs/DEMO.md` finalized and rehearsed twice

**Done when:** a clean machine can run `docker compose up --build`, log in as the seeded Developer, and complete the golden path without manual fixes.

## Demo script source

`docs/DEMO.md` (to be written in Slice 10) — sign up → profile → three recommendations → select → onboarding → AI guide refusal → progress → merged → admin usage.
