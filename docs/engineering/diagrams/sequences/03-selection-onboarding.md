# Sequence — selection and onboarding

```mermaid
sequenceDiagram
  autonumber
  actor D as Developer
  participant W as Issue detail
  participant A as API
  participant S as SelectionService
  participant G as GithubService
  participant AI as Gemini
  participant R as Redis
  participant DB as Postgres

  D->>W: Work on this issue → Start working
  W->>A: POST /selection {issueId, confirmed:true}
  A->>S: select()
  S->>DB: verify issue open; no active selection
  S->>DB: transaction: Selection + first ProgressEvent
  S-->>A: Selection
  A-->>W: In Progress

  W->>A: GET /onboarding/repository/:issueId
  A->>S: ownership check
  A->>G: repoContext(repo)
  G->>R: GET gh:repo:<repo>
  alt cache miss
    G->>GH: repo + README + CONTRIBUTING + tree
    G->>R: SET 900s
  end
  A->>DB: RepositoryOnboarding by repo+commit
  alt cached
    DB-->>A: stored guidance
  else generate
    A->>AI: structured onboarding JSON
    AI-->>A: sections
    A->>A: guardrail sanitize each field
    A->>DB: insert with commitSha
  end
  A-->>W: overview, setup, first files, PR guidance

  W->>A: GET /onboarding/issue/:issueId
  A->>DB: IssueOnboarding where sourceUpdatedAt matches
  A->>AI: issue summary + requirements + resources (if stale)
  A-->>W: summary and resources
  W-->>D: Overview tab
```

Reuse is by repository+commit, so a second user on the same repo gets the
stored guidance without a provider call. See FR-6, FR-9 and FR-10.
