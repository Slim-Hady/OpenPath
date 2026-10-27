# Sequence — public learning search

```mermaid
sequenceDiagram
  autonumber
  actor P as Public visitor
  participant W as /learn
  participant A as LearningController
  participant DB as Postgres
  P->>W: ?q=tests or ?topic=Tests
  W->>A: GET /learning?q=… (public, no token)
  A->>A: validate query; empty q → 400
  A->>DB: contains(title|summary|body|topic), distinct topics
  DB-->>A: rows
  A-->>W: LearningSearchResponse
  W-->>P: cards or a no-results state
  P->>W: /learn/git-basics
  W->>A: GET /learning/git-basics
  A->>DB: slug lookup
  A-->>W: LearningResource (404 if unknown)
```

Public, cacheable, no personal data. See FR-12.
