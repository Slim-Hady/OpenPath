# Sprint 2 — Testing

> Back to [sprint specification](00-sprint.md) · [API checks](01-api.md) · [review](03-review.md)

## 1. Story coverage

Every user story in this sprint must have at least one manual test case and the relevant unit/integration coverage.

| Story | Manual test IDs |
|---|---|
| US-4.1 | M2.1, M2.2 |
| US-4.2 | M2.3 |
| US-4.3 | M2.4 |
| US-4.4 | M2.5 |
| US-5.1 | M2.6 |
| US-5.2 | M2.7 |
| US-5.3 | M2.8 |
| US-6.1 | M2.9 |
| US-6.2 | M2.9, M2.10 |
| US-6.3 | M2.11 |
| US-6.4 | M2.13 |
| US-7.1 | M2.12 |
| US-20.3 | M2.14 |

## 2. Unit tests

| Area | Cases |
|---|---|
| Search query | Profile languages/technologies/level mapped correctly, pagination, cache hit/miss |
| Filters | Language, label, organization, repository, activity; combined filters; invalid values |
| Exclusion | Closed, assigned, inactive, already selected, already ignored; duplicates removed |
| Ranking output | Exactly three unique issues, valid ids, reason present, unknown id rejected, missing candidate handled |
| Timeout/fallback | AI timeout falls back safely; partial/invalid JSON handled |
| Regenerate | Previous three excluded, new set persisted, event recorded |
| Selection | Select → confirm → `In Progress`; cancel leaves no record; re-select blocked |
| Ignore | Ignored issue never returned by later searches |
| Saved items | Create list, move item, remove item, ownership denied, duplicate bookmark |
| AI enforcement | Settings applied per request, token counting, usage limit block, per-feature limits |

## 3. Integration tests

- GitHub search and repository fetch with a mocked API, including rate-limit and error responses.
- LLM ranking with valid, invalid and timed-out responses.
- Search → rank → select → ignore flow against a test database.
- Authorization: another user cannot read or modify saved lists, selections or recommendations.
- AI limit reached → request blocked.

## 4. Manual tests

| ID | Scenario | Steps | Expected |
|---|---|---|---|
| M2.1 | Search from profile | Complete profile → request search | Open matching issues retrieved and ranked |
| M2.2 | Incomplete profile | Remove a required field → search | Request blocked with prompt to complete profile |
| M2.3 | Filters | Apply language/label and organization/repository filters | Only matching issues returned |
| M2.4 | Exclusions | Search with closed/assigned/inactive and previously selected/ignored issues | Excluded from results |
| M2.5 | Empty results | Use filters with no matches | "No suitable issues" plus broaden-filters action |
| M2.6 | Top three | Run matching | Exactly three issues with reasons, within 10 seconds |
| M2.7 | Details | Open a recommendation | Repository, technologies, level, prerequisites and reason shown |
| M2.8 | Regenerate | Press regenerate | Three different issues; suggestion event recorded |
| M2.9 | Selection | Select → confirm | Issue saved as In Progress |
| M2.10 | Cancel selection | Select → cancel | No selected issue created |
| M2.11 | Ignore | Ignore an issue → search again | Issue never appears again |
| M2.12 | Saved items | Bookmark issue/repository, create list, move and remove | Changes persist; other user denied access |
| M2.13 | Select saved | Choose a saved issue → confirm | It becomes the selected issue |
| M2.14 | AI settings enforced | Admin lowers token/temperature/limit → next AI request | New values applied; limit blocks with message |

## 5. Non-functional checks

- Three recommendations within 10 seconds for 95% of requests (NFR-1.2).
- Standard API responses within 500 ms (NFR-1.1).
- AI usage recorded for every feature and attributable to the user (supports BR-3/BR-4).
- Rate-limit and GitHub failure paths return a usable error, never a blank screen.
- No AI call is made when the usage limit is reached.

## 6. Test data and environment

- Use a dedicated test database and seeded users for each role.
- Mock GitHub, email, CV parser and LLM services; never call paid services from automated tests.
- Record the build/commit tested and the date for every manual run.
- Manual test IDs above must be ticked in the review file.

## 7. Exit criteria

- All unit and integration tests pass.
- All manual test cases above pass.
- Non-functional checks pass or have a recorded, accepted exception.
- No open critical or high bug.
