# Data model

The ERD is in [`diagrams/04-erd.md`](diagrams/04-erd.md). `apps/api/prisma/schema.prisma`
is the source of truth. One database, one data owner: the API/worker service
(ADR 0003).

## Table ownership

| Owner module | Tables |
|---|---|
| auth/profile | `User`, `DeveloperProfile`, `Skill`, `UserSkill`, `Language`, `UserLanguage`, `DeletionRequest` |
| cv | `CvFile` |
| ai | `AiSetting`, `AiUsage`, `AiUsageDaily` |
| discovery | `GithubIssue`, `Recommendation`, `SuggestionEvent` |
| tracking | `Selection`, `ProgressEvent`, `IgnoredIssue`, `SavedList`, `SavedItem` |
| onboarding | `RepositoryOnboarding`, `IssueOnboarding` |
| guide | `ChatConversation`, `ChatMessage` |
| notifications | `Notification`, `NotificationPreference` |
| community | `PublicProfile`, `Badge`, `UserBadge`, `Streak`, `OutreachRequest`, `OutreachConversation`, `OutreachMessage`, `BlockedUser` |
| operations | `AdminSnapshot`, `JobRun`, `SyncState` |
| learning | `LearningResource` |

## Keys and invariants

- `User.authId` is unique and is the Supabase `sub`; `User.email` is unique.
- `Selection.(userId, issueId)` is unique: one selection per issue per user.
- `ProgressEvent.dedupeKey` is unique: a replayed GitHub event cannot duplicate
  history.
- `Notification.(userId, dedupeKey)` is unique: a replayed job cannot duplicate
  an inbox row.
- `UserBadge.(userId, badgeId)` is unique: a badge is awarded once.
- `Recommendation.(batchId, issueId)` is unique: one rank per issue per batch.
- `SavedList.(userId, name)` is unique; `SavedItem.(listId, issueId)` is unique.
- `PublicProfile.handle` is unique; `OutreachConversation.requestId` is unique.
- `AiSetting` has one row, id `global`.

## Indexes that matter

| Index | Why |
|---|---|
| `GithubIssue(language, state, activityAt)` | candidate pool filters |
| `GithubIssue(repoFullName)` | onboarding/context reuse |
| `Selection(status, lastSyncedAt)` | 5-minute sync scan |
| `Notification(userId, readAt, createdAt)` | inbox and unread count |
| `AiUsage(feature, createdAt)` / `(userId, createdAt)` | Admin totals and user quota |
| `OutreachRequest(recipientId, status)` | requests inbox |

## Migrations

| Migration | State | Notes |
|---|---|---|
| `20261026232106_init` | applied to local `osh` and `osh_test` | initial additive schema |

Rules: never edit an applied migration; add a new directory. Schema changes go
through Prisma. RLS policies live in `supabase/` and are applied separately;
they are the second line of defence, never the only check.

## RLS

`supabase/migrations/0001_rls.sql` enables RLS on owner-scoped tables and adds
select/update policies based on `auth.uid()`. Prisma uses the service role /
database connection and bypasses RLS, which is why every service re-checks
ownership. The policies protect any future direct Supabase client access.

## Retention

- CV files and rows: replaced on a new upload; removed on account deletion.
- Chat and selections: cascade with the user.
- `AdminSnapshot`: 30 days.
- `AiUsage`: kept for the current + previous months by the demo; aggregates are
  enough for FR-19.
- Redis caches: 5–24 hours, never personal data.
