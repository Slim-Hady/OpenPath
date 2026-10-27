import { z } from 'zod';
import { ExperienceLevelSchema, idSchema, isoDate } from './common.js';

/* -------------------------------------------------------------------------- */
/* Repository onboarding (FR-9)                                                */
/* -------------------------------------------------------------------------- */

export const ResourceLinkSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  kind: z.enum(['documentation', 'guide', 'repository', 'issue', 'video']).default('documentation'),
});
export type ResourceLink = z.infer<typeof ResourceLinkSchema>;

export const FirstFileSchema = z.object({
  path: z.string(),
  why: z.string(),
});
export type FirstFile = z.infer<typeof FirstFileSchema>;

export const RepositoryOnboardingSchema = z.object({
  repoFullName: z.string(),
  commitSha: z.string().nullable(),
  overview: z.string(),
  structure: z.string(),
  technologies: z.array(z.string()),
  firstFiles: z.array(FirstFileSchema),
  setup: z.array(z.string()),
  run: z.array(z.string()),
  test: z.array(z.string()),
  branchGuidance: z.array(z.string()),
  contributing: z.string().nullable(),
  prGuidance: z.array(z.string()),
  generatedFrom: z.string(),
  generatedAt: isoDate,
  updatedAt: isoDate,
  cached: z.boolean(),
});
export type RepositoryOnboarding = z.infer<typeof RepositoryOnboardingSchema>;

/* -------------------------------------------------------------------------- */
/* Issue onboarding (FR-10)                                                    */
/* -------------------------------------------------------------------------- */

export const IssueOnboardingSchema = z.object({
  issueId: z.string(),
  summary: z.string(),
  requirements: z.object({
    technologies: z.array(z.string()),
    knowledge: z.array(z.string()),
    level: ExperienceLevelSchema.nullable(),
    prerequisites: z.array(z.string()),
  }),
  relatedFiles: z.array(FirstFileSchema),
  researchTopics: z.array(z.string()),
  resources: z.array(ResourceLinkSchema),
  generatedFrom: z.string(),
  generatedAt: isoDate,
  sourceUpdatedAt: isoDate.nullable(),
  cached: z.boolean(),
});
export type IssueOnboarding = z.infer<typeof IssueOnboardingSchema>;

/* -------------------------------------------------------------------------- */
/* AI guide (FR-11)                                                            */
/* -------------------------------------------------------------------------- */

export const ChatRoleSchema = z.enum(['GUIDE', 'USER']);
export type ChatRole = z.infer<typeof ChatRoleSchema>;

export const GuardrailOutcomeSchema = z.enum(['PASSED', 'REFUSED', 'STRIPPED']);
export type GuardrailOutcome = z.infer<typeof GuardrailOutcomeSchema>;

export const ChatMessageSchema = z.object({
  id: idSchema,
  role: ChatRoleSchema,
  content: z.string(),
  guardrailOutcome: GuardrailOutcomeSchema.nullable(),
  tokens: z.number().int().nonnegative().nullable(),
  createdAt: isoDate,
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const GuideConversationSchema = z.object({
  id: idSchema,
  issueId: z.string(),
  issueTitle: z.string(),
  messages: z.array(ChatMessageSchema),
  createdAt: isoDate,
  updatedAt: isoDate,
  usage: z.object({
    tokensUsedThisMonth: z.number().int().nonnegative(),
    maxTokensPerUser: z.number().int().nonnegative(),
  }),
});
export type GuideConversation = z.infer<typeof GuideConversationSchema>;

export const SendGuideMessageSchema = z
  .object({ content: z.string().trim().min(1).max(2000) })
  .strict();
export type SendGuideMessage = z.infer<typeof SendGuideMessageSchema>;

export const GuideReplySchema = z.object({
  message: ChatMessageSchema,
  usage: z.object({
    tokensUsedThisMonth: z.number().int().nonnegative(),
    maxTokensPerUser: z.number().int().nonnegative(),
  }),
  refusal: z.boolean(),
  strippedCode: z.boolean(),
});
export type GuideReply = z.infer<typeof GuideReplySchema>;

/* -------------------------------------------------------------------------- */
/* Learning resources (FR-12)                                                  */
/* -------------------------------------------------------------------------- */

export const LearningResourceSchema = z.object({
  id: idSchema,
  slug: z.string(),
  title: z.string(),
  topic: z.string(),
  summary: z.string(),
  body: z.string(),
  kind: z.enum(['GUIDE', 'DOCUMENTATION']),
  externalUrl: z.string().url().nullable(),
  readingMinutes: z.number().int().positive(),
  updatedAt: isoDate,
});
export type LearningResource = z.infer<typeof LearningResourceSchema>;

export const LearningSearchResponseSchema = z.object({
  items: z.array(LearningResourceSchema),
  query: z.string(),
  topics: z.array(z.string()),
});
export type LearningSearchResponse = z.infer<typeof LearningSearchResponseSchema>;
