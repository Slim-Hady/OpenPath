# Sprint 5 — API Contract and Manual API Tests

> Back to [sprint specification](00-sprint.md) · [testing](02-testing.md) · [review](03-review.md)

Status: **Endpoints are to be defined in this sprint.** Replace every `TBD` with the real method and path before implementation, then run the manual checklist.

Global conventions (base URL, auth header, error shape, pagination) live in [`../../API.md`](../../API.md). Define them once and keep them consistent here.

## 1. Endpoint contract

| ID | Method | Path | Auth | Purpose | Request | Response | Errors |
|---|---|---|---|---|---|---|---|
| A5.1 | TBD | TBD | Developer | Get and update my public profile settings | visibility, published | Profile settings | 401 no session |
| A5.2 | TBD | TBD | Public | Get a public contribution profile by link | handle/link | Visible sections only | 404 private/unknown |
| A5.3 | TBD | TBD | Developer | Publish or unpublish my profile and copy the link | published flag | Public link | 400 invalid handle |
| A5.4 | TBD | TBD | Developer/Maintainer | Search contributors by organization, repository, language or topic | org, repo, language, topic | Ranked contributors | 400 missing org/repo, 429 rate limit |
| A5.5 | TBD | TBD | Developer/Maintainer | Get contributor activity and expertise | contributor id/login | Merged PRs, commits, reviews, expertise | 404 contributor not found |
| A5.6 | TBD | TBD | Developer/Maintainer | Send an outreach request | recipient, type, message | Request sent | 403 not opted in, 429 rate limit, 403 blocked |
| A5.7 | TBD | TBD | Session | Accept, decline or block an outreach request | request id, action | Updated status | 403 not recipient, 404 missing |
| A5.8 | TBD | TBD | Session | List sent and received requests | — | Requests with statuses | 401 no session |
| A5.9 | TBD | TBD | Session | Get and send messages in an accepted conversation | conversation id, message | Stored messages | 403 not participant, 409 not accepted |
| A5.10 | TBD | TBD | Public | Search learning resources by topic | query | Matching resources / empty state | 400 empty query |
| A5.11 | TBD | TBD | Admin | Get AI settings against usage | — | Settings + usage vs limit | 403 not Admin |

## 2. Manual API test checklist

For each endpoint, test the happy path plus the security and validation cases below. Use a Developer, a Maintainer and an Admin account.

| ID | Endpoint | Checks | Expected | Pass |
|---|---|---|---|---|
| A5.1 | Get and update my public profile settings | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A5.2 | Get a public contribution profile by link | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A5.3 | Publish or unpublish my profile and copy the link | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A5.4 | Search contributors by organization, repository, language or topic | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A5.5 | Get contributor activity and expertise | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A5.6 | Send an outreach request | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A5.7 | Accept, decline or block an outreach request | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A5.8 | List sent and received requests | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A5.9 | Get and send messages in an accepted conversation | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A5.10 | Search learning resources by topic | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A5.11 | Get AI settings against usage | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |

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
