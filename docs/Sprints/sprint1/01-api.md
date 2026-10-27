# Sprint 1 — API Contract and Manual API Tests

> Back to [sprint specification](00-sprint.md) · [testing](02-testing.md) · [review](03-review.md)

Status: **defined and shipped.** The table matches the implementation; run the manual checklist against the demo stack.

Global conventions (base URL, auth header, error shape, pagination) live in [`../../API.md`](../../API.md). Define them once and keep them consistent here.

## 1. Endpoint contract

| ID | Method | Path | Auth | Purpose | Request | Response | Errors |
|---|---|---|---|---|---|---|---|
| A1.1 | POST | \(Supabase\) `/auth/v1/signup` | Public | Sign up with email | name (metadata), email, password | session or confirm-email | 400 invalid, 409 duplicate email |
| A1.2 | GET | `/auth/callback` (web) + Supabase | Public | GitHub OAuth return | `code` | session + provider token | 400 missing code |
| A1.3 | POST | \(Supabase\) `/auth/v1/token?grant_type=password` | Public | Log in | email, password | session | 401 wrong credentials |
| A1.4 | POST | \(Supabase\) `/auth/v1/logout` | Session | Log out | — | 204 | 401 |
| A1.5 | POST | \(Supabase\) `/auth/v1/recover` | Public | Request reset | email | 200 | 400 invalid email |
| A1.6 | PUT | \(Supabase\) `/auth/v1/user` | Recovery session | Set new password | password | user | 400 expired/invalid |
| A1.7 | POST | `/github/connect` | Developer | Encrypt provider token | providerToken | GithubConnection | 400 invalid token |
| A1.8 | DELETE | `/github` | Developer | Disconnect | — | `{ok:true}` | 401 |
| A1.9 | GET | `/me`, `/profile` | Session | My account + profile | — | Me, Profile | 401 |
| A1.10 | PATCH | `/me` | Session | Name/username/bio/avatar | UpdateMe | Me | 400, 409 username |
| A1.11 | PUT | `/profile` | Developer | Level/languages/skills | UpdateProfile | Profile | 400 |
| A1.12 | POST | `/cv` | Developer | Upload/replace CV | multipart `file` | CvFile PENDING | 400 type, 413 size, 503 storage/queue |
| A1.13 | GET | `/cv` | Developer | CV status + extraction | — | CvFile or null | 401 |
| A1.14 | GET | `/admin/ai-settings` | Admin | Current AI settings | — | AiSettings | 403 |
| A1.15 | PUT | `/admin/ai-settings` | Admin | Update AI settings | UpdateAiSettings | AiSettings | 400, 403 |
| A1.16 | GET | `/notifications` | Session | List notifications | page, perPage | NotificationList | 401 |
| A1.17 | PATCH | `/notifications/:id/read` | Session | Mark read | — | NotificationDto | 403/404, 404 not owner |

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
