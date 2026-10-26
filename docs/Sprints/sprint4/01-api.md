# Sprint 4 — API Contract and Manual API Tests

> Back to [sprint specification](00-sprint.md) · [testing](02-testing.md) · [review](03-review.md)

Status: **Endpoints are to be defined in this sprint.** Replace every `TBD` with the real method and path before implementation, then run the manual checklist.

Global conventions (base URL, auth header, error shape, pagination) live in [`../../API.md`](../../API.md). Define them once and keep them consistent here.

## 1. Endpoint contract

| ID | Method | Path | Auth | Purpose | Request | Response | Errors |
|---|---|---|---|---|---|---|---|
| A4.1 | TBD | TBD | Developer | Get progress history for an issue | issue id | Dated history | 403 not owner |
| A4.2 | TBD | TBD | Developer | Get and update notification preferences | channels, frequency, event types | Preferences | 400 invalid channel/frequency |
| A4.3 | TBD | TBD | Developer | List notifications and mark read | notification id | Notifications/read state | 403 not owner |
| A4.4 | TBD | TBD | Developer | Get badges, locked requirements, streaks and visibility | — | Achievements | 401 no session |
| A4.5 | TBD | TBD | Developer | Update badge visibility for the public profile | badge ids | Visibility settings | 400 unknown badge |
| A4.6 | TBD | TBD | Developer | Get account history and statistics | — | Issues, chats, counts | 403 not owner |
| A4.7 | TBD | TBD | Developer | Delete account and personal data | confirmation | Deletion accepted | 401 no session |
| A4.8 | TBD | TBD | Admin | Get platform usage metrics | — | Users, suggestions/regenerations, status counts | 403 not Admin |
| A4.9 | TBD | TBD | Admin | Get AI usage for a period | start, end, feature, page | Token totals | 400 invalid period, 403 not Admin |

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
