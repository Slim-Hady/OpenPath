# FR-18 — Outreach requests and conversations

> Story: US-18.1, US-18.2, US-18.3 · Sprint: 5 · Slice: 6 · Status: shipped
> Last updated: 2026-10-27

## 1. What it does (user view)

A Developer/Maintainer sends a mentorship or recruitment request to an opted-in contributor; the recipient accepts, declines or blocks; accepted requests get a stored conversation.

## 2. Why it exists (FR + acceptance criteria)

FR-18.1–18.10. Acceptance: opt-in required; notification delivered; 5/day limit; block prevents future contact; conversation stored.

## 3. Where it lives

`app/(app)/community/[login]/page.tsx`, `app/(app)/requests/page.tsx`, `apps/api/src/modules/outreach/*`

## 4. How it works

1. The sender submits recipient, type and a 10–500 character message.
2. The service checks recipient opt-in, an existing block, the daily limit and duplicate pending requests.
3. The request row is created and the recipient gets an in-app notification.
4. Accept creates a conversation; decline stores the status; block also writes `BlockedUser`.
5. Messages are participant-only and notify the other side with a dedupe key.

## 5. Sequence diagram

Canonical sequence: [outreach](../engineering/diagrams/sequences/08-outreach.md).
The diagram is the source of truth for this flow and maps to the files above.

## 6. Data

`OutreachRequest`, `OutreachConversation` unique requestId, `OutreachMessage`, `BlockedUser` unique blocker+blocked.

## 7. Contract

`POST /outreach`, `GET /outreach`, `PATCH /outreach/:id`, `GET /outreach/:id/conversation`, `POST /outreach/:id/conversation/messages` (Developer/Maintainer). Errors: 403 not opted in/blocked, 429 daily limit, 409 not accepted, 404 participant.

## 8. External calls, quota and fallback

Notification/in-app pipeline. No email-only delivery.

## 9. Authorization and failure modes

Sender/recipient participant checks on every read/write; only the recipient can respond.

## 10. Decisions and rejected alternatives

Platform requests only after opt-in; everyone else is contactable via GitHub. Rejected: open DMs and email scraping.

## 11. Tests and evidence

Live seed includes `sam@osh.dev` opted in. Request/accept/message path is exercised in the demo. Block path is enforced in the service.

Evidence lives under `dev/evidence/slice-6/`. The PR body records the
exact commands and result.

## 12. Manual demo

Community → sam → Send request → sign in as sam → Requests → Accept → Open → message.

## 13. Known limits and what would break it

No realtime push; refresh polling. Block removes the sender from lists but does not delete the prior conversation record.

## 14. Changelog

- 2026-10-27 — implemented and documented in the vertical build.
