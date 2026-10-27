# Sprint 3 — API Contract and Manual API Tests

> Back to [sprint specification](00-sprint.md) · [testing](02-testing.md) · [review](03-review.md)

Status: **defined and shipped.** The table matches the implementation; run the manual checklist against the demo stack.

Global conventions (base URL, auth header, error shape, pagination) live in [`../../API.md`](../../API.md). Define them once and keep them consistent here.

## 1. Endpoint contract

| ID | Method | Path | Auth | Purpose | Request | Response | Errors |
|---|---|---|---|---|---|---|---|
| A3.1 | GET | `/onboarding/repository/:issueId` | Developer | Repo overview/setup/PR | — | RepositoryOnboarding | 404 not selected |
| A3.2 | GET | `/onboarding/issue/:issueId` | Developer | Issue summary/requirements | — | IssueOnboarding | 404 not selected |
| A3.3 | GET | `/guide/conversations/:issueId` | Developer | Start/resume chat | — | GuideConversation | 403/404 |
| A3.4 | POST | `/guide/conversations/:issueId/messages` | Developer | Send message | `{content}` | GuideReply | 403, 429 limit, 503 AI |
| A3.5 | GET | `/progress` | Developer | Dashboard + counts | — | ProgressSummary | 401 |
| A3.6 | PATCH | `/progress/:id` | Developer | Status + PR link | `{status, prUrl?, note?}` | Selection | 400, 403/404, 409 merged |

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
