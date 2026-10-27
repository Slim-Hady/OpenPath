# FR-12 — Learning resources

> Story: US-12.1, US-12.2 · Sprint: 5 · Slice: 6 · Status: shipped
> Last updated: 2026-10-27

## 1. What it does (user view)

Public guides for Git basics, branches, pull requests, tests, reviews and etiquette, with topic search and an honest empty state.

## 2. Why it exists (FR + acceptance criteria)

FR-12.1–12.10. Acceptance: guides render; search returns matching resources; no results shows a message.

## 3. Where it lives

`app/learn/page.tsx`, `app/learn/[slug]/page.tsx`, `apps/api/src/modules/learning/*`, `apps/api/prisma/seed.ts`

## 4. How it works

1. `/learn` calls the public `GET /learning` with an optional query/topic.
2. Prisma filters title/summary/body/topic with case-insensitive contains.
3. The page renders topic chips, cards and a no-results state.
4. `/learn/:slug` fetches one resource and renders it server-side without auth.

## 5. Sequence diagram

Canonical sequence: [learning search](../engineering/diagrams/sequences/09-learning.md).
The diagram is the source of truth for this flow and maps to the files above.

## 6. Data

`LearningResource` seeded with six guides; index on topic.

## 7. Contract

`GET /learning?q=&topic=`, `GET /learning/:slug` (public). Errors: 400 empty query, 404 unknown slug.

## 8. External calls, quota and fallback

None.

## 9. Authorization and failure modes

Public by design; no personal data in resources.

## 10. Decisions and rejected alternatives

Seeded editorial content rather than AI-generated lessons, so the public page is stable and reviewable.

## 11. Tests and evidence

Public endpoint smoke test; live `/learn` and an article render 200 in the compose stack.

Evidence lives under `dev/evidence/slice-6/`. The PR body records the
exact commands and result.

## 12. Manual demo

Footer → Learning → search “tests” → open “Run the right tests before you push”.

## 13. Known limits and what would break it

Content is static and English-only; topic search is substring, not semantic.

## 14. Changelog

- 2026-10-27 — implemented and documented in the vertical build.
