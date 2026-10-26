---
status: accepted
---

# Nest + Next

## Decision

Build the product as a two-app monorepo: **Next.js** for UI and a same-origin proxy, **NestJS** for the API, **PostgreSQL (Supabase)** for state, **BullMQ + Redis** for jobs, **Gemini** for AI, **Octokit** for GitHub.

## Context

- The team knows Nest and Express; Next is new.
- The product needs a polished, animation-heavy UI and shareable public pages, so SSR/SEO has real product value.
- Requirements demand background work (5-minute GitHub sync, notifications, CV extraction) and strict role enforcement.
- Delivery target is short (≈1.5 days to a demo, then continued iteration), with a five-person team owning different FR groups.

## Alternatives considered

| Option | Why rejected |
|---|---|
| Next only | One deploy and fastest start, but no enforced backend structure and jobs need a second process anyway |
| React (Vite) + Express | Simplest stack, but no SSR for public profiles and the team wanted the Nest structure |
| React (Vite) + Nest | Strong middle ground; SSR for public pages would be rebuilt by hand |
| Next + Express | Less structure than Nest for a five-person team |

## Why

- The UI is a first-class deliverable; SSR gives shareable public profiles (FR-15) and indexable learning content (FR-12) for free.
- Nest provides the boundaries the team already understands: modules per FR group, guards, DTO validation, Swagger for `docs/API.md`, and BullMQ integration.
- Same-origin proxy removes the usual cost of a split: no CORS, no cross-site cookies, one public origin.

## Consequences

- **Good:** clear API contract, enforced roles, background jobs without serverless limits, SSR for public pages, Swagger as living documentation.
- **Cost:** two deploys, two env sets, two logs, and a proxy layer to maintain.
- **Cost:** the team must learn the Next App Router while building; mitigated by keeping almost all data work in client components + TanStack Query.
- **Risk accepted:** deadline pressure. Next is the only unfamiliar piece, so no other new technology is introduced.
- **Risk accepted:** one database for all modules. Isolation is by module and RLS, not by service.
- Revisit if: the team splits by layer, a mobile client appears, or `discovery` needs independent scaling — then extract one Nest module into its own deployment first.
