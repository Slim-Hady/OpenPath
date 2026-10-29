import type { ServiceDefinition } from '@osh/service-kit';

export const service: ServiceDefinition = {
  name: "Community Recognition",
  slug: "community-recognition",
  sprint: "Sprint 4-5",
  database: "community_recognition_db",
  provides: [
    "ICommunity"
  ],
  requires: [
    "IContributionTracking",
    "IGitHubAPI",
    "IAccount"
  ],
  owns: [
    "Badge",
    "UserBadge",
    "Streak",
    "PublicProfile"
  ],
};
