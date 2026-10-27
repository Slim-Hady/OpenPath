# 03 — Class diagram: web (PM1 level 3)

```mermaid
classDiagram
  class RootLayout {
    +fonts
    +ThemeProvider
    +SupabaseConfigProvider
    +QueryProvider
  }
  class AppShell {
    +uses useMe()
    +uses useNotifications()
    +signOut()
  }
  class AuthForm {
    +signIn()
    +signUp()
    +github()
  }
  class DiscoverPage {
    +filters
    +find()
    +regenerate()
    +save()
    +ignore()
  }
  class IssueDetail {
    +details
    +onboarding
    +select()
    +updateProgress()
  }
  class GuideChat {
    +messages
    +send()
    +limitState
    +refusalState
  }
  class RecommendationCard {
    +rank
    +reason
    +save
    +ignore
  }
  class ApiClient {
    +apiFetch(path, opts)
    +apiUpload(path, form)
  }
  class SupabaseProvider {
    +createBrowserClient()
  }
  class QueryProvider {
    +QueryClient
  }
  class Contracts {
    +Zod schemas
    +enums
  }
  class PublicProfilePage {
    +server fetch
    +visibility sections
  }

  RootLayout --> ThemeProvider
  RootLayout --> SupabaseProvider
  RootLayout --> QueryProvider
  AppShell --> ApiClient
  AppShell --> SupabaseProvider
  AuthForm --> SupabaseProvider
  DiscoverPage --> ApiClient
  IssueDetail --> ApiClient
  IssueDetail --> GuideChat
  DiscoverPage --> RecommendationCard
  ApiClient --> Contracts
  PublicProfilePage --> Contracts
  PublicProfilePage --> ApiClient
```

## SOLID notes

- Pages compose feature components; they do not call the database or a provider.
- `ApiClient` is the single transport; every response is the contract type.
- `SupabaseProvider` is the only place a browser Supabase client is constructed.
- Public pages use a server-side `publicApi` and keep their rendering independent
  of auth.

## Traceability

| Class | File |
|---|---|
| Root layout | `apps/web/app/layout.tsx` |
| App shell | `components/app-shell.tsx` |
| Auth | `components/auth-form.tsx`, `components/sign-in-popover.tsx` |
| Discover | `app/(app)/discover/page.tsx`, `components/recommendation-card.tsx` |
| Issue | `components/issue-detail.tsx`, `components/guide-chat.tsx` |
| API client | `lib/api-client.ts` |
| Providers | `components/supabase-provider.tsx`, `query-provider.tsx`, `theme-provider.tsx` |
| Public profile | `app/u/[handle]/page.tsx` |
