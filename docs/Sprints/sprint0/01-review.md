# Sprint 0 — Setup Review and Sign-off

> Back to [setup specification](00-sprint.md)

Sprint 0 has no product testing. Correctness is verified through the environment checklist below.

## 1. Setup verification

> Local compose, migrations, CI config and secret scan passed. The four unchecked
> items require a deployed environment, the GitHub provider or SMTP; they are
> not mocked into a pass.

Sprint 0 has **no product testing**. Verify the environment instead:

- [x] Fresh clone + documented setup runs the app locally.
- [x] CI is green on the default branch.
- [ ] Deployed health check returns success.
- [x] A database migration runs forward and can be rolled back.
- [ ] GitHub OAuth callback URL is accepted by GitHub.
- [ ] A test email is delivered from the sandbox provider.
- [x] Secrets are not committed; `.env.example` lists every required key.
- [ ] Preview deployment builds from a pull request.

## 2. Risks and issues

| Risk | Mitigation |
|---|---|
| Stack decision stalls the sprint | Time-box to one day; pick the team's strongest stack and record it as an assumption. |
| OAuth or email provider approval is slow | Use sandbox credentials and mocked providers in Sprint 1. |
| LLM provider access/quota is unavailable | Use a mocked AI adapter in Sprint 1; confirm the real provider before Sprint 2. |
| Hosting costs or limits | Choose free/low-tier services for development and document upgrade points. |

## 3. Handoff

Sprint 1 assumes:

- A working auth shell, database and migration pipeline.
- A background job runner for CV extraction.
- A deployed environment with secrets configured.
- Base UI components and routing.
- `API.md` conventions ready for auth, profile, CV, settings and notification endpoints.

## 4. Sign-off

| Role | Name | Date | Decision | Notes |
|---|---|---|---|---|
| Tech lead | Build verification | 2026-10-27 | Accept (local) | Compose, migration, CI config, secrets |
| Product owner | Human owner (pending) |  | Accept / Reject | Deployed environment and provider checks |
