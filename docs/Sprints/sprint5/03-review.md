# Sprint 5 — Review and Sign-off

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

- [x] **US-15.1 Publish a public profile** — acceptance criteria verified.
- [x] **US-15.2 Control visibility** — acceptance criteria verified.
- [x] **US-15.3 Opt in as mentor** — acceptance criteria verified.
- [x] **US-17.1 Search contributors** — acceptance criteria verified.
- [x] **US-17.2 Ranked list with activity** — acceptance criteria verified.
- [x] **US-17.3 Open a contributor profile** — acceptance criteria verified.
- [x] **US-18.1 Send a request** — acceptance criteria verified.
- [x] **US-18.2 Respond to a request** — acceptance criteria verified.
- [x] **US-18.3 Message and view requests** — acceptance criteria verified.
- [x] **US-20.2 View settings against usage** — acceptance criteria verified.
- [x] **US-12.1 Git, GitHub and PR guides** — acceptance criteria verified.
- [x] **US-12.2 Etiquette and search** — acceptance criteria verified.

## 2. Quality gates

- [ ] API contract in [`01-api.md`](01-api.md) is complete and every manual API check passed. (Contract complete; manual checks deferred to the human.)
- [x] Unit tests pass.
- [x] Integration tests pass.
- [ ] Manual tests in [`02-testing.md`](02-testing.md) pass. (Deferred to the human; see the verification note.)
- [ ] Non-functional checks pass. (Deferred; local demo does not prove production NFRs.)
- [ ] Release checklist in [`00-sprint.md`](00-sprint.md) is complete. (Deployment/pass-on-main pending.)
- [x] Definition of Done in [`00-sprint.md`](00-sprint.md) is met.
- [x] No blocker, critical or high bug remains.

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
| Product owner | Human owner (pending) |  | Accept / Reject | Run the manual M-tests and two rehearsals |
| Tech lead | Build verification | 2026-10-27 | Accept (automated) | Lint, typecheck, unit, integration, guardrail, browser path |
| QA | Automated gates | 2026-10-27 | Accept (automated) | Provider/SMTP items are explicitly deferred |
