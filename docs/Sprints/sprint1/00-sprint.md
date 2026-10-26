# Sprint 1 — Foundation

> Sprint files: [API](01-api.md) · [Testing](02-testing.md) · [Review](03-review.md)


| | |
|---|---|
| Duration | 2 weeks |
| Capacity | 50 points |
| Planned | 41 points |
| Goal | A user can create an account, sign in, build a profile (manually or from a CV), and an Admin can set the initial AI limits |
| Depends on | [Sprint 0 — Setup](../sprint0/00-sprint.md) |
| Requirements | FR-1, FR-2, FR-3, FR-14 (partial), FR-20 (partial), FR-13 (partial) |

## 1. Description

This sprint delivers the identity and profile layer every other feature depends on. At the end, a Developer can sign up with email or GitHub, log in and out, reset a password, connect GitHub, and complete a profile with skills, experience level and preferred languages. A CV can be uploaded, processed asynchronously and corrected. The Admin can edit AI settings, and notifications can be listed and marked read (the notification producer arrives in Sprint 4).

This is the first sprint with product testing.

## 2. Scope

| FR | Story | ID | Points |
|---|---|---|---|
| FR-1 | Sign up (email + GitHub) | US-1.1 | 5 |
| FR-1 | Log in and out | US-1.2 | 3 |
| FR-1 | Reset password | US-1.3 | 3 |
| FR-1 | Connect or disconnect GitHub | US-1.4 | 3 |
| FR-1 | Role-based access | US-1.5 | 3 |
| FR-2 | Set skills and experience | US-2.1 | 2 |
| FR-2 | Select preferred languages | US-2.2 | 2 |
| FR-2 | Required profile before recommendations | US-2.3 | 2 |
| FR-3 | Upload a CV | US-3.1 | 5 |
| FR-3 | Track extraction status | US-3.2 | 3 |
| FR-3 | Review and correct extracted skills | US-3.3 | 3 |
| FR-14 | Edit profile and password (partial) | US-14.1 | 3 |
| FR-20 | Edit AI settings (partial) | US-20.1 | 2 |
| FR-13 | View and mark notifications read (partial) | US-13.3 | 2 |
| **Total** | | | **41** |

### Not in this sprint

- Issue discovery, matching and selection (Sprint 2).
- Enforcing AI settings on AI requests (Sprint 2, US-20.3).
- Notification generation, channels and frequency (Sprint 4).
- Account history, statistics and deletion (Sprint 4).
- Public profile and mentor opt-in (Sprint 5).

## 3. User stories and acceptance criteria

### FR-1 Manage Authentication

**US-1.1 · Sign up — 5 points**

_As a new user, I need to create an account with my name, email and password or with GitHub, so that I can start using the platform._

- [ ] Given I am on the sign-up page, when I submit a valid name, email and password, then my account is created and I am logged in.
- [ ] Given I choose "Sign up with GitHub", when I authorize the OAuth request, then an account is created and linked to my GitHub account.
- [ ] Given I submit an email that is already registered or an invalid password, when I press sign up, then I see an error and no account is created.

**US-1.2 · Log in and out — 3 points**

_As a registered user, I need to log in with my email and password or GitHub and log out, so that my account stays secure._

- [ ] Given I have an account, when I enter correct credentials or use GitHub login, then a session starts and I reach my dashboard.
- [ ] Given I am logged in, when I press log out, then my session ends and protected pages are no longer accessible.
- [ ] Given I enter wrong credentials, when I try to log in, then I see an error and no session is created.

**US-1.3 · Reset password — 3 points**

_As a user who forgot my password, I need to reset it through my registered email, so that I can regain access to my account._

- [ ] Given I enter my registered email, when I request a reset, then a reset link is sent to that email.
- [ ] Given I open a valid reset link, when I set a new valid password, then my password is updated and I can log in with it.

**US-1.4 · Connect or disconnect GitHub — 3 points**

_As a developer, I need to connect or disconnect my GitHub account from my settings, so that the platform can read my repository, issue and Pull Request data._

- [ ] Given I am in account settings, when I connect GitHub and authorize, then my GitHub account is linked and the token is stored encrypted.
- [ ] Given my GitHub is connected, when I disconnect it, then the link is removed and the platform stops reading my GitHub data.

**US-1.5 · Role-based access — 3 points**

_As an Admin, I need access to be restricted by role, so that only authorized users reach protected features._

- [ ] Given I am a Developer, when I open an Admin-only page, then access is denied.
- [ ] Given I am an Admin, when I open the Admin pages, then access is granted.

### FR-2 Manage Developer Information

**US-2.1 · Set skills and experience — 2 points**

_As a developer, I need to describe my skills and interests and select my experience level, so that recommendations fit me._

- [ ] Given I am on my developer profile, when I enter my skills and choose Beginner, Intermediate or Advanced, then the information is saved.
- [ ] Given I saved my profile, when I reopen it, then I see the same values.

**US-2.2 · Select preferred languages — 2 points**

_As a developer, I need to select my preferred programming languages and technologies, so that I get Issues in the stack I like._

- [ ] Given I open the language selector, when I choose one or more items and save, then they are stored in my profile.

**US-2.3 · Required profile before recommendations — 2 points**

_As a developer, I need to update my information at any time and be prompted to complete the required fields, so that my recommendations stay accurate._

- [ ] Given I have no experience level or no language, when I request recommendations, then I am asked to complete these fields first.
- [ ] Given I update my profile, when I request new recommendations, then the updated information is used.

### FR-3 Manage CV Extraction

**US-3.1 · Upload a CV — 5 points**

_As a developer, I need to upload or replace my CV, so that the platform can read my skills._

- [ ] Given I select a CV in a supported type and size, when I upload it, then the file is accepted and its text is extracted.
- [ ] Given I select an unsupported type or oversized file, when I upload it, then I see an error and it is rejected.
- [ ] Given I already have a CV, when I upload a new one, then the previous extraction is replaced.

**US-3.2 · Track extraction status — 3 points**

_As a developer, I need to see the status of the CV extraction, so that I know when my results are ready._

- [ ] Given I uploaded a CV, when the extraction is running, then I see a "processing" status.
- [ ] Given the extraction completes, when I view the page, then the status shows "completed" with the results.

**US-3.3 · Review and correct extracted skills — 3 points**

_As a developer, I need to review and edit the extracted skills, technologies and experience level, so that my profile is accurate._

- [ ] Given extraction is complete, when I open the results, then I see the skills, technologies and level found.
- [ ] Given I add, edit or remove a skill and save, when I reopen my profile, then my corrections are stored.

### FR-14 Manage Profile (partial)

**US-14.1 · Edit profile and password — 3 points**

_As a developer, I need to update my name, username, bio, avatar and password, so that my account information is correct._

- [ ] Given I edit my profile with a unique username, when I save, then the changes are stored and displayed.
- [ ] Given I choose a username that already exists, when I save, then I see an error and nothing changes.
- [ ] Given I enter a valid new password, when I save, then the password is updated.

### FR-20 Manage AI Settings (partial)

**US-20.1 · Edit AI settings — 2 points**

_As an Admin, I need to edit the maximum tokens per user, the temperature and the usage limit, so that I keep AI usage within budget._

- [ ] Given I enter valid values, when I save, then the settings are stored.
- [ ] Given I enter an invalid value, when I save, then I see an error and nothing changes.

### FR-13 Manage Notifications (partial)

**US-13.3 · View and mark as read — 2 points**

_As a developer, I need to view my notifications and mark them read, so that I can manage them._

- [ ] Given I have notifications, when I open the list, then I see them with their read state.
- [ ] Given I mark one as read, when I reload, then it stays read.

## 4. Technical work

### Data model

- `users`, `roles`/`user_roles`, `sessions` (or token store), `oauth_accounts` with encrypted GitHub tokens.
- `password_reset_tokens` with expiry and single use.
- `developer_profiles`, `skills`, `profile_skills`, `programming_languages`, `profile_languages`.
- `cv_files` (storage reference, MIME type, size), `cv_extractions` (status, raw text, extracted JSON, error).
- `ai_settings` (max tokens per user, temperature, usage limit) and an audit entry for changes.
- `notifications` with read state and owner.

Add the tables to `../engineering/data-model.md` and migrations in this sprint.

### API and integrations

Endpoints and manual checks live in [`01-api.md`](01-api.md).

- Add endpoints for sign up, login, logout, password reset, GitHub connect/disconnect, profile, CV upload/status, AI settings and notification read state to `../API.md`.
- GitHub OAuth: state validation, callback, token encryption, disconnect.
- Email provider: reset mail with expiring link.
- CV pipeline: file validation → storage → text extraction → LLM skill extraction → status update. Use the background job runner from Sprint 0.
- LLM adapter with a mock mode for tests and local development.
- Authorization middleware for Developer, Maintainer and Admin.
- Rate limit auth and password reset endpoints.
- Never log passwords, reset tokens or GitHub tokens.

### UI screens

- Sign up, log in, forgot/reset password.
- Account settings (GitHub connection, password, profile fields, CV upload).
- Developer profile (skills, level, languages, CV results).
- Admin AI settings.
- Notification list with read/unread state.

## 5. Definition of Done

- All acceptance criteria above pass.
- Unit, integration and manual tests pass; no open critical bug.
- API endpoints documented in `../API.md`.
- Data model and migrations reviewed.
- No secret or token appears in logs or the repository.
- Demo completed and accepted by the team.
