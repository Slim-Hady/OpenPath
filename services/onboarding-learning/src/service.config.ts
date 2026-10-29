import type { ServiceDefinition } from '@osh/service-kit';

export const service: ServiceDefinition = {
  name: "Onboarding & Learning",
  slug: "onboarding-learning",
  sprint: "Sprint 3",
  database: "onboarding_learning_db",
  provides: [
    "IOnboarding"
  ],
  requires: [
    "IContributionTracking",
    "IGitHubAPI",
    "ILLMService",
    "IAISettings"
  ],
  owns: [
    "RepositoryOnboarding",
    "IssueOnboarding",
    "LearningResource"
  ],
};
