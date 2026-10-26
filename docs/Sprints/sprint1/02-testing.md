# Sprint 1 — Testing

> Back to [sprint specification](00-sprint.md) · [API checks](01-api.md) · [review](03-review.md)

## 1. Story coverage

Every user story in this sprint must have at least one manual test case and the relevant unit/integration coverage.

| Story | Manual test IDs |
|---|---|
| US-1.1 | M1.1, M1.2 |
| US-1.2 | M1.4, M1.5 |
| US-1.3 | M1.6 |
| US-1.4 | M1.3, M1.7 |
| US-1.5 | M1.8 |
| US-2.1 | M1.9 |
| US-2.2 | M1.9 |
| US-2.3 | M1.10 |
| US-3.1 | M1.11 |
| US-3.2 | M1.11 |
| US-3.3 | M1.12 |
| US-14.1 | M1.13 |
| US-20.1 | M1.14 |
| US-13.3 | M1.15 |

## 2. Unit tests

| Area | Cases |
|---|---|
| Sign-up validation | Required fields, email format, password policy, duplicate email, duplicate username |
| Password handling | Hashing, verification, reset token expiry, reset token single use, invalid reset token |
| Sessions | Session creation, logout invalidation, protected route without session |
| GitHub OAuth | Valid state, replayed/invalid state, encrypted token storage, disconnect removes token |
| Authorization | Role matrix Developer/Maintainer/Admin, admin-only routes, owner-only profile access |
| Profile | Skills/languages create-update-delete, experience enum, profile completeness rule |
| CV validation | Allowed types, max size, empty file, replace previous file |
| CV extraction | Status transitions (`pending → processing → completed/failed`), invalid LLM output, partial skills |
| AI settings | Positive integers, temperature range, usage limit, invalid values rejected |
| Notifications | Read/unread toggle, ownership check, idempotent mark-as-read |

## 3. Integration tests

- OAuth callback with a mocked GitHub provider.
- Password reset email with a mocked email provider.
- CV upload → job → mocked parser/LLM → completed status.
- Database migrations and role seed data.
- Unauthenticated and wrong-role requests to every protected endpoint.

## 4. Manual tests

| ID | Scenario | Steps | Expected |
|---|---|---|---|
| M1.1 | Email sign-up | Fill valid name, email, password → submit | Account created, logged in, dashboard shown |
| M1.2 | Duplicate sign-up | Reuse an existing email → submit | Error shown, no second account |
| M1.3 | GitHub sign-up/login | Choose GitHub → authorize | Account linked, dashboard shown |
| M1.4 | Login failure | Enter wrong password | Error shown, no session |
| M1.5 | Logout | Log in → log out → open protected URL | Session ends, access denied |
| M1.6 | Password reset | Request reset → open email link → set new password → log in | New password works |
| M1.7 | GitHub disconnect | Connect → disconnect | Link removed, GitHub data no longer read |
| M1.8 | Role protection | Log in as Developer → open Admin page | Access denied |
| M1.9 | Profile save/reload | Enter skills, level and languages → save → reload | Values persist |
| M1.10 | Profile gate | Remove experience level → request recommendations | Prompt to complete required fields |
| M1.11 | CV upload valid/invalid | Upload supported file; then unsupported/oversized file | Valid accepted and processed; invalid rejected with error |
| M1.12 | CV review | Open extracted results → edit a skill → save → reload | Corrections persist |
| M1.13 | Edit profile/password | Change username/bio and password | Changes saved; duplicate username rejected |
| M1.14 | AI settings | Admin saves valid and invalid values | Valid stored; invalid rejected with error |
| M1.15 | Notifications | Open list → mark as read → reload | Read state persists |

## 5. Non-functional checks

- Passwords stored hashed; GitHub tokens encrypted (NFR-3.4).
- HTTPS on every environment (NFR-3.3).
- 100% of protected operations reject missing/insufficient roles (NFR-3.1).
- CV extraction shown within 30 seconds for 95% of uploads (NFR-1.4).
- Standard API responses within 500 ms under normal load (NFR-1.1, baseline measurement).

## 6. Test data and environment

- Use a dedicated test database and seeded users for each role.
- Mock GitHub, email, CV parser and LLM services; never call paid services from automated tests.
- Record the build/commit tested and the date for every manual run.
- Manual test IDs above must be ticked in the review file.

## 7. Exit criteria

- All unit and integration tests pass.
- All manual test cases above pass.
- Non-functional checks pass or have a recorded, accepted exception.
- No open critical or high bug.
