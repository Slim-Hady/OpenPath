## What and why

<!-- One paragraph: the user problem and the slice. Link the FR and story. -->

- FR:
- Story:
- Slice:

## What changed

<!-- Web, API, contracts, Prisma, jobs, docs. Keep it scannable. -->

-
-

## Contracts

<!-- The endpoint rows and Zod schemas changed before the handler/client. -->

| Endpoint | Role | Request | Response | Errors |
|---|---|---|---|---|
|  |  |  |  |  |

## Test evidence

Commands run sequentially, with the result:

```bash
# command
# result
```

- [ ] lint
- [ ] typecheck
- [ ] contracts
- [ ] api unit
- [ ] api integration
- [ ] web unit
- [ ] guardrail eval (if a prompt/filter changed)
- [ ] docker build (if a Dockerfile changed)

## Docs updated

- [ ] `docs/features/FR-NN-*.md`
- [ ] sequence diagram (if a flow changed)
- [ ] `docs/API.md` / sprint contract
- [ ] ADR (if a hard-to-reverse decision changed)
- [ ] `docs/learning/journal.md`

## UI evidence

<!-- Screenshots of the actual app, both themes if the change is visual. -->

## Risks and rollback

<!-- Blast radius, migration, feature flag, revert plan. -->

## Reviewer checklist

- Acceptance criteria demonstrably met.
- Role gate and service ownership re-check present.
- No secret/token/connection string in code, logs, tests, docs or PR.
- Request/response validated by a Zod contract.
- AI output cannot contain code/solution; post-filter tested.
- Jobs have idempotency keys and bounded retries; nothing slow in a request.
- Migrations additive; no applied migration edited.
- No new external service, no paid tier.
