# FR-02 — Developer information

> Story: US-2.1, US-2.2, US-2.3 · Sprint: 1 · Slice: 2 · Status: shipped
> Last updated: 2026-10-27

## 1. What it does (user view)

The developer records an experience level, languages, skills and a short description. Recommendations are blocked until the required fields exist.

## 2. Why it exists (FR + acceptance criteria)

FR-2.1–2.9. Acceptance: values persist on reload; at least one language and one level are required; changing the profile changes the next recommendation.

## 3. Where it lives

`app/onboarding/page.tsx`, `app/(app)/settings/profile/page.tsx`, `components/tag-input.tsx`, `apps/api/src/modules/profile/profile.service.ts`, `packages/contracts/src/account.ts`

## 4. How it works

1. The onboarding page loads `GET /profile`.
2. Step 1 validates level + at least one language, then `PUT /profile`.
3. The service upserts `DeveloperProfile`, replaces `UserSkill`/`UserLanguage` rows in one transaction.
4. `completeness` is computed (level 40, languages 30, skills 20, description 10).
5. Matching calls `requireComplete` before any GitHub or AI work.

## 5. Sequence diagram

Canonical sequence: [profile and onboarding](../engineering/diagrams/sequences/03-selection-onboarding.md).
The diagram is the source of truth for this flow and maps to the files above.

## 6. Data

`DeveloperProfile`, `Skill`, `UserSkill`, `Language`, `UserLanguage`. Join rows cascade with the user. Completeness is derived, never stored.

## 7. Contract

`GET /profile`, `PUT /profile` (Developer), `POST /profile/complete-check`. Errors: 400 invalid level/language count, 409 `PROFILE_INCOMPLETE` on recommendations.

## 8. External calls, quota and fallback

None.

## 9. Authorization and failure modes

Every query is scoped to `CurrentUser.id`; there is no route that accepts another user's id.

## 10. Decisions and rejected alternatives

Normalised skills/languages so Admin aggregates and community filters can use them. Rejected: a JSON blob on the user.

## 11. Tests and evidence

Contract tests cap languages at 8; integration asserts completeness and rejects `EXPERT` with 400.

Evidence lives under `dev/evidence/slice-2/`. The PR body records the
exact commands and result.

## 12. Manual demo

Settings → Profile, remove all languages, save, then open Discover and confirm the profile gate.

## 13. Known limits and what would break it

Skill names are free text normalised to title case; no taxonomy service.

## 14. Changelog

- 2026-10-27 — implemented and documented in the vertical build.
