# Sprint 5 — API Contract and Manual API Tests

> Back to [sprint specification](00-sprint.md) · [testing](02-testing.md) · [review](03-review.md)

Status: **defined and shipped.** The table matches the implementation; run the manual checklist against the demo stack.

Global conventions (base URL, auth header, error shape, pagination) live in [`../../API.md`](../../API.md). Define them once and keep them consistent here.

## 1. Endpoint contract

| ID | Method | Path | Auth | Purpose | Request | Response | Errors |
|---|---|---|---|---|---|---|---|
| A5.1 | GET/PUT | `/public-profile/settings` | Developer | Visibility/publish settings | UpdatePublicProfile | PublicProfileSettings | 400, 409 handle |
| A5.2 | GET | `/public/profiles/:handle` | Public | Visible sections only | — | PublicProfile | 404 private/unknown |
| A5.3 | POST | `/public-profile/publish` | Developer | Publish/unpublish | `{published}` | PublicProfileSettings | 400 |
| A5.4 | GET | `/community/contributors` | Developer/Maintainer | Search contributors | org\|repo, language, topic | ContributorSearchResponse | 400, 429 |
| A5.5 | GET | `/community/contributors/:login` | Developer/Maintainer | Activity/expertise | — | ContributorDetail | 404 |
| A5.6 | POST | `/outreach` | Developer/Maintainer | Send request | `{recipientId,type,message}` | OutreachRequest | 403 not opted/blocked, 429 |
| A5.7 | PATCH | `/outreach/:id` | Session | Accept/decline/block | `{action}` | OutreachRequest | 403, 404, 409 |
| A5.8 | GET | `/outreach` | Session | Sent + received | — | OutreachList | 401 |
| A5.9 | GET/POST | `/outreach/:id/conversation[/messages]` | Session | Read/send messages | `{body}` | OutreachConversation | 403, 404, 409 not accepted |
| A5.10 | GET | `/learning` | Public | Topic search | q, topic | LearningSearchResponse | 400 empty q |
| A5.11 | GET | `/admin/ai-settings/usage` | Admin | Settings vs usage | — | `{settings, usage}` | 403 |

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
