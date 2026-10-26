# API Contract

Status: **Conventions TBD; endpoints are defined per sprint.**

This file holds the global conventions. Each sprint owns its endpoint contract and manual test checklist in `Sprints/sprintN/01-api.md`. Define an endpoint there before implementing it.

## Conventions (TBD)

| Topic | Decision |
|---|---|
| Base URL | TBD |
| Versioning | TBD |
| Authentication | TBD (session or token; GitHub OAuth flow) |
| Authorization | Roles: Developer, Maintainer, Admin |
| Request format | TBD |
| Response format | TBD |
| Error format | TBD |
| Pagination | TBD |
| Rate limits | TBD |
| Date/time format | TBD |
| File uploads | TBD (CV: allowed types, max size) |

## Sprint contracts

| Sprint | Resources | Contract and manual checks |
|---|---|---|
| 1 | Auth, account/profile, developer profile, CV, AI settings, notifications | [01-api.md](Sprints/sprint1/01-api.md) |
| 2 | Issue search/filters, recommendations, regenerate, selection/ignore, saved lists | [01-api.md](Sprints/sprint2/01-api.md) |
| 3 | Repository/issue onboarding, AI guide chat, progress | [01-api.md](Sprints/sprint3/01-api.md) |
| 4 | Progress history, notifications/preferences, badges/streaks, account history/delete, admin metrics | [01-api.md](Sprints/sprint4/01-api.md) |
| 5 | Public profiles, contributor search, outreach/conversations, learning resources, AI usage | [01-api.md](Sprints/sprint5/01-api.md) |

## Rules

- Add the endpoint to the sprint contract before writing the handler or client call.
- Every endpoint lists its required role and error responses.
- Test the happy path plus `401`, `403`/`404` and `400` for each endpoint.
- Keep this file limited to conventions and links; put endpoint details in the sprint file.
