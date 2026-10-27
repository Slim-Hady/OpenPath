# FR-13 — Notifications and preferences

> Story: US-13.1, US-13.2, US-13.3 · Sprint: 4 · Slice: 5 · Status: shipped
> Last updated: 2026-10-27

## 1. What it does (user view)

In-app notifications for matches, PR activity, saved-issue changes, badges and outreach, with read state, channel/frequency preferences and per-type switches.

## 2. Why it exists (FR + acceptance criteria)

FR-13.1–13.10. Acceptance: events create notifications; preferences suppress types; read state persists; email is delivered per frequency.

## 3. Where it lives

`app/(app)/notifications/page.tsx`, `components/notification-preferences.tsx`, `apps/api/src/modules/notifications/*`, `apps/api/src/jobs/sync.service.ts`

## 4. How it works

1. A producer calls `NotificationsService.create` with a dedupe key.
2. Preferences are checked; a disabled type returns null.
3. The row is inserted once (unique userId+dedupeKey).
4. Email channel: instant enqueues `notifications.deliver`; daily/weekly is collected by the 08:00 digest job.
5. The UI lists rows, marks one/all read; every toggle saves immediately.

## 5. Sequence diagram

Canonical sequence: [notification delivery](../engineering/diagrams/sequences/07-notifications.md).
The diagram is the source of truth for this flow and maps to the files above.

## 6. Data

`Notification` unique `(userId, dedupeKey)`, `NotificationPreference` channels/frequency/eventTypes.

## 7. Contract

`GET /notifications`, `PATCH /notifications/:id/read`, `POST /notifications/read-all`, `GET/PUT /notifications/preferences`. Errors: 401, 404 not owner.

## 8. External calls, quota and fallback

Resend email best-effort; in-app is the source of truth. Failed email never fails the event.

## 9. Authorization and failure modes

Every read/update filters by the owner; the integration test asserts another user's notification is 404.

## 10. Decisions and rejected alternatives

Store every event in-app first; email is a delivery channel, not the record. Rejected: email-only notifications.

## 11. Tests and evidence

Integration ownership test; unit tests prove INSTANT queues email while DAILY/WEEKLY do not, and a disabled type is suppressed. Live browser path in compose.

Evidence lives under `dev/evidence/slice-5/`. The PR body records the
exact commands and result.

## 12. Manual demo

Select an issue → notification appears → mark read → reload; enable email, earn a badge, check the inbox.

## 13. Known limits and what would break it

Supabase free SMTP/resend test sender is best-effort. Digest delivery is daily at 08:00 UTC.

## 14. Changelog

- 2026-10-27 — implemented and documented in the vertical build.
