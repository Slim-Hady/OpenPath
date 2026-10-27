# FR-09 — Repository onboarding

> Story: US-9.1, US-9.2, US-9.3 · Sprint: 3 · Slice: 4 · Status: shipped
> Last updated: 2026-10-27

## 1. What it does (user view)

After selection, the developer sees the repository purpose, structure, technologies, files to read first, setup/run/test commands and branch/PR guidance. Guidance is reused for the same repo/commit.

## 2. Why it exists (FR + acceptance criteria)

FR-9.1–9.9. Acceptance: overview and setup exist; CONTRIBUTING is shown when present; PR guidance matches it; another user on the same repo reuses the stored content.

## 3. Where it lives

`components/issue-detail.tsx` (Overview), `apps/api/src/modules/onboarding/onboarding.service.ts`, `apps/api/src/modules/github/github.service.ts`

## 4. How it works

1. `GET /onboarding/repository/:issueId` verifies the caller selected the issue.
2. Repo context (README, CONTRIBUTING, tree, languages) is cached in Redis under `gh:repo:<fullName>`.
3. Stored `RepositoryOnboarding` for the same repo+commit is returned.
4. Otherwise Gemini generates structured JSON; every text field passes the code-stripping guardrail.
5. The row is stored with `generatedFrom` and commit sha; a provider failure falls back to README/tree rules.

## 5. Sequence diagram

Canonical sequence: [repository onboarding](../engineering/diagrams/sequences/03-selection-onboarding.md).
The diagram is the source of truth for this flow and maps to the files above.

## 6. Data

`RepositoryOnboarding` unique `(repoFullName, commitSha)`; cached per repo version and shared across users.

## 7. Contract

`GET /onboarding/repository/:issueId` (Developer, must own the selection). Errors: 404 not selected, 503 repository unavailable.

## 8. External calls, quota and fallback

GitHub (README/tree/CONTRIBUTING), Gemini `ONBOARDING`, Redis cache.

## 9. Authorization and failure modes

Selection ownership is checked before any repo read; one user's onboarding cannot expose another user's data.

## 10. Decisions and rejected alternatives

Reuse by repo+commit, not per user. Rejected: regenerating for every user and storing raw repository text forever.

## 11. Tests and evidence

Live run produced an overview, first files and setup guidance for a real repo; rules fallback is labelled in `generatedFrom`.

Evidence lives under `dev/evidence/slice-4/`. The PR body records the
exact commands and result.

## 12. Manual demo

Select an issue → Overview → read the repository block → change a setup row in the DB and confirm the cached copy is reused.

## 13. Known limits and what would break it

Very large repositories are truncated to 300 tree paths. Missing README/CONTRIBUTING is handled with a fallback.

## 14. Changelog

- 2026-10-27 — implemented and documented in the vertical build.
