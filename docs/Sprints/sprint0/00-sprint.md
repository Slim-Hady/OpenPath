# Sprint 0 — Setup and Project Foundation

> Sprint files: [Setup checklist and review](01-review.md)


| | |
|---|---|
| Type | Pre-sprint (outside the 219-point scope) |
| Duration | 3–5 working days |
| Capacity | Not story-pointed |
| Goal | A running, deployable skeleton with the stack, database, CI and design baseline ready |
| Depends on | Nothing |
| Next sprint | [Sprint 1 — Foundation](../sprint1/00-sprint.md) |

## 1. Description

This sprint turns the requirements into a working engineering environment. No product feature is delivered and **no product testing is performed**. The output is a repository that every later sprint can build on: chosen stack, application shells, database migrations, authentication wiring, CI/CD, environment handling and the first deployment.

Sprint 0 ends when a new developer can clone the repository, run it locally, and see a deployed health check without asking questions.

## 2. Decisions to confirm before coding

These decisions are missing from the requirements and must be recorded in `../engineering/architecture.md` (create it in this sprint):

- Frontend framework and language.
- Backend framework/runtime and language.
- Database and migration tool.
- Auth approach (GitHub OAuth app, email/password, session vs token).
- Hosting for frontend, backend and background jobs.
- Email provider for password reset and notifications.
- LLM provider and model for CV extraction, matching, onboarding and the AI guide.
- CV text extraction service.
- File storage for uploaded CVs.
- Secret management and environment variable policy.

If a decision cannot be made, record the assumption and the date it must be revisited.

## 3. Scope and tasks

### 3.1 Repository and workflow

- [ ] Create the repository structure (frontend, backend, shared types, docs, scripts).
- [ ] Add `.gitignore`, `.editorconfig`, formatter and linter configuration.
- [ ] Add `README.md` setup steps and `.env.example`.
- [ ] Add PR template, issue template and branch naming convention.
- [ ] Protect the main branch; require CI and one review.
- [ ] Create the Jira/GitHub issue labels used by the sprints (`FR-1` … `FR-20`, `sprint-0` … `sprint-5`, `bug`, `tech-debt`).

### 3.2 Application skeleton

- [ ] Frontend shell with routing, layout, error page and loading state.
- [ ] Backend shell with a health endpoint and structured error handling.
- [ ] Shared types package or folder for API models.
- [ ] Environment loading with validation (fail fast on missing variables).
- [ ] Base logging and error tracking.
- [ ] Background job runner/queue skeleton (needed by Sprint 1 CV extraction and Sprint 4 sync).

### 3.3 Database baseline

- [ ] Create the database and migration tooling.
- [ ] Baseline migration for `users`, `roles`, `profiles`, `ai_settings` and `notifications` (notification read state only).
- [ ] Seed script for local development and demo data.
- [ ] Confirm row-level access rules or application-level authorization strategy.
- [ ] Backup/restore procedure for local and hosted databases.

### 3.4 Authentication wiring

- [ ] Register the GitHub OAuth application (callback URL per environment).
- [ ] Create an email provider sandbox account and verify sending.
- [ ] Add placeholder auth routes and session/token utilities; full flows land in Sprint 1.
- [ ] Add secret storage for GitHub client ID/secret, email key, LLM key and storage key.

### 3.5 Design and frontend baseline

- [ ] Review the Figma file and list the screens needed by Sprints 1–5.
- [ ] Define design tokens (colour, spacing, typography) and base components (button, input, form, card, modal, toast, table, empty state).
- [ ] Add responsive layout and accessibility baseline (labels, focus states, keyboard use).
- [ ] Map each sprint FR to its screens in `../engineering/screens.md`.

### 3.6 CI/CD and deployment

- [ ] CI on every push: install, lint, type check, unit test runner, build.
- [ ] Deployment for frontend, backend and database migrations.
- [ ] Preview environment for pull requests.
- [ ] Health check and smoke check after deploy.
- [ ] Rollback procedure documented.

### 3.7 Documentation

- [ ] Create `../API.md` endpoint skeleton (already exists; confirm conventions).
- [ ] Create `../engineering/architecture.md`, `../engineering/data-model.md`, `../engineering/setup.md`.
- [ ] Create the sprint backlog from `README.md` and the five sprint files.
- [ ] Record the team's FR ownership from the source document.

## 4. Deliverables

- Repository with frontend, backend, shared types, docs and CI.
- Chosen stack documented with versions.
- Running local environment via one documented command.
- Database with baseline migrations and seed data.
- GitHub OAuth and email sandbox configured for development.
- Deployed frontend and backend with a working health check.
- Design tokens and base components.
- `API.md` ready for Sprint 1 endpoints.

## 5. Definition of Done

- All tasks above complete or explicitly deferred with an owner and date.
- Stack and architecture decisions recorded.
- The application runs locally and in the deployed environment.
- CI and preview deployment work.
- Sprint 1 can start without further setup work.
