# FR-14 — Profile history, statistics and account deletion

> Story: US-14.1, US-14.2, US-14.3 · Sprint: 1 · Slice: 2 · Status: shipped
> Last updated: 2026-10-27

## 1. What it does (user view)

A developer maintains name, username, bio, avatar and password; sees issue history, chats and contribution statistics; can delete the account and its data.

## 2. Why it exists (FR + acceptance criteria)

FR-14.1–14.11. Acceptance: unique username; password updated; history is owner-only; deletion removes personal data and blocks login.

## 3. Where it lives

`app/(app)/settings/account/page.tsx`, `apps/api/src/modules/profile/profile.service.ts`, `apps/api/src/jobs/sync.service.ts` (deletion), `packages/contracts/src/community.ts`

## 4. How it works

1. `PATCH /me` validates the username and saves fields.
2. Password changes use Supabase Auth.
3. `GET /me/history` joins selections, issues and chat ids; stats are derived.
4. `DELETE /me` creates a deletion request and enqueues `account.delete`.
5. The worker removes CV objects, deletes the Supabase auth user and deletes the Prisma user (cascades).

## 5. Sequence diagram

Canonical sequence: [account history and deletion](../engineering/diagrams/sequences/13-account-history.md).
The diagram is the source of truth for this flow and maps to the files above.

## 6. Data

`User`, `Selection`, `ProgressEvent`, `ChatConversation`, `DeletionRequest`. Cascades on user delete.

## 7. Contract

`GET/PATCH /me`, `DELETE /me`, `GET /me/history`, `GET /me/stats`. Errors: 400 invalid username/password, 409 username taken, 401.

## 8. External calls, quota and fallback

Supabase Auth admin API for deletion; Storage for CV files.

## 9. Authorization and failure modes

History is scoped to the caller; deletion requires a fresh confirmation in the UI and the account's own token.

## 10. Decisions and rejected alternatives

Delete rather than anonymise because the requirements ask for personal data removal; aggregates remain anonymous via cascaded deletion.

## 11. Tests and evidence

Integration `/me` 200, invalid profile 400, owner history contract parse; the `/settings/history` screen consumes it. Deletion is exercised with a disposable test user in `docs/DEMO.md`.

Evidence lives under `dev/evidence/slice-2/`. The PR body records the
exact commands and result.

## 12. Manual demo

Settings → Account → change bio → save → reload; open History; delete a disposable test account.

## 13. Known limits and what would break it

Deletion is asynchronous; the UI returns immediately. Supabase auth deletion failures are logged without a token and the request remains retryable.

## 14. Changelog

- 2026-10-27 — implemented and documented in the vertical build.
