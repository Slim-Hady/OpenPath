import type { ServiceDefinition } from '@osh/service-kit';

export const service: ServiceDefinition = {
  name: "Account",
  slug: "account",
  sprint: "Sprint 1",
  database: "account_db",
  provides: [
    "IAccount"
  ],
  requires: [
    "IGitHubAPI",
    "ISupabase"
  ],
  owns: [
    "User",
    "DeletionRequest"
  ],
};
