# Sprint 5 — Community, Polish and Release

> Sprint files: [API](01-api.md) · [Testing](02-testing.md) · [Review](03-review.md)


| | |
|---|---|
| Duration | 2 weeks |
| Capacity | 50 points |
| Planned | 40 points |
| Goal | A public community layer, static learning resources, and a hardened release |
| Depends on | [Sprint 4 — Sync, Notifications, Gamification and Admin](../sprint4/00-sprint.md) |
| Requirements | FR-12, FR-15, FR-17, FR-18, FR-20 (partial) |

## 1. Description

This sprint completes the product with the community layer: opt-in public contribution profiles, mentor/contributor search by organization or repository, and outreach with accept/decline/block and messaging. It also ships the static Git/GitHub/PR learning content and the Admin view of settings versus usage.

The last part of the sprint is release hardening: full regression, security and privacy review, accessibility, performance checks, deployment checklist, monitoring and rollback.

## 2. Scope

| FR | Story | ID | Points |
|---|---|---|---|
| FR-15 | Publish a public profile | US-15.1 | 5 |
| FR-15 | Control visibility | US-15.2 | 3 |
| FR-15 | Opt in as mentor | US-15.3 | 1 |
| FR-17 | Search contributors | US-17.1 | 5 |
| FR-17 | Ranked list with activity | US-17.2 | 5 |
| FR-17 | Open a contributor profile | US-17.3 | 1 |
| FR-18 | Send a request | US-18.1 | 5 |
| FR-18 | Respond to a request | US-18.2 | 3 |
| FR-18 | Message and view requests | US-18.3 | 5 |
| FR-20 | View settings against usage | US-20.2 | 2 |
| FR-12 | Git, GitHub and PR guides | US-12.1 | 2 |
| FR-12 | Etiquette and search | US-12.2 | 3 |
| **Total** | | | **40** |

### Not in this sprint

- New product features outside the requirements.
- Major refactors that would risk the release; record them as post-release debt.

## 3. User stories and acceptance criteria

### FR-15 Manage Public Contribution Profile

**US-15.1 · Publish a public profile — 5 points**

_As a developer, I need a shareable public contribution profile, so that I can show my work to others._

- [ ] Given I publish my profile, when it is created, then it is generated from my platform and GitHub activity with a unique link.
- [ ] Given my profile is public, when I press copy link, then the link is copied.

**US-15.2 · Control visibility — 3 points**

_As a developer, I need to choose which parts show and set the profile public or private, so that I control my privacy._

- [ ] Given I select parts (skills, merged contributions, badges, streaks), when others view my profile, then only those parts show.
- [ ] Given I set it to private, when someone opens the link, then the profile is hidden.

**US-15.3 · Opt in as mentor — 1 point**

_As a developer, I need to opt in or out of being discoverable as a mentor, so that I decide if others can find me._

- [ ] Given I opt in, when someone searches contributors, then I can be listed.
- [ ] Given I opt out, when someone searches, then I am not listed.

### FR-17 Manage Mentor & Contributor Search

**US-17.1 · Search contributors — 5 points**

_As a developer or maintainer, I need to search contributors by organization or repository and filter by language or topic, so that I can find people to learn from or recruit._

- [ ] Given I enter an organization or repository, when I search, then contributor data is retrieved from public GitHub data.
- [ ] Given I add a language or topic filter, when I search, then the results are narrowed.

**US-17.2 · Ranked list with activity — 5 points**

_As a developer or maintainer, I need a ranked list of active contributors with their activity and expertise, so that I choose the right person._

- [ ] Given search results exist, when they are shown, then contributors are ranked by activity.
- [ ] Given I view a contributor, when I open them, then I see merged Pull Requests, commits, reviews and areas of expertise.

**US-17.3 · Open a contributor profile — 1 point**

_As a developer or maintainer, I need to open a contributor's GitHub or platform profile, so that I learn more about them._

- [ ] Given a contributor has a public platform profile, when I open it, then I reach that profile.
- [ ] Given they do not, when I open the profile, then I am taken to their GitHub profile.

### FR-18 Manage Contributor Outreach

**US-18.1 · Send a request — 5 points**

_As a developer or maintainer, I need to send a mentorship or recruitment request with a message, so that I can start a conversation._

- [ ] Given the contributor opted in, when I send a request, then it is delivered through a notification.
- [ ] Given the contributor did not opt in, when I try to contact them, then I see their GitHub link instead.
- [ ] Given I exceeded the sending limit, when I send another request, then it is blocked with a message.

**US-18.2 · Respond to a request — 3 points**

_As a user who receives a request, I need to accept, decline or block it, so that I control who contacts me._

- [ ] Given I received a request, when I accept or decline, then its status is recorded.
- [ ] Given I block a sender, when they try to contact me again, then it is prevented.

**US-18.3 · Message and view requests — 5 points**

_As a user, I need to view my sent and received requests and message accepted contacts, so that I can continue the conversation._

- [ ] Given I open my requests, when the page loads, then I see sent and received requests with their statuses.
- [ ] Given a request was accepted, when we exchange messages, then the conversation is stored.

### FR-20 Manage AI Settings (partial)

**US-20.2 · View settings against usage — 2 points**

_As an Admin, I need to see the current settings and AI usage against the limit, so that I know how close we are._

- [ ] Given I open AI settings, when the page loads, then I see current values and usage against the limit.

### FR-12 Manage Learning Resources

**US-12.1 · Git, GitHub and PR guides — 2 points**

_As a developer, I need guides on Git, branches, Pull Requests and testing, so that I can submit a proper contribution._

- [ ] Given I open the learning section, when it loads, then I see guides for branches, creating a Pull Request and its description, and running tests.

**US-12.2 · Etiquette and search — 3 points**

_As a developer, I need open-source etiquette guidelines and a way to search resources by topic, so that I find help quickly._

- [ ] Given I open the guidelines, when the page loads, then I see general contribution guidelines and etiquette.
- [ ] Given I search a topic, when I submit, then matching resources are shown.
- [ ] Given nothing matches, when I search, then I see a "no results" message.

## 4. Technical work

### Data model

- `public_profiles` (unique handle/link, published flag, visibility settings, badge selection reference).
- `mentor_opt_in` and discoverability flag on the profile.
- `outreach_requests` (sender, recipient, type, message, status, timestamps) and `blocked_users`.
- `conversations` and `conversation_messages` for accepted requests.
- `learning_resources` (title, topic, type, URL/content) with a search index.
- Read-model/aggregate for profile statistics from selections, merges, badges and streaks.

### API and integrations

Endpoints and manual checks live in [`01-api.md`](01-api.md).

- Endpoints for public profile publish/update/visibility, contributor search, contributor detail, outreach send/respond, request list, messages, learning resource search and AI settings usage; document in `../API.md`.
- Public profile route must work without authentication and must never expose hidden sections.
- Contributor search uses public GitHub data (org/repo contributors, merged PRs, commits, reviews); cache results and respect rate limits.
- Ranking by activity and expertise, with language/topic filters.
- Outreach: check recipient opt-in, sender rate limit, block list; notify through the Sprint 4 pipeline; store conversation only after acceptance.
- Resource search: simple full-text/topic matching, no results state.
- Privacy: public profile and mentor listing are opt-in by default (NFR-6.1); recipients can decline or block (NFR-6.2).

### UI screens

- Public profile page with visibility-aware sections and copy-link action.
- Profile privacy settings and mentor opt-in.
- Contributor search with org/repo input, language/topic filters and ranked list.
- Contributor detail with activity, expertise and profile link.
- Outreach composer with rate-limit and opt-in states.
- Requests inbox/sent list and conversation view.
- Learning resources hub with topic search.
- Admin AI settings page with current usage versus limit.
- Final polish: empty states, error states, loading states, mobile layout, accessibility.

## 5. Release checklist

### Before deploy

- [ ] All sprint acceptance criteria and tests pass.
- [ ] No open critical/high bug.
- [ ] Database migrations tested on a copy of production data.
- [ ] Backup taken and restore verified.
- [ ] Environment variables and secrets set for production.
- [ ] GitHub OAuth callback and email sender verified for the production domain.
- [ ] HTTPS enforced; security headers configured.
- [ ] Rate limits enabled for auth, AI and outreach.
- [ ] Monitoring, error tracking and alerts enabled for API, jobs and AI usage.
- [ ] Rollback plan documented and tested.
- [ ] Demo data/seed script ready for the presentation.

### After deploy

- [ ] Health check and smoke flow pass.
- [ ] Sync and notification jobs run on schedule.
- [ ] AI usage and cost within the Admin limit.
- [ ] Error rate and latency monitored for 24 hours.
- [ ] Release notes and updated docs published.

## 6. Definition of Done

- All acceptance criteria above pass.
- Full regression, security, privacy, accessibility and performance checks pass.
- Public profile and outreach respect opt-in and block rules.
- Release checklist complete and the product is deployed.
- All 20 FRs and 219 story points are delivered or explicitly deferred with a reason.
- Final demo completed and accepted.
