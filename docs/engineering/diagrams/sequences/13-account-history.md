# Sequence — account history, statistics and deletion

```mermaid
sequenceDiagram
  autonumber
  actor D as Developer
  participant W as /settings/history
  participant A as ProfileController
  participant S as ProfileService
  participant DB as Postgres
  participant Q as BullMQ

  D->>W: open History
  W->>A: GET /me/history (Bearer)
  A->>S: history(userId)
  S->>DB: selections + issues + events + chat ids
  S-->>A: items + stats (owner only)
  A-->>W: AccountHistory
  W-->>D: counts and issue/chat links
  D->>W: Settings → Account → Delete account
  W->>A: DELETE /me (typing confirmation client-side)
  A->>S: requestDeletion(userId)
  S->>DB: DeletionRequest
  S->>Q: account.delete
  A-->>W: {requested:true}
  Q->>DB: remove CV objects, auth user, owned rows
```

The HTTP request only records the request; the worker performs the destructive
work. See FR-14 and `07-notifications.md` for the delivery side.
