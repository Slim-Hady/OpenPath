# FR-16 — Badges and streaks

> Story: US-16.1, US-16.2, US-16.3 · Sprint: 4 · Slice: 5 · Status: shipped
> Last updated: 2026-10-27

## 1. What it does (user view)

Badges for first PR, first merge and five merged contributions; current/longest streaks; badge visibility on the public profile; notification on award.

## 2. Why it exists (FR + acceptance criteria)

FR-16.1–16.9. Acceptance: each badge awarded once; locked requirements visible; streak from activity; chosen badges show publicly.

## 3. Where it lives

`app/(app)/achievements/page.tsx`, `apps/api/src/modules/achievements/*`, `apps/api/src/jobs/worker-runner.ts`, `apps/api/prisma/seed.ts`

## 4. How it works

1. Seeded rules map badge codes to a metric and target.
2. `gamification.evaluate` runs after a merge or manually from the job.
3. Missing badges are inserted once; a notification is created with `badge:<user>:<code>`.
4. Streaks are calculated from distinct progress-event days.
5. Visibility toggles update `UserBadge.publicVisible`; the public profile reads only visible rows.

## 5. Sequence diagram

Canonical sequence: [badges and streaks](../engineering/diagrams/sequences/06-progress-sync.md).
The diagram is the source of truth for this flow and maps to the files above.

## 6. Data

`Badge`, `UserBadge` unique `(userId, badgeId)`, `Streak` unique userId.

## 7. Contract

`GET /achievements`, `PATCH /achievements/visibility`. Errors: 404 unknown badge, 409 not earned.

## 8. External calls, quota and fallback

None.

## 9. Authorization and failure modes

Owner-scoped; the public read is gated by the profile visibility switch.

## 10. Decisions and rejected alternatives

Rules in code, awards in the database. Rejected: manual badge assignment and client-side counters.

## 11. Tests and evidence

Unit test proves FIRST_PR is awarded on PR_OPEN without waiting for a merge. Integration covers the badge award and notification dedupe; live achievements page in compose.

Evidence lives under `dev/evidence/slice-5/`. The PR body records the
exact commands and result.

## 12. Manual demo

Progress → mark an issue Merged → Achievements shows First merge; toggle visibility with the profile published.

## 13. Known limits and what would break it

Streak uses platform progress events, not GitHub's contribution graph. The seeded badge set is intentionally small.

## 14. Changelog

- 2026-10-27 — implemented and documented in the vertical build.
