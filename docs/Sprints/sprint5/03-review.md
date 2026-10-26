# Sprint 5 — Review and Sign-off

> Back to [sprint specification](00-sprint.md) · [API checks](01-api.md) · [testing](02-testing.md)

## 1. Acceptance review

Tick each story only after its acceptance criteria have been demonstrated.

- [ ] **US-15.1 Publish a public profile** — acceptance criteria verified.
- [ ] **US-15.2 Control visibility** — acceptance criteria verified.
- [ ] **US-15.3 Opt in as mentor** — acceptance criteria verified.
- [ ] **US-17.1 Search contributors** — acceptance criteria verified.
- [ ] **US-17.2 Ranked list with activity** — acceptance criteria verified.
- [ ] **US-17.3 Open a contributor profile** — acceptance criteria verified.
- [ ] **US-18.1 Send a request** — acceptance criteria verified.
- [ ] **US-18.2 Respond to a request** — acceptance criteria verified.
- [ ] **US-18.3 Message and view requests** — acceptance criteria verified.
- [ ] **US-20.2 View settings against usage** — acceptance criteria verified.
- [ ] **US-12.1 Git, GitHub and PR guides** — acceptance criteria verified.
- [ ] **US-12.2 Etiquette and search** — acceptance criteria verified.

## 2. Quality gates

- [ ] API contract in [`01-api.md`](01-api.md) is complete and every manual API check passed.
- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] Manual tests in [`02-testing.md`](02-testing.md) pass.
- [ ] Non-functional checks pass.
- [ ] Release checklist in [`00-sprint.md`](00-sprint.md) is complete.
- [ ] Definition of Done in [`00-sprint.md`](00-sprint.md) is met.
- [ ] No blocker, critical or high bug remains.

## 3. Demo script

1. Publish a public profile, choose visible sections and copy the link.
2. Open the profile logged out and show privacy rules.
3. Opt in as a mentor and find the profile through contributor search.
4. Send an outreach request, accept it as the recipient, and exchange a message.
5. Block the sender and show further contact is prevented.
6. Open the learning resources, search a topic and show the no-results state.
7. Show Admin AI settings against usage.
8. Run the release smoke flow end-to-end.

## 4. Risks and issues

| Risk | Mitigation |
|---|---|
| Public profile leaks hidden data | Serialize only visible fields server-side; test every visibility combination logged out. |
| GitHub contributor search is rate-limited or slow | Cache results, cap pages, show partial results and retry. |
| Outreach becomes spam | Opt-in only, per-sender rate limits, block list, report path. |
| Release regression | Freeze features before release testing; fix only blockers. |
| Privacy/deletion gaps | Run the deletion and exposure test matrix before go-live. |
| Demo failure | Rehearse the smoke flow on the deployed environment with seeded data. |

## 5. Project completion

When this sprint is done:

- All 20 FRs are implemented and traced to business/customer requirements.
- All NFRs have evidence from tests or monitoring.
- The product is deployed, monitored and documented.
- Remaining ideas are recorded as post-release backlog, not hidden scope.

## 6. Sign-off

| Role | Name | Date | Decision | Notes |
|---|---|---|---|---|
| Product owner |  |  | Accept / Reject |  |
| Tech lead |  |  | Accept / Reject |  |
| QA |  |  | Accept / Reject |  |
