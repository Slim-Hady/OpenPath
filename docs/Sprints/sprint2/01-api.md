# Sprint 2 — API Contract and Manual API Tests

> Back to [sprint specification](00-sprint.md) · [testing](02-testing.md) · [review](03-review.md)

Status: **Endpoints are to be defined in this sprint.** Replace every `TBD` with the real method and path before implementation, then run the manual checklist.

Global conventions (base URL, auth header, error shape, pagination) live in [`../../API.md`](../../API.md). Define them once and keep them consistent here.

## 1. Endpoint contract

| ID | Method | Path | Auth | Purpose | Request | Response | Errors |
|---|---|---|---|---|---|---|---|
| A2.1 | TBD | TBD | Developer | Search open GitHub issues using profile and filters | language, label, activity, org, repo, page | Issue candidates | 400 invalid filter, 429 rate limit |
| A2.2 | TBD | TBD | Developer | Get three recommendations | search/filter context | 3 ranked issues + reasons | 409 incomplete profile, 503 AI unavailable |
| A2.3 | TBD | TBD | Developer | Regenerate recommendations | previous recommendation set | 3 different ranked issues | 409 no previous set |
| A2.4 | TBD | TBD | Developer | Get issue details | issue id | Repository, requirements, reason | 404 issue not found |
| A2.5 | TBD | TBD | Developer | Select and confirm an issue | issue id, confirm | Selection with In Progress | 409 already selected, 404 issue |
| A2.6 | TBD | TBD | Developer | Ignore an issue | issue id | Ignored state | 409 already selected |
| A2.7 | TBD | TBD | Developer | List, create, rename and delete saved lists | list name | Saved lists | 403 not owner |
| A2.8 | TBD | TBD | Developer | Add, move and remove saved items | list id, repository/issue id | Saved item | 403 not owner, 404 missing |
| A2.9 | TBD | TBD | Developer | Select an issue from saved items | saved item id, confirm | Selection with In Progress | 403 not owner, 409 unavailable |

## 2. Manual API test checklist

For each endpoint, test the happy path plus the security and validation cases below. Use a Developer, a Maintainer and an Admin account.

| ID | Endpoint | Checks | Expected | Pass |
|---|---|---|---|---|
| A2.1 | Search open GitHub issues using profile and filters | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A2.2 | Get three recommendations | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A2.3 | Regenerate recommendations | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A2.4 | Get issue details | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A2.5 | Select and confirm an issue | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A2.6 | Ignore an issue | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A2.7 | List, create, rename and delete saved lists | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A2.8 | Add, move and remove saved items | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A2.9 | Select an issue from saved items | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |

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
