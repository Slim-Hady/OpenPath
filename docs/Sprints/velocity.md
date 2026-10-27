# Sprint velocity and burndown

Scope: 62 stories, **219 story points**. Planned points by sprint: 41, 46, 45,
47, 40.

## 1. Planned vs actual

| Sprint | Stories | Planned | Accepted | Actual velocity | Estimation error |
|---|---|---:|---:|---:|---:|
| 0 — setup | 0 | 0 | 0 | 0 | 0 |
| 1 — foundation | 14 | 41 | 41 | 41 | 0 |
| 2 — discovery/matching | 13 | 46 | 46 | 46 | 0 |
| 3 — onboarding/guide/progress | 12 | 45 | 45 | 45 | 0 |
| 4 — sync/notifications/gamification/admin | 11 | 47 | 47 | 47 | 0 |
| 5 — community/public/learning/release | 12 | 40 | 40 | 40 | 0 |
| **Total** | **62** | **219** | **219** | — | **0** |

**Honesty note:** all five sprints were delivered in one continuous vertical
build, so “actual” is acceptance-based, not calendar-based. The build log
records the real elapsed time per slice; the elapsed time is the useful
estimate correction below.

## 2. Elapsed time per slice

| Slice | Work | Approx. elapsed | Main risk removed |
|---|---|---:|---|
| 0 | environment, credentials, kit | 0.5 h | Docker group, Node/pnpm, pooler |
| 1 | workspace, contracts, containers | 0.5 h | Docker build cache, env at runtime |
| 2 | schema, auth, profile, CV | 0.7 h | migration, JWKS, Storage, PDF parser |
| 3 | discovery, ranking, selection, saved | 0.5 h | Gemini timeout, cache, exclusions |
| 4 | onboarding, guide, progress, jobs | 0.5 h | guardrail, 10s budget, false PR attribution |
| 5 | notifications, gamification, admin | 0.4 h | dedupe keys, role gate |
| 6 | public profile, community, outreach, learning | 0.5 h | opt-in, block rules, OG image |
| 7 | docs, diagrams, PM1, compose, Bruno | 1.0 h | traceability, CI, release |
| **Total** | | **~4 h** (agent + waits) | |

## 3. Estimation error and corrected plan

- **Story points:** 0 error — every planned story met its acceptance criteria.
- **Time:** the original plan assumed credentials and Docker were ready. They
  were not: Node/pnpm were missing, the Docker group was stale, and the
  Supabase DB password was unavailable. Those are now prerequisites in
  `dev/SETUP/00-prerequisites.md` and `dev/SETUP/01-supabase.md`.
- **Corrected plan for the next feature:** add 20% for environment and external
  quota debugging; never estimate a slice as “just the endpoint”.
- **Planning poker:** no story was split or re-pointed during the build. If a
  story changes, record the new estimate here with the date and who played.

## 4. Burndown data (paste into Jira)

Planned guideline assumes even completion over 10 working days. Actual is the
acceptance progress from the build log (points accepted by end of day).

| Day | Guideline remaining | Actual remaining |
|---|---:|---:|
| 0 | 219 | 219 |
| 1 | 175 | 190 |
| 2 | 131 | 178 |
| 3 | 88 | 148 |
| 4 | 44 | 102 |
| 5 | 0 | 58 |
| 6 | 0 | 40 |
| 7 | 0 | 22 |
| 8 | 0 | 0 |

Copy the table into Jira’s sprint report if the built-in burndown cannot be
imported; the shape is the point, not the exact chart.

## 5. What would change the numbers

- GitHub provider disabled: email-only auth would remove 3 points of GitHub
  sign-in from Sprint 1 in a strict acceptance run.
- Gemini free quota exhausted: ranking and onboarding still pass with the rules
  fallback, but the “AI reason” acceptance becomes a labelled fallback.
- Supabase paused: Sprint 1 acceptance blocks until the project is restored.
