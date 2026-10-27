# Sequence — contributor search

```mermaid
sequenceDiagram
  autonumber
  actor D as Developer/Maintainer
  participant W as /community
  participant A as CommunityController
  participant G as GithubService
  participant R as Redis
  participant GH as GitHub

  D->>W: org or owner/repo + language/topic
  W->>A: GET /community/contributors
  A->>G: searchContributors
  G->>R: GET gh:contributors:<hash>
  alt cache miss
    G->>GH: repos + contributors + languages/topics + participation
    GH-->>G: public data
    G->>R: SET 900s
  end
  G->>G: aggregate, filter, score; attach opted-in public handle/id only
  G-->>A: ranked Contributor[]
  A-->>W: ContributorSearchResponse
  W-->>D: ranked rows
```

Only public GitHub data; platform ids and handles only for published, opted-in
profiles. Rate limit → honest error; cache 15 minutes. See FR-17.
