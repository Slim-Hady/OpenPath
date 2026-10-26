# Journal

One entry per slice. Three sentences, written by you, corrected by the agent.

Format:

```
## Slice N — <name> (<date>)

- What it does:
- Why this way:
- What would break it:

Corrected: <what I got wrong / missed>
```

---

## Slice 0 — Stack decision (2026-10-26)

- What it does: `web` renders and proxies, `api` owns rules, `worker` owns jobs.
- Why this way: Nest boundaries are familiar; Next is only used for UI and the proxy.
- What would break it: putting Prisma or a provider key in `apps/web`.

Corrected: TBD
