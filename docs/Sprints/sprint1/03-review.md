# Sprint 1 — Review and Sign-off

> Back to [sprint specification](00-sprint.md) · [API checks](01-api.md) · [testing](02-testing.md)

## 1. Acceptance review

Tick each story only after its acceptance criteria have been demonstrated.

- [ ] **US-1.1 Sign up** — acceptance criteria verified.
- [ ] **US-1.2 Log in and out** — acceptance criteria verified.
- [ ] **US-1.3 Reset password** — acceptance criteria verified.
- [ ] **US-1.4 Connect or disconnect GitHub** — acceptance criteria verified.
- [ ] **US-1.5 Role-based access** — acceptance criteria verified.
- [ ] **US-2.1 Set skills and experience** — acceptance criteria verified.
- [ ] **US-2.2 Select preferred languages** — acceptance criteria verified.
- [ ] **US-2.3 Required profile before recommendations** — acceptance criteria verified.
- [ ] **US-3.1 Upload a CV** — acceptance criteria verified.
- [ ] **US-3.2 Track extraction status** — acceptance criteria verified.
- [ ] **US-3.3 Review and correct extracted skills** — acceptance criteria verified.
- [ ] **US-14.1 Edit profile and password** — acceptance criteria verified.
- [ ] **US-20.1 Edit AI settings** — acceptance criteria verified.
- [ ] **US-13.3 View and mark as read** — acceptance criteria verified.

## 2. Quality gates

- [ ] API contract in [`01-api.md`](01-api.md) is complete and every manual API check passed.
- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] Manual tests in [`02-testing.md`](02-testing.md) pass.
- [ ] Non-functional checks pass.
- [ ] Definition of Done in [`00-sprint.md`](00-sprint.md) is met.
- [ ] No blocker, critical or high bug remains.

## 3. Demo script

1. Sign up with email, then log out and log in.
2. Connect GitHub and show the encrypted connection state.
3. Complete the profile manually; show the required-fields gate.
4. Upload a CV, show processing → completed, then correct an extracted skill.
5. As Admin, edit AI settings and show validation.
6. Open notifications and mark one as read.

## 4. Risks and issues

| Risk | Mitigation |
|---|---|
| GitHub OAuth scopes are insufficient for later issue/PR reads | Confirm scopes in Sprint 0/1 and request the minimum needed for Sprint 2. |
| CV extraction quality is poor | Store raw text and show per-field corrections; allow manual completion. |
| LLM unavailable | Mock adapter for tests; graceful failure status on CV extraction. |
| Token leakage | Encrypt at rest, never log, restrict access to the token store. |
| Reset email deliverability | Use a verified sender domain and test with the sandbox provider. |

## 5. Handoff

Sprint 2 assumes:

- Authenticated Developer, Maintainer and Admin sessions.
- A complete developer profile (skills, level, languages) and CV-confirmed skills.
- Encrypted GitHub token available for repository/issue reads.
- AI settings stored and ready to be enforced.
- Background job infrastructure working.

## 6. Sign-off

| Role | Name | Date | Decision | Notes |
|---|---|---|---|---|
| Product owner |  |  | Accept / Reject |  |
| Tech lead |  |  | Accept / Reject |  |
| QA |  |  | Accept / Reject |  |
