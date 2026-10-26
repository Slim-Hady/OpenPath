# Sprint 5 — Testing

> Back to [sprint specification](00-sprint.md) · [API checks](01-api.md) · [review](03-review.md)

## 1. Story coverage

Every user story in this sprint must have at least one manual test case and the relevant unit/integration coverage.

| Story | Manual test IDs |
|---|---|
| US-15.1 | M5.1 |
| US-15.2 | M5.2 |
| US-15.3 | M5.3 |
| US-17.1 | M5.4 |
| US-17.2 | M5.5 |
| US-17.3 | M5.6 |
| US-18.1 | M5.7, M5.8, M5.9 |
| US-18.2 | M5.10 |
| US-18.3 | M5.11 |
| US-20.2 | M5.13 |
| US-12.1 | M5.12 |
| US-12.2 | M5.12 |

## 2. Unit tests

| Area | Cases |
|---|---|
| Public profile | Unique link generation, publish/unpublish, hidden sections never serialized, private profile 404/hidden |
| Visibility | Skills/merged contributions/badges/streaks toggles, badge selection from Sprint 4 |
| Mentor opt-in | Listed only when opted in, opt-out removes from search |
| Contributor ranking | Activity score, tie-breakers, language/topic filters, empty results |
| Contributor profile link | Platform profile when public, GitHub fallback otherwise |
| Outreach send | Opt-in required, blocked sender, rate limit, self-send, duplicate request |
| Outreach respond | Accept/decline/block transitions, authorization, block prevents new requests |
| Messaging | Only accepted requests can message, participant-only access, message ordering |
| Resource search | Topic match, no results, static guide availability |
| AI settings view | Current values and usage versus limit, period totals |
| Privacy | Unauthenticated access to public profile only, no PII leakage |

## 3. Integration tests

- Mocked GitHub contributor/activity data → ranked results.
- Outreach request → notification → accept → conversation.
- Blocked user cannot send again.
- Public profile fetch with each visibility combination.
- Learning resource search index.

## 4. Manual tests

| ID | Scenario | Steps | Expected |
|---|---|---|---|
| M5.1 | Publish profile | Publish → open unique link → copy link | Profile visible and link copied |
| M5.2 | Visibility | Toggle each section; set private | Only selected sections show; private hides profile |
| M5.3 | Mentor opt-in | Opt in → search; opt out → search | Listed only when opted in |
| M5.4 | Contributor search | Search by org/repo, add language/topic filter | Public GitHub contributors returned and filtered |
| M5.5 | Ranking | Open ranked list | Ordered by activity, expertise shown |
| M5.6 | Contributor profile | Open a contributor with/without platform profile | Platform profile or GitHub fallback |
| M5.7 | Outreach send | Send to opted-in contributor | Delivered as notification |
| M5.8 | Outreach opt-out | Try to contact a non-opted-in contributor | GitHub link shown, no request sent |
| M5.9 | Rate limit | Exceed sending limit | Blocked with message |
| M5.10 | Respond | Accept, decline and block requests | Status recorded; block prevents further contact |
| M5.11 | Conversation | Message an accepted contact → reload | Conversation stored and restored |
| M5.12 | Learning guides | Open Git/PR guides, search a topic, search nonsense | Guides shown; matches returned; no-results message |
| M5.13 | AI settings usage | Open Admin AI settings | Current values and usage vs limit shown |
| M5.14 | Public privacy | Open hidden/private profile while logged out | No hidden data exposed |

## 5. Non-functional checks

## 6. Release testing

- **Full regression:** run every manual scenario from Sprints 1–5 on the release candidate.
- **Security:** role checks, IDOR on profiles/lists/requests/messages, rate limits, token storage, public/private exposure, account deletion.
- **Accessibility:** keyboard navigation, labels, focus states, colour contrast on all major screens.
- **Performance:** 95% of standard APIs under 500 ms; recommendations under 10 s; AI guide under 10 s; CV under 30 s.
- **Resilience:** GitHub/AI/email failure states show usable errors; sync and notification jobs retry.
- **Privacy:** public profiles and mentor listings default to off; block works; deletion removes personal data.
- **Release smoke:** sign up → profile → search → select → onboarding → chat → PR sync → notification → profile → outreach.

## 7. Test data and environment

- Use a dedicated test database and seeded users for each role.
- Mock GitHub, email, CV parser and LLM services; never call paid services from automated tests.
- Record the build/commit tested and the date for every manual run.
- Manual test IDs above must be ticked in the review file.

## 8. Exit criteria

- All unit and integration tests pass.
- All manual test cases above pass.
- Non-functional checks pass or have a recorded, accepted exception.
- No open critical or high bug.
