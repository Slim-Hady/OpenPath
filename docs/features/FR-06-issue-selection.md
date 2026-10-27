# FR-06 — Issue selection and ignore

> Story: US-6.1, US-6.2, US-6.3, US-6.4 · Sprint: 2 · Slice: 3 · Status: shipped
> Last updated: 2026-10-27

## 1. What it does (user view)

The developer views the full issue, confirms one as active, and can ignore issues so they never return. A saved issue can be selected later.

## 2. Why it exists (FR + acceptance criteria)

FR-6.1–6.10. Acceptance: selection only after confirmation; one active issue; status In Progress; ignored issues never recommended; selecting from Saved works.

## 3. Where it lives

`components/issue-detail.tsx`, `app/(app)/saved/page.tsx`, `apps/api/src/modules/selection/*`, `apps/api/src/modules/saved/*`, `packages/contracts/src/discovery.ts`

## 4. How it works

1. The detail dialog posts `{issueId, confirmed:true}`.
2. The service verifies the issue exists and is open, then rejects an existing selection or another active issue.
3. In one transaction it removes the ignore row, creates `Selection` and the first `ProgressEvent`.
4. A system notification is created with a dedupe key.
5. Ignore upserts `IgnoredIssue`; selection queries exclude those ids.

## 5. Sequence diagram

Canonical sequence: [selection](../engineering/diagrams/sequences/03-selection-onboarding.md).
The diagram is the source of truth for this flow and maps to the files above.

## 6. Data

`Selection` unique `(userId, issueId)`, `ProgressEvent`, `IgnoredIssue` unique `(userId, issueId)`.

## 7. Contract

`POST /selection`, `GET /selection/active`, `POST /discovery/ignore`, `POST /saved/items/:id/select`. Errors: 400 confirmation missing, 404 issue, 409 closed/already selected/active issue exists.

## 8. External calls, quota and fallback

None in the request.

## 9. Authorization and failure modes

All reads and writes filter by `CurrentUser.id`; the integration test proves another user's history is 404.

## 10. Decisions and rejected alternatives

One active issue at a time keeps the guide and progress unambiguous. Rejected: unlimited concurrent selections.

## 11. Tests and evidence

Integration: select creates exactly one IN_PROGRESS event; duplicate returns 409; another user's history returns 404.

Evidence lives under `dev/evidence/slice-3/`. The PR body records the
exact commands and result.

## 12. Manual demo

Open an issue → Work on this issue → Start working → Progress shows In Progress.

## 13. Known limits and what would break it

Paused selections do not block a new selection. A closed issue cannot be selected.

## 14. Changelog

- 2026-10-27 — implemented and documented in the vertical build.
