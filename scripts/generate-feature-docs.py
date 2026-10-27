#!/usr/bin/env python3
"""Generate the 20 FR feature documents from one consistent source."""
from pathlib import Path
from textwrap import dedent

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "features"
OUT.mkdir(parents=True, exist_ok=True)
DATE = "2026-10-27"

FEATURES = [
    {
        "n": 1, "slug": "authentication", "title": "Authentication and session",
        "story": "US-1.1, US-1.2, US-1.3, US-1.4, US-1.5", "sprint": 1, "slice": 2,
        "what": "A person signs up or signs in with email/password or GitHub, resets a password, connects or disconnects GitHub, and signs out. Every later screen is gated by a session and a role.",
        "why": "FR-1.1–1.11. Acceptance: valid credentials create a session; duplicate email and wrong password show an inline error; a reset link is sent; GitHub connect stores an encrypted token; a Developer cannot open an Admin page.",
        "files": "`apps/web/components/auth-form.tsx`, `app/(auth routes)`, `app/auth/callback/route.ts`, `middleware.ts`, `apps/api/src/auth/*`, `apps/api/src/modules/profile/profile.controller.ts`, `packages/contracts/src/account.ts`",
        "life": "1. The browser calls Supabase Auth directly with the anon key.\n2. Supabase sets the session cookie; `middleware.ts` refreshes it and redirects protected routes.\n3. The BFF proxy reads the session and attaches `Authorization: Bearer <access token>`.\n4. Nest verifies the JWT against Supabase JWKS; `users.role` is loaded from Postgres.\n5. The GitHub callback exchanges the code, reads `provider_token` once and posts it to `/github/connect`; the API encrypts it with AES-256-GCM.",
        "data": "`User` (authId unique, email unique, role, githubLogin, githubTokenEnc, lastSeenAt) and `PublicProfile`. Sessions live in Supabase; the app never stores a password. Indexes: `User.authId`, `User.email`, `User.role`.",
        "contract": "`GET /me`, `PATCH /me`, `GET /github/status`, `POST /github/connect`, `DELETE /github`. Public sign-up/login/reset are Supabase endpoints, not API routes. Errors: 400 validation, 401 missing/expired token, 403 wrong role, 409 duplicate username.",
        "external": "Supabase Auth (free MAU), GitHub OAuth. No token refresh: a revoked provider token returns `GITHUB_TOKEN_UNREADABLE` and the user reconnects.",
        "auth": "`JwtAuthGuard` is global; `@Public()` only on health, learning and public profiles. Roles come from the database, never a client claim. Ownership is re-checked in profile services. Linking an existing account by email requires `email_verified === true`.",
        "decisions": "ADR 0001 (Nest + Next), ADR 0002 (Supabase-managed GitHub OAuth). Rejected: storing the GitHub client secret in the API, and issuing our own passwords.",
        "tests": "`docs/Sprints/sprint1/02-testing.md` M1.1–M1.8. Integration: missing token 401, Developer on Admin 403, contract parse on `/me`; unit test requires a verified email before linking an existing account. GitHub OAuth and reset email delivery are provider-blocked manual checks.",
        "demo": "Open `/login`, sign in as `dev@osh.dev`, confirm `/discover`. Open `/admin` in the same session and confirm the denial.",
        "limits": "Email reset delivery depends on Supabase SMTP; the free project's built-in SMTP is best-effort. GitHub sign-in needs the provider enabled by the project owner.",
    },
    {
        "n": 2, "slug": "developer-information", "title": "Developer information",
        "story": "US-2.1, US-2.2, US-2.3", "sprint": 1, "slice": 2,
        "what": "The developer records an experience level, languages, skills and a short description. Recommendations are blocked until the required fields exist.",
        "why": "FR-2.1–2.9. Acceptance: values persist on reload; at least one language and one level are required; changing the profile changes the next recommendation.",
        "files": "`app/onboarding/page.tsx`, `app/(app)/settings/profile/page.tsx`, `components/tag-input.tsx`, `apps/api/src/modules/profile/profile.service.ts`, `packages/contracts/src/account.ts`",
        "life": "1. The onboarding page loads `GET /profile`.\n2. Step 1 validates level + at least one language, then `PUT /profile`.\n3. The service upserts `DeveloperProfile`, replaces `UserSkill`/`UserLanguage` rows in one transaction.\n4. `completeness` is computed (level 40, languages 30, skills 20, description 10).\n5. Matching calls `requireComplete` before any GitHub or AI work.",
        "data": "`DeveloperProfile`, `Skill`, `UserSkill`, `Language`, `UserLanguage`. Join rows cascade with the user. Completeness is derived, never stored.",
        "contract": "`GET /profile`, `PUT /profile` (Developer), `POST /profile/complete-check`. Errors: 400 invalid level/language count, 409 `PROFILE_INCOMPLETE` on recommendations.",
        "external": "None.",
        "auth": "Every query is scoped to `CurrentUser.id`; there is no route that accepts another user's id.",
        "decisions": "Normalised skills/languages so Admin aggregates and community filters can use them. Rejected: a JSON blob on the user.",
        "tests": "Contract tests cap languages at 8; integration asserts completeness and rejects `EXPERT` with 400.",
        "demo": "Settings → Profile, remove all languages, save, then open Discover and confirm the profile gate.",
        "limits": "Skill names are free text normalised to title case; no taxonomy service.",
    },
    {
        "n": 3, "slug": "cv-extraction", "title": "CV extraction",
        "story": "US-3.1, US-3.2, US-3.3", "sprint": 1, "slice": 2,
        "what": "A developer uploads a PDF or DOCX (≤5 MB), sees processing status, then reviews extracted skills, technologies and level and applies them to the profile.",
        "why": "FR-3.1–3.11. Acceptance: unsupported type/size is rejected; text is extracted; status reaches completed; corrections persist; a new upload replaces the previous extraction.",
        "files": "`components/cv-upload.tsx`, `apps/api/src/modules/cv/*`, `apps/api/src/infra/storage.service.ts`, `apps/api/src/jobs/worker-runner.ts`, `packages/contracts/src/account.ts`",
        "life": "1. The web posts multipart to the BFF; the API validates extension, MIME and magic bytes.\n2. The file is stored in the private `cvs` Supabase bucket and a `CvFile` row is created.\n3. The API enqueues `cv.extract` with key `cv:<fileId>`.\n4. The worker downloads the file, extracts text (`unpdf`/`mammoth`), calls Gemini with a JSON schema, and falls back to rules if AI is unavailable.\n5. The row becomes COMPLETED/FAILED; the UI polls `GET /cv` and offers Apply to profile.",
        "data": "`CvFile` (storagePath, mime, size, status, extracted JSON, rawText, error). Owner-scoped; previous rows and objects are removed after a successful new upload.",
        "contract": "`POST /cv` multipart `file`, `GET /cv`, `POST /cv/:id/retry`. Errors: 400 type/empty, 413 size, 503 queue/storage, 404 not owner.",
        "external": "Supabase Storage (private bucket), Gemini `CV_EXTRACTION`, local PDF parser. Queue retries 3 with exponential backoff. AI usage is metered before the provider call.",
        "auth": "`CvService` uses `userId` from the token and filters every query by it. Storage paths start with the user id.",
        "decisions": "ADR 0004: in-process parsing (`unpdf` + Gemini structured extraction), not a third-party CV service. Rejected: a paid parser and sending raw files to a browser-side model.",
        "tests": "Guardrail unit tests; the live pipeline was run with `apps/api/test-fixtures/cv.pdf` → COMPLETED in ~3 s with 7 skills. The file-size guard is unit-tested; the status transition is enforced by the service and observed in the live run.",
        "demo": "Settings → Profile → drop `cv.pdf`; watch the status; press Apply to profile; save and reload.",
        "limits": "Scanned PDFs without a text layer cannot be read; the UI says so. DOCX is supported; images are not. Gemini free-tier 503 falls back to rules and labels the source.",
    },
    {
        "n": 4, "slug": "issue-discovery", "title": "Issue discovery",
        "story": "US-4.1, US-4.2, US-4.3, US-4.4", "sprint": 2, "slice": 3,
        "what": "A developer searches open GitHub issues by language, label, activity and organization/repository. Closed, assigned, inactive, selected and ignored issues are removed.",
        "why": "FR-4.1–4.10. Acceptance: results respect the filters; excluded issues never appear; empty results offer broader filters; the pool is passed to matching.",
        "files": "`app/(app)/discover/page.tsx`, `apps/api/src/modules/discovery/discovery.service.ts`, `apps/api/src/modules/github/github.service.ts`, `packages/contracts/src/discovery.ts`",
        "life": "1. The UI sends `GET /discovery/issues` with filters.\n2. The API builds a GitHub search query (`is:issue is:open no:assignee ...`).\n3. A shared Redis pool is keyed by query+page with a 15-minute TTL and a 24-hour stale copy.\n4. Each item is upserted into `GithubIssue`; the user's selected/ignored ids are removed.\n5. Rate limits return cached results with `stale=true` and a reset time.",
        "data": "`GithubIssue` (id `owner/repo#number`, labels, language, level, activityAt, stars), `IgnoredIssue`, `Selection`. Indexes on language/state/activity, repository and organization.",
        "contract": "`GET /discovery/issues` (Developer). Errors: 400 invalid filter, 429 `GITHUB_RATE_LIMITED`, 503 `GITHUB_UNAVAILABLE`.",
        "external": "GitHub Search API (~30 req/min authenticated; lower unauthenticated). Cache is shared across users; no search per user per keystroke. Fallback: stale cache, then an honest rate-limit message.",
        "auth": "Role gate Developer; exclusions are per user. The candidate pool is shared but never leaks another user's selections.",
        "decisions": "Shared candidate pool instead of per-user search; unauthenticated public search is allowed when GitHub is not connected.",
        "tests": "Live API search returned open TypeScript candidates; contract rejects `repo=not-a-repo`; the browser rendered three ranked cards.",
        "demo": "Discover → language TypeScript → label good first issue → activity 180 days → Find issues.",
        "limits": "GitHub search quality and quota are external. Archived repositories are excluded in the query; private repositories require a connected token with access.",
    },
    {
        "n": 5, "slug": "issue-matching", "title": "Issue matching and reasons",
        "story": "US-5.1, US-5.2, US-5.3", "sprint": 2, "slice": 3,
        "what": "The candidate pool is ranked against the profile and the developer gets exactly three issues, each with a short reason they can inspect, save or ignore.",
        "why": "FR-5.1–5.11. Acceptance: three highest-ranked unique issues; repository details and reason; regenerate returns a different set; suggestions and regenerations are recorded for Admin.",
        "files": "`apps/api/src/modules/discovery/discovery.service.ts`, `apps/api/src/modules/ai/prompts.ts`, `apps/api/src/modules/ai/gemini.service.ts`, `components/recommendation-card.tsx`",
        "life": "1. `GET /profile` completeness is enforced.\n2. The pool is capped at 20 candidates; the previous batch is excluded on regenerate.\n3. `ai_settings` are read; a per-user token and global cost check runs before the provider call.\n4. Gemini returns JSON `{ranking:[{issueId,rank,reason}]}`; ids are validated against the pool and exactly three unique rows are kept.\n5. Rows are written to `Recommendation` and `SuggestionEvent`; a timeout or invalid JSON returns a deterministic ranked set labelled `Ranked by rules`.",
        "data": "`Recommendation` (batchId, rank, reason, fallback), `SuggestionEvent` (SUGGESTED/REGENERATED), `AiUsage`. Unique `(batchId, issueId)`.",
        "contract": "`POST /discovery/recommendations`, `POST /discovery/recommendations/regenerate`, `GET /discovery/recommendations/latest`. Errors: 409 `PROFILE_INCOMPLETE`/`NOT_ENOUGH_CANDIDATES`, 429 AI limits, 503 provider.",
        "external": "Gemini `ISSUE_MATCHING`; GitHub pool. Fast first choice `gemini-2.5-flash-lite`; bounded fallback chain; usage recorded after the call and returned before the response.",
        "auth": "Developer role; reasons and batches are user-scoped. Regenerate only reads the caller's latest batch.",
        "decisions": "AI ranks, deterministic rules guarantee three results. Rejected: AI-only path (violates 'no request depends on AI') and arbitrary pagination.",
        "tests": "Live: three AI reasons in 2.7 s. Forced provider failure: three rules-ranked issues with `fallback=true`. Admin page shows suggested/regenerated counts.",
        "demo": "Find issues → read three reasons → Regenerate → confirm the set changed; open Network and see a new batch id.",
        "limits": "A very small pool (<3) returns a clear 409 instead of padding with invented issues. Reason quality depends on the model.",
    },
    {
        "n": 6, "slug": "issue-selection", "title": "Issue selection and ignore",
        "story": "US-6.1, US-6.2, US-6.3, US-6.4", "sprint": 2, "slice": 3,
        "what": "The developer views the full issue, confirms one as active, and can ignore issues so they never return. A saved issue can be selected later.",
        "why": "FR-6.1–6.10. Acceptance: selection only after confirmation; one active issue; status In Progress; ignored issues never recommended; selecting from Saved works.",
        "files": "`components/issue-detail.tsx`, `app/(app)/saved/page.tsx`, `apps/api/src/modules/selection/*`, `apps/api/src/modules/saved/*`, `packages/contracts/src/discovery.ts`",
        "life": "1. The detail dialog posts `{issueId, confirmed:true}`.\n2. The service verifies the issue exists and is open, then rejects an existing selection or another active issue.\n3. In one transaction it removes the ignore row, creates `Selection` and the first `ProgressEvent`.\n4. A system notification is created with a dedupe key.\n5. Ignore upserts `IgnoredIssue`; selection queries exclude those ids.",
        "data": "`Selection` unique `(userId, issueId)`, `ProgressEvent`, `IgnoredIssue` unique `(userId, issueId)`.",
        "contract": "`POST /selection`, `GET /selection/active`, `POST /discovery/ignore`, `POST /saved/items/:id/select`. Errors: 400 confirmation missing, 404 issue, 409 closed/already selected/active issue exists.",
        "external": "None in the request.",
        "auth": "All reads and writes filter by `CurrentUser.id`; the integration test proves another user's history is 404.",
        "decisions": "One active issue at a time keeps the guide and progress unambiguous. Rejected: unlimited concurrent selections.",
        "tests": "Integration: select creates exactly one IN_PROGRESS event; duplicate returns 409; another user's history returns 404.",
        "demo": "Open an issue → Work on this issue → Start working → Progress shows In Progress.",
            "limits": "Paused selections do not block a new selection. A closed issue cannot be selected.",
    },
    {
        "n": 7, "slug": "saved-items", "title": "Saved items and lists",
        "story": "US-7.1, US-7.2", "sprint": 2, "slice": 3,
        "what": "Developers bookmark issues and repositories into named lists, move or remove them, and see whether a saved issue is still open, closed or taken.",
        "why": "FR-7.1–7.8. Acceptance: ownership is enforced; state is shown; a closed/taken saved issue is flagged and notified.",
        "files": "`app/(app)/saved/page.tsx`, `apps/api/src/modules/saved/*`, `apps/api/src/jobs/sync.service.ts`",
        "life": "1. Saving without a list creates/uses `Later`.\n2. The item stores an issue id or a repository name.\n3. The saved-state job checks GitHub every 15 minutes, updates `state` and sends one deduped notification per state change.\n4. The UI shows Open/Closed/Taken and only offers Select when the issue is open.",
        "data": "`SavedList` unique `(userId, name)`, `SavedItem` unique `(listId, issueId)`, state enum.",
        "contract": "`GET/POST /saved/lists`, `PATCH/DELETE /saved/lists/:id`, `GET /saved/lists/:id`, `POST /saved/items`, `PATCH/DELETE /saved/items/:id`, `POST /saved/items/:id/select`. Errors: 403 owner, 404 missing, 409 repository-only item.",
        "external": "GitHub issue state in the scheduled job; cached.",
        "auth": "Every list/item query filters by the owner; a move re-checks the target list owner.",
        "decisions": "A default `Later` list removes a blocking dialog. Rejected: a single unorganised bookmark table.",
        "tests": "Integration covers ownership on a saved item via the notification test pattern; the UI path was exercised live.",
        "demo": "Save an issue from Discover → Saved shows it → save the same item twice → no duplicate.",
        "limits": "Repository-only bookmarks cannot be selected; state is refreshed on the 15-minute job, not instantly.",
    },
    {
        "n": 8, "slug": "progress", "title": "Progress, PR link and sync",
        "story": "US-8.1, US-8.2, US-8.3", "sprint": 3, "slice": 4,
        "what": "A dashboard shows selected issues in In Progress, PR Open and Merged, with counts, elapsed time, a manual update dialog and an attached PR link. A scheduled job syncs from GitHub.",
        "why": "FR-8.1–8.10. Acceptance: status changes within 5 minutes of a PR/merge; history is dated; counts and time since selection are correct; Admin and gamification receive the data.",
        "files": "`app/(app)/progress/page.tsx`, `components/issue-detail.tsx` (Progress tab), `apps/api/src/modules/selection/*`, `apps/api/src/jobs/sync.service.ts`, `apps/api/src/jobs/scheduler.service.ts`",
        "life": "1. The UI reads `GET /progress`.\n2. Manual update posts a status and optional GitHub PR URL; the service rejects backward moves from Merged.\n3. Every change writes a `ProgressEvent` with source manual/sync.\n4. The API cron enqueues `github.sync.progress` every 5 minutes; the worker checks the attached PR or the user's linked PR, updates status and writes a deduped event.\n5. Merged enqueues gamification and a notification.",
        "data": "`Selection.status/prUrl/lastSyncedAt`, `ProgressEvent` with `dedupeKey` unique, `SyncState`.",
        "contract": "`GET /progress`, `POST /progress/sync`, `GET /progress/:id/history`, `PATCH /progress/:id`. Errors: 400 invalid status/PR URL, 403 not owner (404), 409 merged cannot move back.",
        "external": "GitHub API. Auto-PR detection requires `githubLogin`; without it the app never attributes a stranger's PR. Cache/ETag on repo metadata; retries 3.",
        "auth": "History is owner-only; the integration test asserts another user's selection returns 404.",
        "decisions": "No drag-and-drop; GitHub is the source of truth. Polling is the fallback, webhooks are not required.",
        "tests": "Integration asserts history ownership; live manual update path works. The false PR attribution bug was fixed and logged.",
        "demo": "Select an issue → Progress → Update status to PR Open and paste a PR URL → reload; then run `Sync now`.",
        "limits": "A free GitHub account with no connected login cannot auto-sync; the demo uses the manual path. Closed unmerged PRs move back to In Progress with a note.",
    },
    {
        "n": 9, "slug": "repository-onboarding", "title": "Repository onboarding",
        "story": "US-9.1, US-9.2, US-9.3", "sprint": 3, "slice": 4,
        "what": "After selection, the developer sees the repository purpose, structure, technologies, files to read first, setup/run/test commands and branch/PR guidance. Guidance is reused for the same repo/commit.",
        "why": "FR-9.1–9.9. Acceptance: overview and setup exist; CONTRIBUTING is shown when present; PR guidance matches it; another user on the same repo reuses the stored content.",
        "files": "`components/issue-detail.tsx` (Overview), `apps/api/src/modules/onboarding/onboarding.service.ts`, `apps/api/src/modules/github/github.service.ts`",
        "life": "1. `GET /onboarding/repository/:issueId` verifies the caller selected the issue.\n2. Repo context (README, CONTRIBUTING, tree, languages) is cached in Redis under `gh:repo:<fullName>`.\n3. Stored `RepositoryOnboarding` for the same repo+commit is returned.\n4. Otherwise Gemini generates structured JSON; every text field passes the code-stripping guardrail.\n5. The row is stored with `generatedFrom` and commit sha; a provider failure falls back to README/tree rules.",
        "data": "`RepositoryOnboarding` unique `(repoFullName, commitSha)`; cached per repo version and shared across users.",
        "contract": "`GET /onboarding/repository/:issueId` (Developer, must own the selection). Errors: 404 not selected, 503 repository unavailable.",
        "external": "GitHub (README/tree/CONTRIBUTING), Gemini `ONBOARDING`, Redis cache.",
        "auth": "Selection ownership is checked before any repo read; one user's onboarding cannot expose another user's data.",
        "decisions": "Reuse by repo+commit, not per user. Rejected: regenerating for every user and storing raw repository text forever.",
        "tests": "Live run produced an overview, first files and setup guidance for a real repo; rules fallback is labelled in `generatedFrom`.",
        "demo": "Select an issue → Overview → read the repository block → change a setup row in the DB and confirm the cached copy is reused.",
        "limits": "Very large repositories are truncated to 300 tree paths. Missing README/CONTRIBUTING is handled with a fallback.",
    },
    {
        "n": 10, "slug": "issue-onboarding", "title": "Issue onboarding",
        "story": "US-10.1, US-10.2, US-10.3", "sprint": 3, "slice": 4,
        "what": "A plain-language summary of the issue and discussion, the technologies/knowledge/level required, related files and documentation links. No complete solution or implementation code.",
        "why": "FR-10.1–10.9. Acceptance: summary, requirements, related code and resources; onboarding content contains no solution.",
        "files": "`apps/api/src/modules/onboarding/onboarding.service.ts`, `apps/api/src/modules/ai/prompts.ts`, `components/issue-detail.tsx`, `components/prose.tsx`",
        "life": "1. The call verifies the issue is selected by the caller.\n2. It fetches issue comments and repo context, then reuses `IssueOnboarding` when the issue's `updated_at` did not change.\n3. Gemini returns structured JSON; every string is sanitized by the guardrail.\n4. A rules fallback builds a summary from the issue body, labels and tree.\n5. The UI renders prose (headings, lists, inline paths) without a code-block renderer.",
        "data": "`IssueOnboarding` unique `issueId`, sourceUpdatedAt, requirements JSON, relatedFiles JSON, resources JSON.",
        "contract": "`GET /onboarding/issue/:issueId` (Developer, owner). Errors: 404 not selected, 503 AI/GitHub fallback.",
        "external": "GitHub issue/comments/repo, Gemini `ONBOARDING`.",
        "auth": "Selection ownership; onboarding is generated per issue and cached, but only returned to owners.",
        "decisions": "Structured sections instead of one long answer, so the UI can show provenance and the guardrail can inspect each field.",
        "tests": "Live run produced a summary with evidence and 3 resources; the guardrail strips any code before storage.",
        "demo": "Issue → Overview → Summary, What you'll need, Where to start, Resources.",
        "limits": "Long discussions are truncated. The model may add Markdown headings; the UI renders them as prose, not raw markers.",
    },
    {
        "n": 11, "slug": "ai-guide", "title": "AI guide with guardrail",
        "story": "US-11.1, US-11.2, US-11.3, US-11.4", "sprint": 3, "slice": 4,
        "what": "A per-issue chat that explains the repo and issue, suggests investigation steps and links resources. It refuses to write the fix, implementation, patch or diff, including on rephrasing and follow-ups.",
        "why": "FR-11.1–11.10. Acceptance: context-linked chat; history restored; refusal every time; AI limits enforced and explained.",
        "files": "`components/guide-chat.tsx`, `apps/api/src/modules/guide/*`, `apps/api/src/modules/ai/guardrail.service.ts`, `guardrail.cases.ts`, `docs/Sprints/sprint3/02-testing.md`",
        "life": "1. `GET /guide/conversations/:issueId` verifies selection and creates the conversation.\n2. A message first passes the intent classifier; a solution request is refused without a provider call and stored with `REFUSED`.\n3. Otherwise `ai_settings` and the monthly token/cost limits are checked.\n4. The prompt includes issue context, cached onboarding, repo files and the last 9 messages; repository text is delimited as untrusted.\n5. The reply is post-filtered: fences, diffs and code lines are stripped; if the user asked for a solution the canonical refusal replaces the answer. The row and usage are stored; history is restored on reopen.",
        "data": "`ChatConversation` unique `(userId, issueId)`, `ChatMessage` with role, guardrailOutcome, tokens; `AiUsage`.",
        "contract": "`GET /guide/conversations/:issueId`, `POST /guide/conversations/:issueId/messages`. Errors: 403/404 not owner/selected, 429 `AI_TOKEN_LIMIT`/`AI_USAGE_LIMIT`, 503 `AI_UNAVAILABLE`.",
        "external": "Gemini `AI_GUIDE` (fast lite model, 8s budget). No AI call on a refused request. On provider failure the history is kept and the UI shows an offline card.",
        "auth": "Conversation is keyed by user+issue; a non-owner cannot read or append.",
        "decisions": "Refuse by intent before the provider call, then filter the output again. Rejected: trusting the prompt alone; a client-side filter; streaming that could bypass the filter.",
        "tests": "`pnpm --filter @osh/api test` 15/15 guardrail cases; `pnpm guardrail:eval` 15/15 refusal/strip/pass; live refusal path stored and rendered.",
        "demo": "Issue → AI guide → ask “Write the fix for this issue” → refusal card; ask “How do I investigate?” → guidance; reload → history restored.",
        "limits": "Replies are non-streaming JSON (FR-11 does not require streaming; the design's streamed caret is a known visual deferral). The model can still be slow; the client shows a thinking state and the provider has an 8s budget.",
    },
    {
        "n": 12, "slug": "learning-resources", "title": "Learning resources",
        "story": "US-12.1, US-12.2", "sprint": 5, "slice": 6,
        "what": "Public guides for Git basics, branches, pull requests, tests, reviews and etiquette, with topic search and an honest empty state.",
        "why": "FR-12.1–12.10. Acceptance: guides render; search returns matching resources; no results shows a message.",
        "files": "`app/learn/page.tsx`, `app/learn/[slug]/page.tsx`, `apps/api/src/modules/learning/*`, `apps/api/prisma/seed.ts`",
        "life": "1. `/learn` calls the public `GET /learning` with an optional query/topic.\n2. Prisma filters title/summary/body/topic with case-insensitive contains.\n3. The page renders topic chips, cards and a no-results state.\n4. `/learn/:slug` fetches one resource and renders it server-side without auth.",
        "data": "`LearningResource` seeded with six guides; index on topic.",
        "contract": "`GET /learning?q=&topic=`, `GET /learning/:slug` (public). Errors: 400 empty query, 404 unknown slug.",
        "external": "None.",
        "auth": "Public by design; no personal data in resources.",
        "decisions": "Seeded editorial content rather than AI-generated lessons, so the public page is stable and reviewable.",
        "tests": "Public endpoint smoke test; live `/learn` and an article render 200 in the compose stack.",
        "demo": "Footer → Learning → search “tests” → open “Run the right tests before you push”.",
        "limits": "Content is static and English-only; topic search is substring, not semantic.",
    },
    {
        "n": 13, "slug": "notifications", "title": "Notifications and preferences",
        "story": "US-13.1, US-13.2, US-13.3", "sprint": 4, "slice": 5,
        "what": "In-app notifications for matches, PR activity, saved-issue changes, badges and outreach, with read state, channel/frequency preferences and per-type switches.",
        "why": "FR-13.1–13.10. Acceptance: events create notifications; preferences suppress types; read state persists; email is delivered per frequency.",
        "files": "`app/(app)/notifications/page.tsx`, `components/notification-preferences.tsx`, `apps/api/src/modules/notifications/*`, `apps/api/src/jobs/sync.service.ts`",
        "life": "1. A producer calls `NotificationsService.create` with a dedupe key.\n2. Preferences are checked; a disabled type returns null.\n3. The row is inserted once (unique userId+dedupeKey).\n4. Email channel: instant enqueues `notifications.deliver`; daily/weekly is collected by the 08:00 digest job.\n5. The UI lists rows, marks one/all read; every toggle saves immediately.",
        "data": "`Notification` unique `(userId, dedupeKey)`, `NotificationPreference` channels/frequency/eventTypes.",
        "contract": "`GET /notifications`, `PATCH /notifications/:id/read`, `POST /notifications/read-all`, `GET/PUT /notifications/preferences`. Errors: 401, 404 not owner.",
        "external": "Resend email best-effort; in-app is the source of truth. Failed email never fails the event.",
        "auth": "Every read/update filters by the owner; the integration test asserts another user's notification is 404.",
        "decisions": "Store every event in-app first; email is a delivery channel, not the record. Rejected: email-only notifications.",
        "tests": "Integration ownership test; unit tests prove INSTANT queues email while DAILY/WEEKLY do not, and a disabled type is suppressed. Live browser path in compose.",
        "demo": "Select an issue → notification appears → mark read → reload; enable email, earn a badge, check the inbox.",
        "limits": "Supabase free SMTP/resend test sender is best-effort. Digest delivery is daily at 08:00 UTC.",
    },
    {
        "n": 14, "slug": "profile-and-account", "title": "Profile history, statistics and account deletion",
        "story": "US-14.1, US-14.2, US-14.3", "sprint": 1, "slice": 2,
        "what": "A developer maintains name, username, bio, avatar and password; sees issue history, chats and contribution statistics; can delete the account and its data.",
        "why": "FR-14.1–14.11. Acceptance: unique username; password updated; history is owner-only; deletion removes personal data and blocks login.",
        "files": "`app/(app)/settings/account/page.tsx`, `apps/api/src/modules/profile/profile.service.ts`, `apps/api/src/jobs/sync.service.ts` (deletion), `packages/contracts/src/community.ts`",
        "life": "1. `PATCH /me` validates the username and saves fields.\n2. Password changes use Supabase Auth.\n3. `GET /me/history` joins selections, issues and chat ids; stats are derived.\n4. `DELETE /me` creates a deletion request and enqueues `account.delete`.\n5. The worker removes CV objects, deletes the Supabase auth user and deletes the Prisma user (cascades).",
        "data": "`User`, `Selection`, `ProgressEvent`, `ChatConversation`, `DeletionRequest`. Cascades on user delete.",
        "contract": "`GET/PATCH /me`, `DELETE /me`, `GET /me/history`, `GET /me/stats`. Errors: 400 invalid username/password, 409 username taken, 401.",
        "external": "Supabase Auth admin API for deletion; Storage for CV files.",
        "auth": "History is scoped to the caller; deletion requires a fresh confirmation in the UI and the account's own token.",
        "decisions": "Delete rather than anonymise because the requirements ask for personal data removal; aggregates remain anonymous via cascaded deletion.",
        "tests": "Integration `/me` 200, invalid profile 400, owner history contract parse; the `/settings/history` screen consumes it. Deletion is exercised with a disposable test user in `docs/DEMO.md`.",
        "demo": "Settings → Account → change bio → save → reload; open History; delete a disposable test account.",
        "limits": "Deletion is asynchronous; the UI returns immediately. Supabase auth deletion failures are logged without a token and the request remains retryable.",
    },
    {
        "n": 15, "slug": "public-profile", "title": "Public contribution profile",
        "story": "US-15.1, US-15.2, US-15.3", "sprint": 5, "slice": 6,
        "what": "An opt-in public page at `/u/<handle>` with a unique link, visibility switches for skills, contributions, badges and streak, and mentor discoverability.",
        "why": "FR-15.1–15.10. Acceptance: unique shareable link; private means hidden; only chosen sections appear; mentor listing only when opted in.",
        "files": "`app/u/[handle]/page.tsx`, `app/u/[handle]/opengraph-image.tsx`, `apps/api/src/modules/public-profile/*`, `packages/contracts/src/community.ts`",
        "life": "1. `GET /public-profile/settings` creates a private profile with a derived unique handle.\n2. `PUT` saves handle/visibility/published/mentor opt-in.\n3. `GET /public/profiles/:handle` is public and only returns a published profile.\n4. Sections are omitted (not greyed) when hidden; stats are zeroed for hidden sections.\n5. The OG image is generated from the same public payload.",
        "data": "`PublicProfile` unique handle, published, mentorOptIn, four visibility flags; `Selection` merged rows; `UserBadge` publicVisible; `Streak`.",
        "contract": "`GET/PUT /public-profile/settings`, `POST /public-profile/publish`, `GET /public/profiles/:handle` (public). Errors: 404 private/unknown, 409 handle taken.",
        "external": "None at read time; optional GitHub link is public data.",
        "auth": "The public endpoint is explicitly `@Public()` and returns 404 for private; ownership re-checked on updates.",
        "decisions": "Opt-in by default, privacy by omission. Rejected: public-by-default and greyed-out hidden sections.",
        "tests": "Live `/u/sam` 200 and private-profile 404 path; OG image route builds.",
        "demo": "Achievements → Public profile → set handle, publish, enable skills → open `/u/<handle>` in a private window.",
        "limits": "Contribution stats are from this platform, not GitHub's full history. OG images use the default font (no custom font fetch).",
    },
    {
        "n": 16, "slug": "gamification", "title": "Badges and streaks",
        "story": "US-16.1, US-16.2, US-16.3", "sprint": 4, "slice": 5,
        "what": "Badges for first PR, first merge and five merged contributions; current/longest streaks; badge visibility on the public profile; notification on award.",
        "why": "FR-16.1–16.9. Acceptance: each badge awarded once; locked requirements visible; streak from activity; chosen badges show publicly.",
        "files": "`app/(app)/achievements/page.tsx`, `apps/api/src/modules/achievements/*`, `apps/api/src/jobs/worker-runner.ts`, `apps/api/prisma/seed.ts`",
        "life": "1. Seeded rules map badge codes to a metric and target.\n2. `gamification.evaluate` runs after PR_OPEN or a merge, or manually from the job.\n3. Missing badges are inserted once; a notification is created with `badge:<user>:<code>`.\n4. Streaks are calculated from distinct progress-event days.\n5. Visibility toggles update `UserBadge.publicVisible`; the public profile reads only visible rows.",
        "data": "`Badge`, `UserBadge` unique `(userId, badgeId)`, `Streak` unique userId.",
        "contract": "`GET /achievements`, `PATCH /achievements/visibility`. Errors: 404 unknown badge, 409 not earned.",
        "external": "None.",
        "auth": "Owner-scoped; the public read is gated by the profile visibility switch.",
        "decisions": "Rules in code, awards in the database. Rejected: manual badge assignment and client-side counters.",
        "tests": "Unit test proves FIRST_PR is awarded on PR_OPEN without waiting for a merge. Integration covers the badge award and notification dedupe; live achievements page in compose.",
        "demo": "Progress → mark an issue Merged → Achievements shows First merge; toggle visibility with the profile published.",
        "limits": "Streak uses platform progress events, not GitHub's contribution graph. The seeded badge set is intentionally small.",
    },
    {
        "n": 17, "slug": "contributor-search", "title": "Contributor search",
        "story": "US-17.1, US-17.2, US-17.3", "sprint": 5, "slice": 6,
        "what": "Search public contributors of an organization or repository, filter by language/topic, rank by activity, and open activity, expertise and a platform/GitHub profile.",
        "why": "FR-17.1–17.10. Acceptance: public GitHub data only; ranking; filters; platform profile when public, GitHub otherwise.",
        "files": "`app/(app)/community/page.tsx`, `app/(app)/community/[login]/page.tsx`, `apps/api/src/modules/community/*`, `apps/api/src/modules/github/github.service.ts`",
        "life": "1. The service resolves a repo or the five most recently pushed org repos.\n2. It fetches contributors, repo languages/topics and 12-week participation.\n3. Results are aggregated by login, filtered by language/topic and scored by contributions.\n4. Platform handles come from published `PublicProfile` rows; otherwise the GitHub link is shown.\n5. Details fetch merged PRs/reviews/commits and cache for 15 minutes.",
        "data": "Redis `gh:contributors:<hash>` and `gh:contributor:<login>`; `PublicProfile` for opt-in links.",
        "contract": "`GET /community/contributors?org=|repo=&language=&topic=`, `GET /community/contributors/:login` (Developer/Maintainer). Errors: 400 missing scope, 404 contributor, 429 GitHub.",
        "external": "GitHub public data. Search/contributor quotas are shared; results cached 15 minutes.",
        "auth": "Developer/Maintainer role. Only public GitHub data is read; platform profile links only when published.",
        "decisions": "Use public GitHub data instead of a scraped database. Rejected: a paid contributor index.",
        "tests": "Live search against `octocat/Hello-World` returned a ranked contributor; contract parses list and detail; rate-limit path is an honest error.",
        "demo": "Community → `vercel/next.js` → search → open a contributor → open their GitHub link.",
        "limits": "Org search samples the five most recent repos; activity is a 12-week contribution bar, not a full commit history. GitHub quotas apply.",
    },
    {
        "n": 18, "slug": "outreach", "title": "Outreach requests and conversations",
        "story": "US-18.1, US-18.2, US-18.3", "sprint": 5, "slice": 6,
        "what": "A Developer/Maintainer sends a mentorship or recruitment request to an opted-in contributor; the recipient accepts, declines or blocks; accepted requests get a stored conversation.",
        "why": "FR-18.1–18.10. Acceptance: opt-in required; notification delivered; 5/day limit; block prevents future contact; conversation stored.",
        "files": "`app/(app)/community/[login]/page.tsx`, `app/(app)/requests/page.tsx`, `apps/api/src/modules/outreach/*`",
        "life": "1. The sender submits recipient, type and a 10–500 character message.\n2. The service checks recipient opt-in, an existing block, the daily limit and duplicate pending requests.\n3. The request row is created and the recipient gets an in-app notification.\n4. Accept creates a conversation; decline stores the status; block also writes `BlockedUser`.\n5. Messages are participant-only and notify the other side with a dedupe key.",
        "data": "`OutreachRequest`, `OutreachConversation` unique requestId, `OutreachMessage`, `BlockedUser` unique blocker+blocked.",
        "contract": "`POST /outreach`, `GET /outreach`, `PATCH /outreach/:id`, `GET /outreach/:id/conversation`, `POST /outreach/:id/conversation/messages` (Developer/Maintainer). Errors: 403 not opted in/blocked, 429 daily limit, 409 not accepted, 404 participant.",
        "external": "Notification/in-app pipeline. No email-only delivery.",
        "auth": "Sender/recipient participant checks on every read/write; only the recipient can respond.",
        "decisions": "Platform requests only after opt-in; everyone else is contactable via GitHub. Rejected: open DMs and email scraping.",
        "tests": "Live seed includes `sam@osh.dev` opted in. Request/accept/message path is exercised in the demo. Block path is enforced in the service.",
        "demo": "Community → sam → Send request → sign in as sam → Requests → Accept → Open → message.",
        "limits": "No realtime push; refresh polling. Block removes the sender from lists but does not delete the prior conversation record.",
    },
    {
        "n": 19, "slug": "admin-dashboard", "title": "Admin dashboard",
        "story": "US-19.1, US-19.2", "sprint": 4, "slice": 5,
        "what": "Admins see registered and logged-in users, suggestions/regenerations, status counts, AI usage by feature for a period and a freshness chip.",
        "why": "FR-19.1–19.11. Acceptance: Admin-only; counts; AI totals; period filter; data ≤5 minutes old.",
        "files": "`app/(app)/admin/page.tsx`, `app/(app)/admin/ai/page.tsx`, `apps/api/src/modules/admin/*`, `apps/api/src/modules/ai/ai-usage.service.ts`",
        "life": "1. `GET /admin/metrics` counts users, last-seen-in-30-days, SuggestionEvents and Selection statuses.\n2. Results are cached in Redis for 300s; a stale marker is explicit.\n3. `GET /admin/ai-usage?start&end&feature` groups AiUsage by feature.\n4. `GET /admin/ai-settings/usage` returns settings plus the current month totals and percent.\n5. The UI shows cards, a stacked status bar and a period selector; freshness is never hidden.",
        "data": "`User`, `SuggestionEvent`, `Selection`, `IgnoredIssue`, `AiUsage`, `AiUsageDaily`, `AdminSnapshot` (worker aggregate).",
        "contract": "`GET /admin/metrics`, `GET /admin/users`, `GET/PUT /admin/ai-settings`, `GET /admin/ai-settings/usage`, `GET /admin/ai-usage` (Admin). Errors: 400 invalid period, 403 non-Admin.",
        "external": "None; all figures come from our database.",
        "auth": "Controller-level `@Roles('ADMIN')`; the integration test proves a Developer gets 403 and an Admin 200.",
        "decisions": "Five-minute Redis cache and a worker snapshot instead of a materialized view for the demo scale. Rejected: a paid analytics service.",
        "tests": "Integration: Developer 403, Admin 200 and `AdminMetricsSchema` parse. Live dashboard in compose.",
        "demo": "Sign in as `admin@osh.dev` → `/admin` → change the period → `/admin/ai` shows settings vs usage.",
        "limits": "Status counts are current, not historical; only suggestion/regeneration counts use the selected period. Data is cached up to 5 minutes.",
    },
    {
        "n": 20, "slug": "ai-settings", "title": "AI settings and enforcement",
        "story": "US-20.1, US-20.2, US-20.3", "sprint": 1, "slice": 2,
        "what": "The Admin edits the monthly token limit per user, model temperature and platform USD limit, and sees current usage against the limit. Every AI feature reads the latest values and blocks before the provider call.",
        "why": "FR-20.1–20.10. Acceptance: valid values stored; invalid rejected; limits apply to CV, matching, onboarding and guide from the next request; users are told when blocked.",
        "files": "`app/(app)/admin/ai/page.tsx`, `apps/api/src/modules/ai/ai-settings.service.ts`, `ai-usage.service.ts`, `apps/api/src/modules/ai/prompts.ts`, `packages/contracts/src/account.ts`",
        "life": "1. `GET /admin/ai-settings` returns the singleton or creates it from env defaults.\n2. `PUT` validates ranges (tokens 1k–2M, temperature 0–1, USD 0–10k) and stores `updatedById`.\n3. Each AI service calls `assertAllowed(userId, feature, estimate)` which sums this month's tokens and platform cost.\n4. A breach throws 429 with `AI_TOKEN_LIMIT`/`AI_USAGE_LIMIT`; no provider call happens.\n5. After a successful call, usage is recorded and the remaining tokens are returned.",
        "data": "`AiSetting` singleton `global`, `AiUsage`, `AiUsageDaily`. Admin changes are not versioned; the single row is the current policy.",
        "contract": "`GET/PUT /admin/ai-settings`, `GET /admin/ai-settings/usage`, `GET /admin/ai-usage` (Admin). Errors: 400 invalid value, 403 non-Admin, 429 limit at the feature.",
        "external": "Gemini; the limit is enforced before the fetch.",
        "auth": "Admin-only; feature services use the stored singleton, not a client-supplied value. Users can only see their own conversation usage.",
        "decisions": "Read settings on every AI request (a 1-row query) so changes apply immediately. Rejected: caching settings for an hour.",
        "tests": "Contract rejects temperature 1.4; unit test proves discovery rethrows `AI_TOKEN_LIMIT` (429) instead of falling back; live admin page and limit path.",
        "demo": "`/admin/ai` → lower the token limit → ask the guide again → limit banner; raise it and confirm recovery.",
        "limits": "The cost figure is a blended estimate, not a provider invoice. The free tier may cost $0; the limit is a safety ceiling.",
    },
]

SEQ = {
    1: ("01-auth.md", "sign-up and login"),
    2: ("03-selection-onboarding.md", "profile and onboarding"),
    3: ("05-cv-upload.md", "CV upload and extraction"),
    4: ("02-discovery-ranking.md", "discovery and ranking"),
    5: ("02-discovery-ranking.md", "ranking"),
    6: ("03-selection-onboarding.md", "selection"),
    7: ("03-selection-onboarding.md", "saved items"),
    8: ("06-progress-sync.md", "progress and sync"),
    9: ("03-selection-onboarding.md", "repository onboarding"),
    10: ("03-selection-onboarding.md", "issue onboarding"),
    11: ("04-ai-guide.md", "AI guide and guardrail"),
    12: ("09-learning.md", "learning search"),
    13: ("07-notifications.md", "notification delivery"),
    14: ("13-account-history.md", "account history and deletion"),
    15: ("10-public-profile.md", "public profile"),
    16: ("06-progress-sync.md", "badges and streaks"),
    17: ("11-contributor-search.md", "contributor search"),
    18: ("08-outreach.md", "outreach"),
    19: ("12-admin.md", "admin metrics"),
    20: ("04-ai-guide.md", "AI settings enforcement"),
}

TEMPLATE = """# FR-{n:02d} — {title}

> Story: {story} · Sprint: {sprint} · Slice: {slice} · Status: shipped
> Last updated: {date}

## 1. What it does (user view)

{what}

## 2. Why it exists (FR + acceptance criteria)

{why}

## 3. Where it lives

{files}

## 4. How it works

{life}

## 5. Sequence diagram

Canonical sequence: [{sequence_label}](../engineering/diagrams/sequences/{sequence_file}).
The diagram is the source of truth for this flow and maps to the files above.

## 6. Data

{data}

## 7. Contract

{contract}

## 8. External calls, quota and fallback

{external}

## 9. Authorization and failure modes

{auth}

## 10. Decisions and rejected alternatives

{decisions}

## 11. Tests and evidence

{tests}

Evidence lives under `dev/evidence/slice-{slice}/`. The PR body records the
exact commands and result.

## 12. Manual demo

{demo}

## 13. Known limits and what would break it

{limits}

## 14. Changelog

- 2026-10-27 — implemented and documented in the vertical build.
"""

INDEX = """# Feature index

One document per FR. Status means the code path exists and is reachable; a
known limit in the document is not hidden from the demo.

| FR | Feature | Story | Sprint | Status |
|---|---|---|---|---|
"""

for feature in FEATURES:
    short = {
        1: "Sign in or sign up",
        2: "Load/save profile",
        3: "Upload a CV",
        4: "Search GitHub issues",
        5: "Rank three issues",
        6: "Confirm or ignore an issue",
        7: "Save an issue to a list",
        8: "Update or sync progress",
        9: "Open repository onboarding",
        10: "Open issue onboarding",
        11: "Ask the guide a question",
        12: "Search learning resources",
        13: "Read notifications",
        14: "View history or delete the account",
        15: "View a public profile",
        16: "View badges and streaks",
        17: "Search contributors",
        18: "Send or answer an outreach request",
        19: "Open the admin dashboard",
        20: "Save AI settings",
    }[feature["n"]]
    body = TEMPLATE.format(n=feature["n"], title=feature["title"], story=feature["story"],
        sprint=feature["sprint"], slice=feature["slice"], status="shipped",
        what=feature["what"], why=feature["why"], files=feature["files"],
        life=feature["life"], data=feature["data"], contract=feature["contract"],
        external=feature["external"], auth=feature["auth"], decisions=feature["decisions"],
        tests=feature["tests"], demo=feature["demo"], limits=feature["limits"],
        short=short, date=DATE, sequence_file=SEQ[feature["n"]][0],
        sequence_label=SEQ[feature["n"]][1])
    name = f"FR-{feature['n']:02d}-{feature['slug']}.md"
    (OUT / name).write_text(body, encoding="utf-8")
    INDEX += f"| FR-{feature['n']} | [{feature['title']}]({name}) | {feature['story']} | {feature['sprint']} | shipped |\n"

(OUT / "README.md").write_text(INDEX, encoding="utf-8")
print(f"wrote {len(FEATURES)} feature documents")
