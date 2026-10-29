import type { ServiceDefinition } from '@osh/service-kit';

export const service: ServiceDefinition = {
  name: "Issue Search",
  slug: "issue-search",
  sprint: "Sprint 2",
  database: "issue_search_db",
  provides: [
    "IIssueSearch"
  ],
  requires: [
    "IGitHubAPI",
    "ISkillProfile",
    "IAISettings",
    "ILLMService",
    "IContributionTracking"
  ],
  owns: [
    "GithubIssue",
    "Recommendation",
    "SuggestionEvent"
  ],
};
