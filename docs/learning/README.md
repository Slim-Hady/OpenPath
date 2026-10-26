# Learning Plan

You are building fast and learning deliberately. This folder is the learning half of the work — it is not optional, it is how the project stays yours.

## The rule: one concept per slice

Every slice in `docs/PROGRESS.md` has one concept worth owning. Before the slice, read the concept brief. After the slice, write three sentences in `journal.md` and have them corrected.

| Slice | Concept to own | Why it matters |
|---|---|---|
| 1 | Containers and the request lifecycle | Understand what runs where before debugging |
| 2 | JWT verification, guards, ownership checks | The security model of the whole product |
| 3 | Validation at the boundary (Zod + DTOs) | Prevents most 400/500 bugs |
| 4 | API quotas, caching, ETags | GitHub will rate-limit you before anything else breaks |
| 5 | Structured LLM output + deterministic fallback | The core AI engineering skill |
| 6 | Prompt guardrails and evaluation | The product's differentiator |
| 7 | Queues, idempotency, retries | Why background work is different from HTTP |
| 8 | Aggregates and freshness | Reporting without slowing the write path |
| 9 | Public data and privacy boundaries | Opt-in rules are a product rule, not a detail |
| 10 | Release engineering | Deploy, migrate, roll back without fear |

## The three you must be able to explain without notes

1. **Auth:** how a Supabase token becomes a role-checked request, and where ownership is enforced.
2. **Ranking:** how a GitHub search becomes three ranked issues, and what happens when Gemini fails.
3. **Sync:** how an open PR becomes `PR Open`, and why a replayed event does not create a duplicate.

If you can whiteboard those three, you can defend the project and you actually understand it.

## Per-slice protocol (≈15 minutes)

1. **Before:** ask the agent for a 10-line concept brief — the idea, three pitfalls, the one file to read afterwards.
2. **Read that file.** Not the whole PR.
3. **After:** write in `journal.md` — what it does, why this way, what would break it.
4. **Run the manual test yourself.** Watching the agent test teaches nothing.
5. **One break-it drill per day:** remove a role check, or ask the AI guide for the fix, and observe the failure.

## What you can safely not learn

- Every line of Tailwind, Prisma and Nest decorator syntax.
- The internals of Gemini or BullMQ.
- Next's caching model beyond "auth-gated pages are never cached."

Say "I trust this and I tested it" instead of pretending to understand it. That is an engineering skill too.
