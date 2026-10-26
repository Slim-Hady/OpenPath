# Sprint 4 — Review and Sign-off

> Back to [sprint specification](00-sprint.md) · [API checks](01-api.md) · [testing](02-testing.md)

## 1. Acceptance review

Tick each story only after its acceptance criteria have been demonstrated.

- [ ] **US-8.3 Automatic GitHub sync** — acceptance criteria verified.
- [ ] **US-13.1 Receive notifications** — acceptance criteria verified.
- [ ] **US-13.2 Choose channels and frequency** — acceptance criteria verified.
- [ ] **US-7.2 Track saved issue state** — acceptance criteria verified.
- [ ] **US-16.1 Earn badges** — acceptance criteria verified.
- [ ] **US-16.2 View badges and streaks** — acceptance criteria verified.
- [ ] **US-16.3 Show badges on public profile** — acceptance criteria verified.
- [ ] **US-14.2 View history and statistics** — acceptance criteria verified.
- [ ] **US-14.3 Delete my account** — acceptance criteria verified.
- [ ] **US-19.1 View usage figures** — acceptance criteria verified.
- [ ] **US-19.2 View AI usage and period filter** — acceptance criteria verified.

## 2. Quality gates

- [ ] API contract in [`01-api.md`](01-api.md) is complete and every manual API check passed.
- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] Manual tests in [`02-testing.md`](02-testing.md) pass.
- [ ] Non-functional checks pass.
- [ ] Definition of Done in [`00-sprint.md`](00-sprint.md) is met.
- [ ] No blocker, critical or high bug remains.

## 3. Demo script

1. Open a PR for a selected issue and show status change to PR Open after sync.
2. Merge it and show Merged plus history.
3. Show notifications and change channel/frequency preferences.
4. Close a saved issue and show the flag and notification.
5. Earn a badge and view badges/streaks; choose badges for the public profile.
6. Show account history and statistics.
7. Open the Admin dashboard and filter AI usage by period.
8. Delete a test account and show login fails.

## 4. Risks and issues

| Risk | Mitigation |
|---|---|
| GitHub rate limits break 5-minute sync | Poll only active items, use conditional requests/ETags, back off and prioritize. |
| Duplicate notifications | Unique event keys per user/type/entity; idempotent job design. |
| Badge double-award | Unique constraint on user+badge; transaction around award and notify. |
| Deletion misses a table | Central deletion service with a table checklist and integration test. |
| Dashboard stale | Scheduled refresh + freshness timestamp; never compute on the client. |
| Email deliverability | Verified sender, retries, and in-app fallback. |

## 5. Handoff

Sprint 5 assumes:

- Badges, streaks, profiles and visibility flags exist.
- Outreach events can reuse the notification and email pipeline.
- Public profile pages can read platform and GitHub aggregates.
- Account settings and privacy primitives are in place.

## 6. Sign-off

| Role | Name | Date | Decision | Notes |
|---|---|---|---|---|
| Product owner |  |  | Accept / Reject |  |
| Tech lead |  |  | Accept / Reject |  |
| QA |  |  | Accept / Reject |  |
