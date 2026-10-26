# Sprint 4 — Testing

> Back to [sprint specification](00-sprint.md) · [API checks](01-api.md) · [review](03-review.md)

## 1. Story coverage

Every user story in this sprint must have at least one manual test case and the relevant unit/integration coverage.

| Story | Manual test IDs |
|---|---|
| US-8.3 | M4.1, M4.2, M4.3 |
| US-13.1 | M4.4 |
| US-13.2 | M4.5 |
| US-7.2 | M4.6 |
| US-16.1 | M4.7 |
| US-16.2 | M4.8 |
| US-16.3 | M4.9 |
| US-14.2 | M4.10 |
| US-14.3 | M4.11 |
| US-19.1 | M4.12 |
| US-19.2 | M4.13 |

## 2. Unit tests

| Area | Cases |
|---|---|
| GitHub status mapping | Issue opened/closed, PR opened, review/comment, merged, reopened, cross-repo PR |
| Sync idempotency | Same event twice → one status change/history row; out-of-order events |
| Retry/backoff | Rate limit, network error, partial failure, resume from last success |
| Saved issue check | Open → closed/taken transition, flag once, notify once |
| Notification mapping | Every event type, disabled type, instant/daily/weekly, in-app/email |
| Dedupe | Same event produces one notification; retries do not resend |
| Badge rules | First PR, first merge, five contributions, award once, no duplicate notification |
| Streaks | Current/longest streak, missing days, timezone boundaries |
| Badge visibility | Selected badges only, opt-out, public profile reuse (Sprint 5) |
| Account history | Ownership, statistics counts, another user denied |
| Deletion | Cascade across profile, CV, selections, chats, notifications, tokens; login fails after |
| Admin metrics | Total users, logged-in users, suggested/regenerated counts, status counts, AI tokens by period, 5-minute freshness |

## 3. Integration tests

- Mocked GitHub poll: PR open → PR Open, merge → Merged, history recorded.
- Notification job with mocked email provider: preferences respected, batching works.
- Badge job after a merged PR: badge awarded once and notification created.
- Account deletion across all tables.
- Admin dashboard query with a fixed clock and seeded data.

## 4. Manual tests

| ID | Scenario | Steps | Expected |
|---|---|---|---|
| M4.1 | PR open sync | Open a PR for a selected issue → wait for sync | Status becomes PR Open within 5 minutes |
| M4.2 | Merge sync | Merge the PR → wait for sync | Status becomes Merged, history updated |
| M4.3 | Sync history | Open issue history | Dated changes with source |
| M4.4 | Notifications | Trigger match/PR/badge events | In-app notifications appear |
| M4.5 | Preferences | Disable a type; choose email/daily | Disabled type not sent; chosen channel/frequency used |
| M4.6 | Saved state | Close/take a saved issue → run check | Flagged and notified once |
| M4.7 | Badges | Reach first PR/merge/five contributions | Badge awarded once with notification |
| M4.8 | Streaks | View achievements after activity | Current and longest streak correct |
| M4.9 | Badge choice | Select badges for public profile | Only selected badges exposed (visible in Sprint 5) |
| M4.10 | History statistics | Open account history/statistics | Issues, chats and counts correct; other user denied |
| M4.11 | Delete account | Confirm deletion → try login | Data removed, login fails |
| M4.12 | Admin figures | Open dashboard as Admin | Users, suggestions/regenerations and status counts |
| M4.13 | AI usage filter | Select a period | Tokens filtered by period, data ≤5 min old |
| M4.14 | Admin denial | Open dashboard as Developer | Access denied |

## 5. Non-functional checks

- GitHub changes reflected within 5 minutes for 95% of changes (NFR-5.1).
- Notifications delivered within 5 minutes for 95% (NFR-5.2).
- Admin figures no more than 5 minutes old (BR-3).
- Account deletion removes personal data within 30 days (NFR-6.3); test the immediate cascade.
- Notification jobs are retry-safe and do not duplicate messages.
- Tokens and personal data never appear in logs.

## 6. Test data and environment

- Use a dedicated test database and seeded users for each role.
- Mock GitHub, email, CV parser and LLM services; never call paid services from automated tests.
- Record the build/commit tested and the date for every manual run.
- Manual test IDs above must be ticked in the review file.

## 7. Exit criteria

- All unit and integration tests pass.
- All manual test cases above pass.
- Non-functional checks pass or have a recorded, accepted exception.
- No open critical or high bug.
