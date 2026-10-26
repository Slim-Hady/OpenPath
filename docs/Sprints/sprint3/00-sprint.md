# Sprint 3 — Onboarding and AI Guide

> Sprint files: [API](01-api.md) · [Testing](02-testing.md) · [Review](03-review.md)


| | |
|---|---|
| Duration | 2 weeks |
| Capacity | 50 points |
| Planned | 45 points |
| Goal | After selecting an issue, a developer understands the repository and the task and can ask an AI guide that never writes the solution |
| Depends on | [Sprint 2 — Core Value](../sprint2/00-sprint.md) |
| Requirements | FR-8 (partial), FR-9, FR-10, FR-11 |

## 1. Description

This sprint turns a selected Issue into a guided contribution. It generates repository onboarding (purpose, structure, setup, branch/PR rules), issue onboarding (plain-language summary, requirements, related files, learning resources) and a per-issue AI guide with hard guardrails: explain and suggest investigation steps, never provide a complete solution or implementation code.

It also adds the manual progress dashboard: status per selected issue, counts and time since selection, with manual status updates and a Pull Request link. Automatic GitHub sync follows in Sprint 4.

## 2. Scope

| FR | Story | ID | Points |
|---|---|---|---|
| FR-9 | Repository overview | US-9.1 | 5 |
| FR-9 | Setup instructions | US-9.2 | 3 |
| FR-9 | Branch and PR guidance | US-9.3 | 3 |
| FR-10 | Plain-language issue summary | US-10.1 | 3 |
| FR-10 | Requirements and related code | US-10.2 | 5 |
| FR-10 | Resources without solutions | US-10.3 | 3 |
| FR-11 | Chat with the AI guide | US-11.1 | 8 |
| FR-11 | Ask for resources | US-11.2 | 2 |
| FR-11 | No solutions | US-11.3 | 5 |
| FR-11 | Chat history and AI limits | US-11.4 | 3 |
| FR-8 | Progress dashboard | US-8.1 | 3 |
| FR-8 | Update status and attach PR | US-8.2 | 2 |
| **Total** | | | **45** |

### Not in this sprint

- Automatic GitHub sync and progress history (Sprint 4, US-8.3).
- Notifications for new content or status changes (Sprint 4).
- Badges and streaks (Sprint 4).
- Learning resource search and etiquette guides (Sprint 5, FR-12).

## 3. User stories and acceptance criteria

### FR-9 Manage Repository Onboarding

**US-9.1 · Repository overview — 5 points**

_As a developer, I need an overview of the selected Issue's repository, so that I understand its purpose and structure._

- [ ] Given I selected an Issue, when I open repository onboarding, then I see its purpose, structure, main technologies and files to read first.

**US-9.2 · Setup instructions — 3 points**

_As a developer, I need instructions to clone, set up, run and test the repository, so that I can work locally._

- [ ] Given the repository has documentation, when I open setup, then I see steps to clone, set up, run and test it.

**US-9.3 · Branch and PR guidance — 3 points**

_As a developer, I need branch instructions, contribution guidelines and Pull Request rules, so that my contribution follows the project's process._

- [ ] Given the repository has a CONTRIBUTING.md, when I open guidelines, then it is displayed.
- [ ] Given I open PR guidance, when it loads, then it matches the repository's guidelines.
- [ ] Given another user already selected an Issue from the same repository, when I open onboarding, then stored guidance is reused.

### FR-10 Manage Issue Onboarding

**US-10.1 · Plain-language issue summary — 3 points**

_As a developer, I need a plain-language description of my Issue and its discussion, so that I understand what is asked._

- [ ] Given I selected an Issue, when I open its onboarding, then I see a clear summary of the description and discussion.

**US-10.2 · Requirements and related code — 5 points**

_As a developer, I need the required technologies, related files and research topics, so that I know where to start._

- [ ] Given an Issue onboarding page, when it loads, then I see required technologies, knowledge and level.
- [ ] Given the page loads, when I scroll, then I see related files and directories and topics to research.

**US-10.3 · Resources without solutions — 3 points**

_As a developer, I need documentation and learning links without a ready solution, so that I complete the contribution myself._

- [ ] Given I open the resources, when the page loads, then I see links to relevant documentation and learning material.
- [ ] Given any onboarding content, when it is generated, then it contains no complete solution or implementation code.

### FR-11 Manage AI Guide

**US-11.1 · Chat with the AI guide — 8 points**

_As a developer, I need to chat with an AI guide about my selected Issue, so that I understand the Issue, repository and concepts._

- [ ] Given I selected an Issue, when I start a chat, then it is linked to that Issue and uses its context.
- [ ] Given I ask how to investigate or what a concept means, when the AI replies, then I receive explanations and investigation steps within 10 seconds for most requests.

**US-11.2 · Ask for resources — 2 points**

_As a developer, I need to ask the AI guide for documentation and learning resources, so that I can learn what I need._

- [ ] Given I ask for resources, when the AI replies, then it provides relevant documentation and learning links.

**US-11.3 · No solutions — 5 points**

_As the platform owner, I need the AI guide to refuse full solutions and implementation code, so that developers complete the work themselves._

- [ ] Given I ask the AI to solve the Issue or write the code, when it replies, then it refuses and offers guidance instead.
- [ ] Given I rephrase or follow up with the same request, when it replies, then it still refuses.

**US-11.4 · Chat history and AI limits — 3 points**

_As a developer, I need to continue a previous conversation and be told when a limit is reached, so that I can resume and understand restrictions._

- [ ] Given I had a chat on an Issue, when I reopen it, then the history is restored and I can continue.
- [ ] Given the Admin's AI limit is reached, when I send a message, then I am told that the limit was reached.

### FR-8 Manage Progress (partial)

**US-8.1 · Progress dashboard — 3 points**

_As a developer, I need a dashboard of my selected Issues with their status and a summary, so that I see how far I have come._

- [ ] Given I have selected Issues, when I open the dashboard, then each shows In Progress, PR Open, Merged or Ignored.
- [ ] Given the dashboard loads, when I view the summary, then I see counts per status and the time since each Issue was selected.

**US-8.2 · Update status and attach PR — 2 points**

_As a developer, I need to update an Issue's status manually and attach my Pull Request link, so that my progress is accurate._

- [ ] Given a selected Issue, when I change its status, then the new status is saved.
- [ ] Given I paste my Pull Request link, when I save, then it is attached to the Issue.

## 4. Technical work

### Data model

- `repository_onboarding` keyed by repository, with generated sections and source version (README/CONTRIBUTING commit).
- `issue_onboarding` keyed by issue, with summary, requirements, related files, research topics, resources.
- `chat_conversations` (user, issue) and `chat_messages` (role, content, token usage, guardrail outcome).
- `progress_events` for manual status changes and PR link updates (history-ready for Sprint 4).
- Cache keys and invalidation rules for generated onboarding content.

### API and integrations

Endpoints and manual checks live in [`01-api.md`](01-api.md).

- Endpoints for repository onboarding, issue onboarding, chat start/history/message and progress status; document in `../API.md`.
- GitHub reads: README, CONTRIBUTING, repository tree, issue description and comments. Handle missing files and huge repositories.
- AI generation: structured output for onboarding, with validation; store generated content so the same repository reuses guidance.
- AI guide: per-issue context assembly, conversation history, token limits and a system prompt that enforces "guidance, not solutions".
- Output guardrail: detect complete solutions or implementation code and replace with a refusal plus investigation steps. Log guardrail outcomes for NFR-4 evaluation.
- Streaming or fast non-streaming responses to meet the 10-second target.
- Enforce AI token/temperature/limit settings on every chat message.
- Prompt-injection handling: treat repository and issue text as untrusted data, not instructions.

### UI screens

- Repository onboarding tabs: overview, setup, contribution/PR guidance.
- Issue onboarding: summary, requirements, related code, resources.
- AI guide chat with history, loading state, refusal state and limit state.
- Progress dashboard with status filters and summary counts.
- Manual status update and PR-link dialog.

## 5. Definition of Done

- All acceptance criteria above pass.
- Guardrail evaluation suite passes at 100%.
- Onboarding content is cached and reused per repository.
- Chat history and progress events persist.
- API endpoints documented in `../API.md`.
- Demo completed and accepted.
