# Sprint 4 — Sync, Notifications, Gamification and Admin

> Sprint files: [API](01-api.md) · [Testing](02-testing.md) · [Review](03-review.md)


| | |
|---|---|
| Duration | 2 weeks |
| Capacity | 50 points |
| Planned | 47 points |
| Goal | Progress updates itself from GitHub, users are notified, achievements are awarded, and the Admin can monitor the platform |
| Depends on | [Sprint 3 — Onboarding and AI Guide](../sprint3/00-sprint.md) |
| Requirements | FR-7 (partial), FR-8 (partial), FR-13, FR-14 (partial), FR-16, FR-19 |

## 1. Description

This sprint adds the automation and retention layer. A scheduled job syncs selected issues and saved items with GitHub, updates progress and records history. Notifications are generated for matches, PR activity, closed saved issues, badges and outreach, with channel and frequency preferences. Badges and streaks reward progress. The Admin gets a usage dashboard with data no more than five minutes old, and users can review their history/statistics or delete their account.

## 2. Scope

| FR | Story | ID | Points |
|---|---|---|---|
| FR-8 | Automatic GitHub sync | US-8.3 | 8 |
| FR-13 | Receive notifications | US-13.1 | 5 |
| FR-13 | Choose channels and frequency | US-13.2 | 5 |
| FR-7 | Track saved issue state | US-7.2 | 5 |
| FR-16 | Earn badges | US-16.1 | 5 |
| FR-16 | View badges and streaks | US-16.2 | 3 |
| FR-16 | Show badges on public profile | US-16.3 | 2 |
| FR-14 | View history and statistics | US-14.2 | 3 |
| FR-14 | Delete my account | US-14.3 | 3 |
| FR-19 | View usage figures | US-19.1 | 3 |
| FR-19 | View AI usage and period filter | US-19.2 | 5 |
| **Total** | | | **47** |

### Not in this sprint

- FR-16.3 stores the badge selection here; public rendering is verified in Sprint 5.
- The outreach notification event type is wired here and triggered when outreach ships in Sprint 5.
- Public profile publishing and visibility controls (Sprint 5).
- Mentor/contributor search and outreach (Sprint 5).
- Notification for outreach requests until Sprint 5 (event wiring exists here).
- Email templates for outreach until Sprint 5.

## 3. User stories and acceptance criteria

### FR-8 Manage Progress (partial)

**US-8.3 · Automatic GitHub sync — 8 points**

_As a developer, I need my status to sync automatically from GitHub, so that I do not update it by hand._

- [ ] Given I open a Pull Request, when the sync runs, then the status changes to PR Open within 5 minutes.
- [ ] Given my Pull Request is merged, when the sync runs, then the status changes to Merged.
- [ ] Given a status changes, when it is saved, then it is added to a dated history and made available to the Admin Dashboard and Gamification.

### FR-13 Manage Notifications

**US-13.1 · Receive notifications — 5 points**

_As a developer, I need notifications about new matches, Pull Request activity, closed saved Issues, badges and outreach requests, so that I do not miss anything._

- [ ] Given a new matching Issue or Pull Request review, comment or merge occurs, when it is detected, then I receive a notification.
- [ ] Given a saved Issue is closed or taken, I earn a badge or I get an outreach request, when it happens, then I receive a notification.

**US-13.2 · Choose channels and frequency — 5 points**

_As a developer, I need to choose channels, frequency and which types are on, so that I only get what I want._

- [ ] Given I choose in-app or email and instant, daily or weekly, when an event occurs, then it is delivered accordingly.
- [ ] Given I turn a type off, when that event occurs, then no notification is sent.

### FR-7 Manage Saved Items (partial)

**US-7.2 · Track saved issue state — 5 points**

_As a developer, I need to see whether a saved Issue is still open, closed or taken, so that I do not waste time on unavailable Issues._

- [ ] Given I saved an Issue, when I view my list, then its current state is shown.
- [ ] Given a saved Issue is closed or taken on GitHub, when the regular check runs, then it is flagged and I am notified.

### FR-16 Manage Gamification

**US-16.1 · Earn badges — 5 points**

_As a developer, I need to earn badges for milestones, so that I stay motivated._

- [ ] Given I reach a milestone such as first Pull Request, first merge or five contributions, when progress is checked, then the badge is awarded once and stored.
- [ ] Given a badge is awarded, when it happens, then I am notified.

**US-16.2 · View badges and streaks — 3 points**

_As a developer, I need to see my badges, what is needed for the others, and my streaks, so that I know my next goal._

- [ ] Given I open my achievements, when the page loads, then I see earned badges and the requirements of unearned ones.
- [ ] Given I have contribution activity, when I view streaks, then I see my current and longest streak.

**US-16.3 · Show badges on public profile — 2 points**

_As a developer, I need to choose which badges appear on my public profile, so that I showcase what I want._

- [ ] Given I select badges, when others view my public profile, then only the chosen badges and streaks appear.

### FR-14 Manage Profile (partial)

**US-14.2 · View history and statistics — 3 points**

_As a developer, I need to view my Issue history, the AI guide chats of each Issue and my contribution statistics, so that I can review my past work._

- [ ] Given I have past Issues, when I open my history, then I see all Issues associated with my account and their chats.
- [ ] Given I open my statistics, when the page loads, then I see counts of Issues selected, merged and ignored.
- [ ] Given another user tries to open my history, when the request is made, then access is denied.

**US-14.3 · Delete my account — 3 points**

_As a developer, I need to delete my account and data, so that my personal information is removed._

- [ ] Given I request account deletion and confirm, when the request is processed, then my account and personal data are deleted.
- [ ] Given my account is deleted, when I try to log in, then login fails.

### FR-19 Manage Admin Dashboard

**US-19.1 · View usage figures — 3 points**

_As an Admin, I need a dashboard of users, suggested and regenerated Issues and Issue statuses, so that I can track platform usage._

- [ ] Given I am an Admin, when I open the dashboard, then I see logged-in and registered users, Issues suggested and regenerated, and counts per status.
- [ ] Given I am not an Admin, when I try to open it, then access is denied.

**US-19.2 · View AI usage and period filter — 5 points**

_As an Admin, I need to see AI usage for a selected period with fresh data, so that I can monitor consumption._

- [ ] Given I open AI usage, when it loads, then I see total tokens consumed across all AI features.
- [ ] Given I select a period, when I apply it, then all figures are filtered to that period.
- [ ] Given the dashboard is open, when figures are shown, then they are no more than 5 minutes old.

## 4. Technical work

### Data model

- `progress_events` extended with source (`manual`, `sync`), old/new status, PR reference and timestamp.
- `github_sync_jobs` with scope, last run, cursor/etag and errors.
- `notification_preferences` (channel, frequency, event types), `notifications` production fields and `notification_deliveries` for retry/dedupe.
- `badges`, `user_badges` (unique user+badge), `streaks` and badge visibility selection.
- `ai_usage_daily` aggregate for the Admin dashboard.
- Account deletion job/audit record and cascade rules.

### Jobs and integrations

- Scheduled sync every 5 minutes (or webhook plus fallback poll): selected issues, PR status, reviews/comments and saved issue state.
- Idempotent updates: the same GitHub event must not create duplicate history rows or notifications.
- Retry with backoff on GitHub rate limits; record last successful sync per item.
- Notification service: event → preference check → in-app/email delivery → read state; instant vs daily/weekly batching.
- Email templates for password reset, matches, PR activity, closed saved issues, badges and outreach.
- Badge rule engine: first PR, first merge, five contributions; award once; streak calculation from progress events.
- Admin aggregation job/materialized view refreshed at least every 5 minutes; AI usage grouped by feature and period.
- Account deletion: revoke sessions/tokens, delete/anonymize personal data, keep required aggregates, confirm login fails.

### API

Endpoints and manual checks live in [`01-api.md`](01-api.md).

- Endpoints for progress history/sync state, notifications and preferences, badges/streaks, account history/statistics/deletion and admin metrics; document in `../API.md`.
- Admin endpoints enforce role checks server-side.
- Period filters validated (start/end, timezone).

### UI screens

- Progress history per issue.
- Notification center, preferences and channel/frequency settings.
- Achievements page: badges, locked requirements, streaks, badge visibility.
- Account history and statistics.
- Account deletion confirmation and result.
- Admin dashboard: users, suggestions/regenerations, status counts, AI usage with period filter and freshness indicator.

## 5. Definition of Done

- All acceptance criteria above pass.
- Sync, notification and badge jobs run on schedule and are idempotent.
- Email provider delivers all notification templates in the sandbox.
- Admin dashboard respects role checks and freshness.
- Deletion cascade verified.
- API endpoints documented in `../API.md`.
- Demo completed and accepted.
