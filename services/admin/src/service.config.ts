import type { ServiceDefinition } from '@osh/service-kit';

export const service: ServiceDefinition = {
  name: "Admin",
  slug: "admin",
  sprint: "Sprint 1 + Sprint 4",
  database: "admin_db",
  provides: [
    "IAdminDashboard",
    "IAISettings"
  ],
  requires: [
    "IAccount",
    "IIssueSearch",
    "IContributionTracking",
    "IAIGuide"
  ],
  owns: [
    "AiSetting",
    "AiUsage",
    "AiUsageDaily",
    "AdminSnapshot",
    "JobRun",
    "SyncState"
  ],
};
