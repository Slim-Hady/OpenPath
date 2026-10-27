# Runtime flows

How the services talk. Sequence diagrams are in
[`diagrams/sequences/`](diagrams/sequences/) — this file explains the rules
behind them instead of duplicating them.

## 1. Synchronous request path

```text
browser → web (cookie) → BFF /api/* (Bearer) → api guard → role →
service (ownership + rules) → Postgres/provider → Zod-shaped response
```

- The browser never calls the API origin directly; there is no CORS and no
  cross-site cookie.
- The BFF attaches the Supabase access token, forwards the method/body/query,
  and returns the upstream status. It contains no business logic.
- The API verifies the token against JWKS, loads the role from `User`, then the
  service re-checks ownership for every owner-scoped row.
- Responses are parsed by the web from the same Zod contract the API used.

## 2. Asynchronous job path

```text
api scheduler/request → Redis queue (job id + idempotency key) → worker →
Postgres/provider → notification/next job
```

- Cron in the API **only enqueues**. The worker consumes.
- Jobs carry ids, never file bytes or tokens.
- Retries: 3, exponential backoff, then dead-letter.
- Idempotency: unique job ids plus database unique keys
  (`ProgressEvent.dedupeKey`, `Notification.(userId,dedupeKey)`,
  `UserBadge.(userId,badgeId)`).
- Redis down: reads still work; enqueue returns 503 with a clear message. The
  UI labels the failure.

Queues: `cv.extract`, `notifications.deliver`, `notifications.digest`,
`github.sync.progress`, `github.sync.saved`, `gamification.evaluate`,
`admin.aggregate`, `account.delete`.

## 3. Authentication propagation

| Hop | Credential |
|---|---|
| browser → Supabase | email/password or GitHub OAuth |
| browser → web | Supabase session cookie (httpOnly, same origin) |
| web → api | `Authorization: Bearer <access token>` |
| api → Supabase | JWKS for verification; service role only for Storage/admin |
| api → GitHub | AES-256-GCM-decrypted provider token, or public fallback |
| api → Gemini/Resend | server-side API keys |

There is no service-to-service JWT minting: the worker is the same service
process family and reads the database directly (ADR 0003).

## 4. Caching boundaries

| Data | Key | TTL | Invalidation |
|---|---|---|---|
| GitHub pool | `gh:pool:<hash>` | 15 min | TTL; stale copy 24 h |
| Repo context | `gh:repo:<repo>` | 15 min | TTL |
| Contributors | `gh:contributors:<hash>` | 15 min | TTL |
| Contributor detail | `gh:contributor:<login>` | 15 min | TTL |
| Admin metrics | `admin:metrics:<period>` | 5 min | TTL |
| Onboarding | Postgres by repo+commit / issue version | until source changes | compare commit/`updated_at` |
| Auth-gated pages | TanStack Query | 30 s | mutation invalidation |

Never cached: CV text, chat, selections, tokens, personal notifications.

## 5. AI path

`assertAllowed` (settings + monthly user tokens + platform cost) → provider
(fast model first, bounded model fallback) → `record` (usage row) → guardrail →
response. Ranking and onboarding fall back deterministically; the guide returns
503 and keeps history. No request path depends on AI succeeding except the
guide, which is an AI feature by definition and says so.

## 6. Failure behaviour

| Dependency | User sees |
|---|---|
| Gemini slow/down | ranking/onboarding: rules fallback labelled; guide: offline card, history safe |
| GitHub rate-limited | cached pool + reset time; never a blank screen |
| Redis down | reads work; enqueue 503 with a clear message |
| Supabase paused | login fails with a clear message; health readiness fails |
| Email down | in-app row exists; email retry/dead-letter |
| Postgres down | readiness 503; the request fails cleanly, no silent success |

## 7. Where to read next

- Auth: `sequences/01-auth.md`
- Discovery and ranking: `sequences/02-discovery-ranking.md`
- Selection and onboarding: `sequences/03-selection-onboarding.md`
- Guide: `sequences/04-ai-guide.md`
- CV: `sequences/05-cv-upload.md`
- Sync: `sequences/06-progress-sync.md`
- Notifications: `sequences/07-notifications.md`
- Outreach: `sequences/08-outreach.md`
- Learning: `sequences/09-learning.md`
- Public profile: `sequences/10-public-profile.md`
- Contributor search: `sequences/11-contributor-search.md`
- Admin: `sequences/12-admin.md`
