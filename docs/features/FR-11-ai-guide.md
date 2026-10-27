# FR-11 — AI guide with guardrail

> Story: US-11.1, US-11.2, US-11.3, US-11.4 · Sprint: 3 · Slice: 4 · Status: shipped
> Last updated: 2026-10-27

## 1. What it does (user view)

A per-issue chat that explains the repo and issue, suggests investigation steps and links resources. It refuses to write the fix, implementation, patch or diff, including on rephrasing and follow-ups.

## 2. Why it exists (FR + acceptance criteria)

FR-11.1–11.10. Acceptance: context-linked chat; history restored; refusal every time; AI limits enforced and explained.

## 3. Where it lives

`components/guide-chat.tsx`, `apps/api/src/modules/guide/*`, `apps/api/src/modules/ai/guardrail.service.ts`, `guardrail.cases.ts`, `docs/Sprints/sprint3/02-testing.md`

## 4. How it works

1. `GET /guide/conversations/:issueId` verifies selection and creates the conversation.
2. A message first passes the intent classifier; a solution request is refused without a provider call and stored with `REFUSED`.
3. Otherwise `ai_settings` and the monthly token/cost limits are checked.
4. The prompt includes issue context, cached onboarding, repo files and the last 9 messages; repository text is delimited as untrusted.
5. The reply is post-filtered: fences, diffs and code lines are stripped; if the user asked for a solution the canonical refusal replaces the answer. The row and usage are stored; history is restored on reopen.

## 5. Sequence diagram

Canonical sequence: [AI guide and guardrail](../engineering/diagrams/sequences/04-ai-guide.md).
The diagram is the source of truth for this flow and maps to the files above.

## 6. Data

`ChatConversation` unique `(userId, issueId)`, `ChatMessage` with role, guardrailOutcome, tokens; `AiUsage`.

## 7. Contract

`GET /guide/conversations/:issueId`, `POST /guide/conversations/:issueId/messages`. Errors: 403/404 not owner/selected, 429 `AI_TOKEN_LIMIT`/`AI_USAGE_LIMIT`, 503 `AI_UNAVAILABLE`.

## 8. External calls, quota and fallback

Gemini `AI_GUIDE` (fast lite model, 8s budget). No AI call on a refused request. On provider failure the history is kept and the UI shows an offline card.

## 9. Authorization and failure modes

Conversation is keyed by user+issue; a non-owner cannot read or append.

## 10. Decisions and rejected alternatives

Refuse by intent before the provider call, then filter the output again. Rejected: trusting the prompt alone; a client-side filter; streaming that could bypass the filter.

## 11. Tests and evidence

`pnpm --filter @osh/api test` 15/15 guardrail cases; `pnpm guardrail:eval` 15/15 refusal/strip/pass; live refusal path stored and rendered.

Evidence lives under `dev/evidence/slice-4/`. The PR body records the
exact commands and result.

## 12. Manual demo

Issue → AI guide → ask “Write the fix for this issue” → refusal card; ask “How do I investigate?” → guidance; reload → history restored.

## 13. Known limits and what would break it

Replies are non-streaming JSON (FR-11 does not require streaming; the design's streamed caret is a known visual deferral). The model can still be slow; the client shows a thinking state and the provider has an 8s budget.

## 14. Changelog

- 2026-10-27 — implemented and documented in the vertical build.
