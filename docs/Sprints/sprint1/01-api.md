# Sprint 1 — API Contract and Manual API Tests

> Back to [sprint specification](00-sprint.md) · [testing](02-testing.md) · [review](03-review.md)

Status: **Endpoints are to be defined in this sprint.** Replace every `TBD` with the real method and path before implementation, then run the manual checklist.

Global conventions (base URL, auth header, error shape, pagination) live in [`../../API.md`](../../API.md). Define them once and keep them consistent here.

## 1. Endpoint contract

| ID | Method | Path | Auth | Purpose | Request | Response | Errors |
|---|---|---|---|---|---|---|---|
| A1.1 | TBD | TBD | Public | Sign up with email | name, email, password | User + session | 400 invalid, 409 duplicate email |
| A1.2 | TBD | TBD | Public | GitHub OAuth callback / sign up | OAuth code + state | User + session or link | 400 invalid state |
| A1.3 | TBD | TBD | Public | Log in with email and password | email, password | Session | 401 wrong credentials |
| A1.4 | TBD | TBD | Session | Log out | session/token | 204 / success | 401 no session |
| A1.5 | TBD | TBD | Public | Request password reset | email | 202 accepted | 400 invalid email |
| A1.6 | TBD | TBD | Public | Confirm password reset | reset token, new password | Success | 400 expired/invalid token |
| A1.7 | TBD | TBD | Developer | Connect GitHub account | OAuth code + state | Connection status | 400 state, 409 already linked |
| A1.8 | TBD | TBD | Developer | Disconnect GitHub account | — | Success | 403 not owner |
| A1.9 | TBD | TBD | Session | Get my profile and developer profile | — | Profile object | 401 no session |
| A1.10 | TBD | TBD | Session | Update account profile and password | name, username, bio, avatar, password | Updated profile | 400 duplicate username, 400 weak password |
| A1.11 | TBD | TBD | Developer | Update skills, experience level and languages | skills, level, languages | Updated developer profile | 400 invalid level/language |
| A1.12 | TBD | TBD | Developer | Upload or replace CV | multipart file | File id + status | 400 type/size, 413 too large |
| A1.13 | TBD | TBD | Developer | Get CV extraction status and results | — | Status + extracted skills | 403 not owner |
| A1.14 | TBD | TBD | Admin | Get AI settings | — | Settings | 403 not Admin |
| A1.15 | TBD | TBD | Admin | Update AI settings | max tokens, temperature, usage limit | Updated settings | 400 invalid values, 403 not Admin |
| A1.16 | TBD | TBD | Session | List my notifications | — | Notifications | 401 no session |
| A1.17 | TBD | TBD | Session | Mark a notification as read | notification id | Read state | 403 not owner, 404 missing |

## 2. Manual API test checklist

For each endpoint, test the happy path plus the security and validation cases below. Use a Developer, a Maintainer and an Admin account.

| ID | Endpoint | Checks | Expected | Pass |
|---|---|---|---|---|
| A1.1 | Sign up with email | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A1.2 | GitHub OAuth callback / sign up | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A1.3 | Log in with email and password | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A1.4 | Log out | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A1.5 | Request password reset | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A1.6 | Confirm password reset | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A1.7 | Connect GitHub account | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A1.8 | Disconnect GitHub account | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A1.9 | Get my profile and developer profile | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A1.10 | Update account profile and password | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A1.11 | Update skills, experience level and languages | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A1.12 | Upload or replace CV | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A1.13 | Get CV extraction status and results | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A1.14 | Get AI settings | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A1.15 | Update AI settings | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A1.16 | List my notifications | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A1.17 | Mark a notification as read | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |

## 3. How to run the manual checks

1. Set `BASE_URL` to the local or deployed environment.
2. Obtain a session/token for each role and store them as `DEV_TOKEN`, `MNT_TOKEN`, `ADMIN_TOKEN`.
3. Call each endpoint with curl or Postman:

```bash
curl -i -X <METHOD> "$BASE_URL<PATH>" \
  -H "Authorization: Bearer $DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '<REQUEST_BODY>'
```

4. Record status code, response body and the database/storage side effect.
5. Test missing session (`401`), wrong role or owner (`403`/`404`), invalid input (`400`) and not found (`404`).
6. Tick `Pass` only when the contract table and the real response agree. Update the contract first when they differ.

## 4. Exit criteria

- Every endpoint has a method, path, auth rule, request, response and error list.
- Every manual check above passed on the sprint build.
- No endpoint returns another user's private data.
- The table matches the implementation; no undocumented endpoint exists.
