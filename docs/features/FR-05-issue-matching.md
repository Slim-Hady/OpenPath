# FR-05 — Issue matching and reasons

> Story: US-5.1, US-5.2, US-5.3 · Sprint: 2 · Slice: 3 · Status: shipped
> Last updated: 2026-10-27

## 1. What it does (user view)

The candidate pool is ranked against the profile and the developer gets exactly three issues, each with a short reason they can inspect, save or ignore.

## 2. Why it exists (FR + acceptance criteria)

FR-5.1–5.11. Acceptance: three highest-ranked unique issues; repository details and reason; regenerate returns a different set; suggestions and regenerations are recorded for Admin.

## 3. Where it lives

`apps/api/src/modules/discovery/discovery.service.ts`, `apps/api/src/modules/ai/prompts.ts`, `apps/api/src/modules/ai/gemini.service.ts`, `components/recommendation-card.tsx`

## 4. How it works

1. `GET /profile` completeness is enforced.
2. The pool is capped at 20 candidates; the previous batch is excluded on regenerate.
3. `ai_settings` are read; a per-user token and global cost check runs before the provider call.
4. Gemini returns JSON `{ranking:[{issueId,rank,reason}]}`; ids are validated against the pool and exactly three unique rows are kept.
5. Rows are written to `Recommendation` and `SuggestionEvent`; a timeout or invalid JSON returns a deterministic ranked set labelled `Ranked by rules`.

## 5. Sequence diagram

Canonical sequence: [ranking](../engineering/diagrams/sequences/02-discovery-ranking.md).
The diagram is the source of truth for this flow and maps to the files above.

## 6. Data

`Recommendation` (batchId, rank, reason, fallback), `SuggestionEvent` (SUGGESTED/REGENERATED), `AiUsage`. Unique `(batchId, issueId)`.

## 7. Contract

`POST /discovery/recommendations`, `POST /discovery/recommendations/regenerate`, `GET /discovery/recommendations/latest`. Errors: 409 `PROFILE_INCOMPLETE`/`NOT_ENOUGH_CANDIDATES`, 429 AI limits, 503 provider.

## 8. External calls, quota and fallback

Gemini `ISSUE_MATCHING`; GitHub pool. Fast first choice `gemini-2.5-flash-lite`; bounded fallback chain; usage recorded after the call and returned before the response.

## 9. Authorization and failure modes

Developer role; reasons and batches are user-scoped. Regenerate only reads the caller's latest batch.

## 10. Decisions and rejected alternatives

AI ranks, deterministic rules guarantee three results. Rejected: AI-only path (violates 'no request depends on AI') and arbitrary pagination.

## 11. Tests and evidence

Live: three AI reasons in 2.7 s. Forced provider failure: three rules-ranked issues with `fallback=true`. Admin page shows suggested/regenerated counts.

Evidence lives under `dev/evidence/slice-3/`. The PR body records the
exact commands and result.

## 12. Manual demo

Find issues → read three reasons → Regenerate → confirm the set changed; open Network and see a new batch id.

## 13. Known limits and what would break it

A very small pool (<3) returns a clear 409 instead of padding with invented issues. Reason quality depends on the model.

## 14. Changelog

- 2026-10-27 — implemented and documented in the vertical build.
