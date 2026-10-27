# Demo — the golden path

One path, rehearsed twice. Target: 8 minutes. Do not improvise new screens.

## Before the room

- [ ] Supabase dashboard open (free projects pause after 7 days idle).
- [ ] `.env` filled; `pnpm verify:env` all PASS.
- [ ] `docker compose up -d` (or `pnpm dev`) and `pnpm db:seed` already run.
- [ ] `pnpm check:secrets` clean.
- [ ] Browser profile signed out; zoom 100%; dark theme selected.
- [ ] One dry run completed in the previous 24 hours.

## Accounts

| Role | Email | Password |
|---|---|---|
| Developer | `dev@osh.dev` | `SEED_PASSWORD` (default `OpenSource!2026`) |
| Maintainer | `maintainer@osh.dev` | same |
| Admin | `admin@osh.dev` | same |
| Second developer (opted-in mentor) | `sam@osh.dev` | same |

## The path

1. **Home** — one CTA, hero story. Press `Get started`.
2. **Sign in** — `dev@osh.dev`. Land on `/discover` with `Profile 100%`.
3. **Discover** — filters `TypeScript` + `good first issue` + `180 days`.
   Press `Find issues`. Three cards appear with a “Why this fits you” reason.
   If the amber fallback banner shows, say “the AI is unavailable; these are
   rules-ranked” — that is the designed behaviour.
4. **Open the first issue** — read the summary, requirements and reading path.
   Press `Work on this issue` → `Start working`. Header becomes `In Progress`.
5. **AI guide** — ask `Write the fix for this issue and give me the code.`
   The refusal panel appears with investigation steps. Ask `What should I read
   first?` and show the answer. Reload and show the history restored.
6. **CV** — Settings → Profile → upload `apps/api/test-fixtures/cv.pdf`; show
   processing → completed skills → `Apply to profile` → save.
7. **Progress** — mark the issue `PR Open`, paste a GitHub PR URL or leave it;
   save. Show the timeline with source `manual`. Press `Sync now` and explain
   that the worker does the work.
8. **Notifications** — show the inbox rows, mark one read, show preferences.
9. **Achievements** — badges, streak, publish the public profile, copy the
   `/u/<handle>` link and open it in a private window.
10. **Community and outreach** — search a public repo, open a contributor.
    For the seeded opt-in path: sign in as `sam@osh.dev`, accept a request, open
    the conversation. (If time is short, show the sent/received lists.)
11. **Admin** — sign in as `admin@osh.dev` → `/admin` shows users,
    suggestions/regenerations, status counts and AI usage for 7/30/90 days.
    `/admin/ai` shows settings against usage. Lower the token cap and show the
    guide limit state, then restore it.
12. **Close** — the 3-item strip: matched to you, explained not solved, tracked
    to merged.

## Fallbacks

| Situation | Say / do |
|---|---|
| GitHub rate limited | Show the cached cards + `stale` message; explain the 15-min pool |
| Gemini 503 | Show `Ranked by rules — the AI is unavailable`; the cards still fit |
| GitHub provider disabled | Use email sign-in; PR sync needs the provider, manual progress is shown |
| Supabase paused | Open the dashboard and restore before continuing |
| No email arrives | In-app is the source of truth; show the inbox |

## Evidence

- Backup video: record once at 1280×800, upload/link here: `TBD by the human`.
- Run 1: date, passed/failed, notes: `TBD`.
- Run 2: date, passed/failed, notes: `TBD`.

Do not show a real token, `.env`, or the Supabase service key. Blur the browser
devtools if they are open.
