# Sprint 3 — Review and Sign-off

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

- [x] **US-9.1 Repository overview** — acceptance criteria verified.
- [x] **US-9.2 Setup instructions** — acceptance criteria verified.
- [x] **US-9.3 Branch and PR guidance** — acceptance criteria verified.
- [x] **US-10.1 Plain-language issue summary** — acceptance criteria verified.
- [x] **US-10.2 Requirements and related code** — acceptance criteria verified.
- [x] **US-10.3 Resources without solutions** — acceptance criteria verified.
- [x] **US-11.1 Chat with the AI guide** — acceptance criteria verified.
- [x] **US-11.2 Ask for resources** — acceptance criteria verified.
- [x] **US-11.3 No solutions** — acceptance criteria verified.
- [x] **US-11.4 Chat history and AI limits** — acceptance criteria verified.
- [x] **US-8.1 Progress dashboard** — acceptance criteria verified.
- [x] **US-8.2 Update status and attach PR** — acceptance criteria verified.

## 2. Quality gates

- [ ] API contract in [`01-api.md`](01-api.md) is complete and every manual API check passed. (Contract complete; manual checks deferred to the human.)
- [x] Unit tests pass.
- [x] Integration tests pass.
- [ ] Manual tests in [`02-testing.md`](02-testing.md) pass. (Deferred to the human; see the verification note.)
- [ ] Non-functional checks pass. (Deferred; local demo does not prove production NFRs.)
- [x] Definition of Done in [`00-sprint.md`](00-sprint.md) is met.
- [x] No blocker, critical or high bug remains.

## 3. Demo script

1. Select an issue from Sprint 2 and open repository onboarding.
2. Show setup and contribution guidance.
3. Show issue summary, related code and resources.
4. Ask the AI guide a concept question, then ask it to write the fix and show the refusal.
5. Reopen the chat and continue the conversation.
6. Show the limit message after exhausting the quota.
7. Open the progress dashboard, change a status and attach a PR link.

## 4. Risks and issues

| Risk | Mitigation |
|---|---|
| AI hallucinates repository details | Ground prompts in fetched files; show source links; mark generated content. |
| Guardrail leaks code through examples | Output classifier plus refusal templates; run the evaluation suite on every prompt change. |
| Large repositories exceed context | Fetch a targeted file tree and key files; truncate with clear limits. |
| 10-second latency | Cache onboarding, cap context size, stream responses, show progress state. |
| Prompt injection in issue text | Delimit untrusted content and instruct the model to ignore embedded instructions. |

## 5. Handoff

Sprint 4 assumes:

- Selected issues have progress records and manual status history.
- Repository/issue onboarding and chat data exist for notifications.
- Guardrail logging produces usable outcomes.
- The AI usage ledger is complete enough for the Admin dashboard.

## 6. Sign-off

| Role | Name | Date | Decision | Notes |
|---|---|---|---|---|
| Product owner | Human owner (pending) |  | Accept / Reject | Run the manual M-tests and two rehearsals |
| Tech lead | Build verification | 2026-10-27 | Accept (automated) | Lint, typecheck, unit, integration, guardrail, browser path |
| QA | Automated gates | 2026-10-27 | Accept (automated) | Provider/SMTP items are explicitly deferred |
