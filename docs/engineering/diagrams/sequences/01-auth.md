# Sequence — sign-up and login

```mermaid
sequenceDiagram
  autonumber
  actor D as Developer
  participant B as Browser
  participant W as Next web
  participant S as Supabase Auth
  participant A as Nest API
  participant DB as Postgres

  D->>B: email + password, or Continue with GitHub
  alt email/password
    B->>S: signInWithPassword / signUp (anon key)
    S-->>B: session cookie + access token
  else GitHub
    B->>S: signInWithOAuth(provider=github, scopes=read:user user:email public_repo)
    S->>S: OAuth exchange with the callback
    S-->>W: /auth/callback?code=…
    W->>S: exchangeCodeForSession(code)
    S-->>W: session + provider_token
    W->>A: POST /github/connect (Bearer access token, provider_token)
    A->>A: AES-256-GCM encrypt, store githubLogin
  end
  B->>W: GET /discover
  W->>W: middleware refreshes session
  W->>A: GET /me (Authorization: Bearer)
  A->>S: fetch JWKS (cached)
  A->>A: verify ES256 + audience + issuer
  A->>DB: upsert/lookup User by authId, read role
  A-->>W: Me contract
  W-->>D: dashboard or onboarding
```

Failure: invalid/expired token → 401; the middleware redirects to
`/login?next=…`. A GitHub callback without `code` shows the inline OAuth error.
No secret is ever logged. See FR-1 and ADR 0002.
