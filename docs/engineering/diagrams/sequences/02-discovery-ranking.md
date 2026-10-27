# Sequence — discovery and ranking

```mermaid
sequenceDiagram
  autonumber
  actor D as Developer
  participant W as Discover page
  participant A as API
  participant P as ProfileService
  participant G as GithubService
  participant R as Redis
  participant GH as GitHub Search
  participant AI as Gemini
  participant DB as Postgres

  D->>W: Find issues (filters)
  W->>A: POST /discovery/recommendations
  A->>P: requireComplete(userId)
  P-->>A: level + languages or 409
  A->>G: searchIssues(userId, filters, page 1, 30)
  G->>R: GET gh:pool:<hash>
  alt cache hit
    R-->>G: items + fetchedAt
  else miss
    G->>GH: GET /search/issues?q=…
    GH-->>G: items + total
    G->>DB: upsert GithubIssue rows
    G->>R: SET pool 900s + stale 86400s
  end

  A->>A: exclude selected/ignored, cap at 20, exclude previous batch
  A->>A: AiUsage.assertAllowed(ISSUE_MATCHING)
  alt within limits
    A->>AI: JSON ranking (issueId, rank, reason)
    AI-->>A: ranking or timeout/503
    A->>DB: Recommendation + SuggestionEvent + AiUsage
  else provider failure
    A->>A: deterministic rules ranking
    A->>DB: fallback=true rows
  end
  A-->>W: exactly three recommendations + fallback flag
  W-->>D: three cards with reasons
```

Cache TTL 15 minutes; stale 24 hours. A GitHub 429 returns the stale pool with
`stale=true` and a reset time. A model failure still returns three issues,
labelled `Ranked by rules`. See FR-4 and FR-5.
