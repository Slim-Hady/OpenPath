# Sequence — progress sync

```mermaid
sequenceDiagram
  autonumber
  participant C as API scheduler (cron)
  participant Q as Redis/BullMQ
  participant K as Worker SyncService
  participant DB as Postgres
  participant GH as GitHub
  participant N as Notifications
  participant G as Gamification

  C->>Q: add github.sync.progress (every 5 min)
  Q->>K: consume
  K->>DB: 20 selections stale >5 min
  loop each selection
    alt attached PR URL
      K->>GH: GET /repos/:o/:r/pulls/:n
    else user has githubLogin
      K->>GH: GET issue timeline; match author
      K->>GH: GET pull details
    else no GitHub login
      K->>K: skip auto-PR attribution
    end
    K->>DB: update Selection status/prUrl/lastSyncedAt
    alt status changed
      K->>DB: ProgressEvent with dedupeKey
      K->>N: PR_ACTIVITY notification (deduped)
      alt PR_OPEN or merged
        K->>Q: gamification.evaluate
      end
    end
  end
  K->>DB: SyncState lastRunAt / errors

  C->>Q: add admin.aggregate (every 5 min)
  Q->>K: consume → AdminSnapshot + Redis cache (300 s)
```

A repeated GitHub event cannot create a second history row or notification.
A closed unmerged PR moves back to In Progress with a note. The UI can enqueue
the same job with `POST /progress/sync`, but the worker still performs it. See
FR-8 and NFR-5.1.
