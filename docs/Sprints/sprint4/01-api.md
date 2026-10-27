# Sprint 4 — API Contract and Manual API Tests

> Back to [sprint specification](00-sprint.md) · [testing](02-testing.md) · [review](03-review.md)

Status: **defined and shipped.** The table matches the implementation; run the manual checklist against the demo stack.

Global conventions (base URL, auth header, error shape, pagination) live in [`../../API.md`](../../API.md). Define them once and keep them consistent here.

## 1. Endpoint contract

| ID | Method | Path | Auth | Purpose | Request | Response | Errors |
|---|---|---|---|---|---|---|---|
| A4.1 | GET | `/progress/:id/history` | Developer | Dated history | — | ProgressHistory | 403/404 |
| A4.2 | GET/PUT | `/notifications/preferences` | Developer | Channels/frequency/types | UpdateNotificationPreferences | NotificationPreferences | 400 |
| A4.3 | GET/PATCH/POST | `/notifications`, `/:id/read`, `/read-all` | Developer | List/mark read | — | NotificationList/Dto | 403/404 |
| A4.4 | GET | `/achievements` | Developer | Badges/streak/visibility | — | Achievements | 401 |
| A4.5 | PATCH | `/achievements/visibility` | Developer | Badge public flag | `{badgeCode, publicVisible}` | `{ok:true}` | 400, 409 |
| A4.6 | GET | `/me/history`, `/me/stats` | Developer | Issues/chats/counts | — | AccountHistory | 403/404 |
| A4.7 | DELETE | `/me` | Developer | Delete account + data | — | `{requested:true}` | 401 |
| A4.8 | GET | `/admin/metrics` | Admin | Users/suggestions/status | start?, end? | AdminMetrics | 403 |
| A4.9 | GET | `/admin/ai-usage` | Admin | Tokens by feature/period | start, end, feature | AiUsageSummary | 400, 403 |

## 2. Manual API test checklist

For each endpoint, test the happy path plus the security and validation cases below. Use a Developer, a Maintainer and an Admin account.

| ID | Endpoint | Checks | Expected | Pass |
|---|---|---|---|---|
| A4.1 | Get progress history for an issue | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A4.2 | Get and update notification preferences | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A4.3 | List notifications and mark read | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A4.4 | Get badges, locked requirements, streaks and visibility | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A4.5 | Update badge visibility for the public profile | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A4.6 | Get account history and statistics | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A4.7 | Delete account and personal data | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A4.8 | Get platform usage metrics | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |
| A4.9 | Get AI usage for a period | Happy path; missing session → 401; wrong role/owner → 403/404; invalid input → 4xx | Response follows contract; side effect correct | ☐ |

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
