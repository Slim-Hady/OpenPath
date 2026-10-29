import type { ServiceDefinition } from '@osh/service-kit';

export const service: ServiceDefinition = {
  name: "Contribution Tracking",
  slug: "contribution-tracking",
  sprint: "Sprint 2",
  database: "contribution_tracking_db",
  provides: [
    "IContributionTracking"
  ],
  requires: [
    "IIssueSearch",
    "IGitHubAPI",
    "INotification"
  ],
  owns: [
    "Selection",
    "ProgressEvent",
    "IgnoredIssue",
    "SavedList",
    "SavedItem"
  ],
};
