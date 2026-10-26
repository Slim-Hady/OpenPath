# Sprint 2 — Review and Sign-off

> Back to [sprint specification](00-sprint.md) · [API checks](01-api.md) · [testing](02-testing.md)

## 1. Acceptance review

Tick each story only after its acceptance criteria have been demonstrated.

- [ ] **US-4.1 Search for issues from my profile** — acceptance criteria verified.
- [ ] **US-4.2 Filter the search** — acceptance criteria verified.
- [ ] **US-4.3 Exclude unsuitable issues** — acceptance criteria verified.
- [ ] **US-4.4 Handle empty results** — acceptance criteria verified.
- [ ] **US-5.1 Get the top three recommendations** — acceptance criteria verified.
- [ ] **US-5.2 View issue details and reason** — acceptance criteria verified.
- [ ] **US-5.3 Regenerate recommendations** — acceptance criteria verified.
- [ ] **US-6.1 View details and select an issue** — acceptance criteria verified.
- [ ] **US-6.2 Confirm selection** — acceptance criteria verified.
- [ ] **US-6.3 Ignore an issue** — acceptance criteria verified.
- [ ] **US-6.4 Select from saved items** — acceptance criteria verified.
- [ ] **US-7.1 Bookmark and organize** — acceptance criteria verified.
- [ ] **US-20.3 Enforce AI settings** — acceptance criteria verified.

## 2. Quality gates

- [ ] API contract in [`01-api.md`](01-api.md) is complete and every manual API check passed.
- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] Manual tests in [`02-testing.md`](02-testing.md) pass.
- [ ] Non-functional checks pass.
- [ ] Definition of Done in [`00-sprint.md`](00-sprint.md) is met.
- [ ] No blocker, critical or high bug remains.

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
| Product owner |  |  | Accept / Reject |  |
| Tech lead |  |  | Accept / Reject |  |
| QA |  |  | Accept / Reject |  |
