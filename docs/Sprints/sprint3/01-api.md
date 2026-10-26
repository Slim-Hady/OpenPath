# Sprint 3 — API Contract and Manual API Tests

> Back to [sprint specification](00-sprint.md) · [testing](02-testing.md) · [review](03-review.md)

Status: **Endpoints are to be defined in this sprint.** Replace every `TBD` with the real method and path before implementation, then run the manual checklist.

Global conventions (base URL, auth header, error shape, pagination) live in [`../../API.md`](../../API.md). Define them once and keep them consistent here.

## 1. Endpoint contract

| ID | Method | Path | Auth | Purpose | Request | Response | Errors |
|---|---|---|---|---|---|---|---|
| A3.1 | TBD | TBD | Developer | Get repository onboarding | selected issue id | Overview, setup, PR guidance | 404 not selected, 403 not owner |
| A3.2 | TBD | TBD | Developer | Get issue onboarding | selected issue id | Summary, requirements, related code, resources | 404 not selected |
| A3.3 | TBD | TBD | Developer | Start or resume an issue chat | selected issue id | Conversation + history | 403 not owner |
| A3.4 | TBD | TBD | Developer | Send an AI guide message | message, conversation id | Reply + usage | 429 limit reached, 503 AI unavailable |
| A3.5 | TBD | TBD | Developer | Get progress dashboard | — | Selected issues, statuses, counts | 401 no session |
| A3.6 | TBD | TBD | Developer | Update progress status and PR link | status, PR URL | Updated progress + event | 400 invalid status/URL, 403 not owner |

## 2. Manual API test checklist

For each endpoint, test the happy path plus the security and validation cases below. Use a Developer, a Maintainer and an Admin account.

| ID | Endpoint | Checks | Expected | Pass |
|---|---|---|---|---|
| A3.1 | Get repository onboarding | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A3.2 | Get issue onboarding | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A3.3 | Start or resume an issue chat | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A3.4 | Send an AI guide message | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A3.5 | Get progress dashboard | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A3.6 | Update progress status and PR link | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |

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
