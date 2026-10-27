---
status: accepted
---

# 0002 — Supabase-managed GitHub OAuth

## Context

The platform needs GitHub identity and a provider token to read repositories,
issues and pull requests. The original sprint notes assumed an OAuth callback
on the API (`localhost:4000`). Supabase Auth already supports GitHub as a
provider and performs the code exchange itself.

## Decision

GitHub OAuth is configured **inside Supabase**. The GitHub OAuth App callback is
`https://<project-ref>.supabase.co/auth/v1/callback`. The web callback route
exchanges the Supabase code and forwards `session.provider_token` once to
`POST /github/connect`; the API encrypts it with AES-256-GCM and never stores
the OAuth client secret.

The API runtime removes `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from its
required environment. They are setup values for the Supabase dashboard.

## Alternatives rejected

| Option | Why not |
|---|---|
| API owns the OAuth code exchange | Duplicates Supabase, needs the client secret in the API, and creates a second session model |
| Web owns the exchange and calls GitHub directly | Puts a provider secret/call in the web app, violating rule 1 |
| Personal access tokens only | Not a user identity and cannot be revoked per user |

## Consequences

- One identity provider and one callback for both email and GitHub.
- The provider token is captured once; if it is revoked the user reconnects.
- The API needs only `GITHUB_TOKEN_ENC_KEY`; the client secret is not a runtime
  secret.
- Tests mock the provider token; the real flow requires the Supabase provider
  to be enabled by the project owner.

## Revisit

If Supabase removes provider tokens, or GitHub requires a refresh token flow.
Revisit before production; the callback must be registered per environment.
