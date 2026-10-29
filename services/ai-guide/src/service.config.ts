import type { ServiceDefinition } from '@osh/service-kit';

export const service: ServiceDefinition = {
  name: "AI Guide",
  slug: "ai-guide",
  sprint: "Sprint 3",
  database: "ai_guide_db",
  provides: [
    "IAIGuide"
  ],
  requires: [
    "IOnboarding",
    "IContributionTracking",
    "ILLMService",
    "IAISettings"
  ],
  owns: [
    "ChatConversation",
    "ChatMessage"
  ],
};
