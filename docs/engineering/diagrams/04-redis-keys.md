# 04 — Redis key structure (non-relational store)

Redis is ephemeral: losing it must not lose product state. It holds shared
caches and queues only. TTLs are deliberately short on the free plan.

## Keys

| Key pattern | Type | TTL | Writer | Reader |
|---|---|---|---|---|
| `gh:pool:<hash>` | JSON string | 900 s | `GithubService.searchIssues` | same |
| `gh:stale:<hash>` | JSON string | 86,400 s | same | rate-limit fallback |
| `gh:repo:<owner/repo>` | JSON string | 900 s | `repoContext` | onboarding/guide |
| `gh:contributors:<hash>` | JSON string | 900 s | `searchContributors` | community page |
| `gh:contributor:<login>` | JSON string | 900 s | `contributorDetail` | community detail |
| `admin:metrics:<from>:<to>` | JSON string | 300 s | `AdminService.metrics` | admin page |
| BullMQ `bull:*` | lists/sets/zsets | queue-managed | `QueueService`/worker | worker |

Rate-limit counters use `@nestjs/throttler` in-process for the single-host demo.
The `RedisService.increment` method is available for a shared limiter when the
API is scaled beyond one instance.

## Sample JSON — issue pool

```json
{
  "items": [
    {
      "id": "vercel/next.js#48213",
      "number": 48213,
      "repoFullName": "vercel/next.js",
      "organization": "vercel",
      "title": "Add keyboard navigation to the docs search",
      "url": "https://github.com/vercel/next.js/issues/48213",
      "labels": ["good first issue", "documentation"],
      "language": "TypeScript",
      "level": "BEGINNER",
      "repoDescription": "The React framework for the web",
      "stars": 132000,
      "updatedAt": "2026-10-26T22:00:00.000Z",
      "activityDays": 1,
      "assigned": false,
      "state": "open"
    }
  ],
  "total": 480,
  "fetchedAt": "2026-10-27T03:00:00.000Z"
}
```

## Sample JSON — repository context

```json
{
  "fullName": "vercel/next.js",
  "description": "The React framework for the web",
  "defaultBranch": "canary",
  "stars": 132000,
  "language": "TypeScript",
  "readme": "…truncated to 14k…",
  "contributing": "…truncated to 8k…",
  "tree": ["README.md", "package.json", "packages/next/src/…"],
  "languages": ["TypeScript", "JavaScript", "Rust"],
  "topics": ["nextjs", "react", "ssr"],
  "commitSha": "a1b2c3d",
  "updatedAt": "2026-10-26T20:00:00.000Z"
}
```

## Sample JSON — admin metrics

```json
{
  "registeredUsers": 4,
  "loggedInUsers": 4,
  "issuesSuggested": 12,
  "issuesRegenerated": 3,
  "statusCounts": { "inProgress": 2, "prOpen": 1, "merged": 4, "ignored": 2 },
  "capturedAt": "2026-10-27T03:00:00.000Z",
  "fresh": true
}
```

## Sample JSON — contributor cache

```json
{
  "items": [
    {
      "login": "octocat",
      "name": "The Octocat",
      "avatarUrl": "https://avatars.githubusercontent.com/u/583231",
      "githubUrl": "https://github.com/octocat",
      "contributions": 42,
      "languages": ["TypeScript"],
      "topics": ["testing"],
      "score": 92,
      "platformHandle": "maintainer",
      "platformUserId": "cm…",
      "optedIn": true,
      "activity": [0, 2, 1, 4, 0, 0, 3, 1, 0, 2, 0, 1]
    }
  ],
  "fetchedAt": "2026-10-27T03:00:00.000Z"
}
```

## Rules

- Never cache personal data (CV text, chat, selections, tokens) in Redis.
- A cache miss falls back to the database or the provider; a Redis outage makes
  reads slower and disables enqueue, not correctness.
- Queue jobs carry ids, never file bytes or tokens.
