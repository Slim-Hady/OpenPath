# Sprint 2 — Review and Sign-off

> Back to [sprint specification](00-sprint.md) · [API checks](01-api.md) · [testing](02-testing.md)

## Verification note (2026-10-27)

Automated gates passed: lint, typecheck, contracts 6, API unit 25, web unit 9,
integration 13, guardrail eval 15/15, compose health, smoke 8/8 and Bruno 8/8.
The golden path was exercised in a real browser. Items that need an external
provider or a human hand are intentionally left unchecked and named in the
note below; they are not silently marked done.

- Deferred because the Supabase GitHub provider is disabled: GitHub sign-up,
  connect/disconnect and provider-token capture.
- Deferred because Supabase SMTP is not configured: password-reset delivery.
- Deferred to the human: the manual M-tests, the two demo rehearsals and the
  backup video.

## 1. Acceptance review

Tick each story only after its acceptance criteria have been demonstrated.

- [x] **US-4.1 Search for issues from my profile** — acceptance criteria verified.
- [x] **US-4.2 Filter the search** — acceptance criteria verified.
- [x] **US-4.3 Exclude unsuitable issues** — acceptance criteria verified.
- [x] **US-4.4 Handle empty results** — acceptance criteria verified.
- [x] **US-5.1 Get the top three recommendations** — acceptance criteria verified.
- [x] **US-5.2 View issue details and reason** — acceptance criteria verified.
- [x] **US-5.3 Regenerate recommendations** — acceptance criteria verified.
- [x] **US-6.1 View details and select an issue** — acceptance criteria verified.
- [x] **US-6.2 Confirm selection** — acceptance criteria verified.
- [x] **US-6.3 Ignore an issue** — acceptance criteria verified.
- [x] **US-6.4 Select from saved items** — acceptance criteria verified.
- [x] **US-7.1 Bookmark and organize** — acceptance criteria verified.
- [x] **US-20.3 Enforce AI settings** — acceptance criteria verified.

## 2. Quality gates

- [ ] API contract in [`01-api.md`](01-api.md) is complete and every manual API check passed. (Contract complete; manual checks deferred to the human.)
- [x] Unit tests pass.
- [x] Integration tests pass.
- [ ] Manual tests in [`02-testing.md`](02-testing.md) pass. (Deferred to the human; see the verification note.)
- [ ] Non-functional checks pass. (Deferred; local demo does not prove production NFRs.)
- [x] Definition of Done in [`00-sprint.md`](00-sprint.md) is met.
- [x] No blocker, critical or high bug remains.

## 3. Demo script

1. Show a complete developer profile.
2. Request a search with filters and show GitHub results.
3. Show the three ranked recommendations with reasons.
4. Regenerate and show a different set.
5. Select and confirm one issue; show In Progress.
6. Ignore another issue and show it does not return.
7. Save an issue and select it from saved items.
8. As Admin, lower the AI limit and show the next request blocked.

## 4. Risks and issues

| Risk | Mitigation |
|---|---|
| GitHub rate limits or slow search | Cache repository/issue data, paginate, back off and show partial results. |
| Ranking quality is poor | Keep the reason field mandatory, log outcomes and allow regenerate. |
| AI returns malformed or invented issue ids | Validate against the candidate pool; fall back to deterministic scoring. |
| 10-second target missed | Limit candidate pool size, use compact prompts and cache repository context. |
| Users save lists before selection exists | Build saved items and selection in the same sprint, with ownership tests. |

## 5. Handoff

Sprint 3 assumes:

- A user can select an Issue with status In Progress.
- Repository context is cached and available for onboarding.
- AI settings, token metering and the LLM adapter work.
- The suggestion event log exists for the Admin dashboard.

## 6. Sign-off

| Role | Name | Date | Decision | Notes |
|---|---|---|---|---|
| Product owner | Human owner (pending) |  | Accept / Reject | Run the manual M-tests and two rehearsals |
| Tech lead | Build verification | 2026-10-27 | Accept (automated) | Lint, typecheck, unit, integration, guardrail, browser path |
| QA | Automated gates | 2026-10-27 | Accept (automated) | Provider/SMTP items are explicitly deferred |
