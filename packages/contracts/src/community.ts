import { z } from 'zod';
import {
  ExperienceLevelSchema,
  OutreachStatusSchema,
  OutreachTypeSchema,
  RoleSchema,
  idSchema,
  isoDate,
} from './common.js';

/* -------------------------------------------------------------------------- */
/* Gamification (FR-16)                                                        */
/* -------------------------------------------------------------------------- */

export const BadgeSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string(),
  requirement: z.string(),
  earned: z.boolean(),
  earnedAt: isoDate.nullable(),
  publicVisible: z.boolean(),
  progress: z.number().int().nonnegative(),
  target: z.number().int().positive(),
});
export type Badge = z.infer<typeof BadgeSchema>;

export const AchievementsSchema = z.object({
  badges: z.array(BadgeSchema),
  streak: z.object({
    current: z.number().int().nonnegative(),
    longest: z.number().int().nonnegative(),
    lastActivityOn: z.string().nullable(),
  }),
  profilePublished: z.boolean(),
});
export type Achievements = z.infer<typeof AchievementsSchema>;

export const UpdateBadgeVisibilitySchema = z
  .object({ badgeCode: z.string().min(1), publicVisible: z.boolean() })
  .strict();
export type UpdateBadgeVisibility = z.infer<typeof UpdateBadgeVisibilitySchema>;

/* -------------------------------------------------------------------------- */
/* Account history and statistics (FR-14)                                      */
/* -------------------------------------------------------------------------- */

export const AccountStatsSchema = z.object({
  selected: z.number().int().nonnegative(),
  merged: z.number().int().nonnegative(),
  ignored: z.number().int().nonnegative(),
  prOpen: z.number().int().nonnegative(),
  badges: z.number().int().nonnegative(),
  chats: z.number().int().nonnegative(),
});
export type AccountStats = z.infer<typeof AccountStatsSchema>;

export const AccountHistoryItemSchema = z.object({
  selectionId: idSchema,
  issueId: z.string(),
  issueTitle: z.string(),
  repoFullName: z.string(),
  status: z.string(),
  selectedAt: isoDate,
  conversationId: idSchema.nullable(),
});
export type AccountHistoryItem = z.infer<typeof AccountHistoryItemSchema>;

export const AccountHistorySchema = z.object({
  items: z.array(AccountHistoryItemSchema),
  stats: AccountStatsSchema,
});
export type AccountHistory = z.infer<typeof AccountHistorySchema>;

/* -------------------------------------------------------------------------- */
/* Public profile (FR-15)                                                      */
/* -------------------------------------------------------------------------- */

export const PublicProfileSettingsSchema = z.object({
  handle: z.string().nullable(),
  published: z.boolean(),
  mentorOptIn: z.boolean(),
  showSkills: z.boolean(),
  showContributions: z.boolean(),
  showBadges: z.boolean(),
  showStreak: z.boolean(),
  publicUrl: z.string().url().nullable(),
});
export type PublicProfileSettings = z.infer<typeof PublicProfileSettingsSchema>;

export const UpdatePublicProfileSchema = z
  .object({
    handle: z
      .string()
      .trim()
      .min(3)
      .max(32)
      .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/)
      .optional(),
    published: z.boolean().optional(),
    mentorOptIn: z.boolean().optional(),
    showSkills: z.boolean().optional(),
    showContributions: z.boolean().optional(),
    showBadges: z.boolean().optional(),
    showStreak: z.boolean().optional(),
  })
  .strict();
export type UpdatePublicProfile = z.infer<typeof UpdatePublicProfileSchema>;

export const PublicProfileSchema = z.object({
  handle: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  bio: z.string().nullable(),
  joinedAt: isoDate,
  githubLogin: z.string().nullable(),
  stats: z.object({
    merged: z.number().int().nonnegative(),
    prOpen: z.number().int().nonnegative(),
    badges: z.number().int().nonnegative(),
    streak: z.number().int().nonnegative(),
  }),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  contributions: z
    .array(
      z.object({
        issueTitle: z.string(),
        repoFullName: z.string(),
        issueUrl: z.string().url(),
        mergedAt: isoDate.nullable(),
      }),
    )
    .optional(),
  badges: z.array(z.object({ name: z.string(), description: z.string() })).optional(),
  streak: z.object({ current: z.number().int(), longest: z.number().int() }).optional(),
});
export type PublicProfile = z.infer<typeof PublicProfileSchema>;

/* -------------------------------------------------------------------------- */
/* Contributor search (FR-17)                                                  */
/* -------------------------------------------------------------------------- */

export const ContributorSchema = z.object({
  login: z.string(),
  name: z.string().nullable(),
  avatarUrl: z.string().url(),
  githubUrl: z.string().url(),
  contributions: z.number().int().nonnegative(),
  languages: z.array(z.string()),
  topics: z.array(z.string()),
  score: z.number().nonnegative(),
  platformHandle: z.string().nullable(),
  platformUserId: z.string().nullable(),
  optedIn: z.boolean(),
  activity: z.array(z.number().int().nonnegative()).max(12),
});
export type Contributor = z.infer<typeof ContributorSchema>;

export const ContributorSearchQuerySchema = z.object({
  org: z.string().trim().max(80).optional(),
  repo: z
    .string()
    .trim()
    .regex(/^[\w.-]+\/[\w.-]+$/)
    .max(140)
    .optional(),
  language: z.string().trim().max(40).optional(),
  topic: z.string().trim().max(60).optional(),
});
export type ContributorSearchQuery = z.infer<typeof ContributorSearchQuerySchema>;

export const ContributorSearchResponseSchema = z.object({
  items: z.array(ContributorSchema),
  cached: z.boolean(),
  fetchedAt: isoDate,
});
export type ContributorSearchResponse = z.infer<typeof ContributorSearchResponseSchema>;

export const ContributorDetailSchema = ContributorSchema.extend({
  bio: z.string().nullable(),
  publicRepos: z.number().int().nonnegative(),
  followers: z.number().int().nonnegative(),
  mergedPullRequests: z.number().int().nonnegative(),
  commits: z.number().int().nonnegative(),
  reviews: z.number().int().nonnegative(),
  expertise: z.array(z.string()),
});
export type ContributorDetail = z.infer<typeof ContributorDetailSchema>;

/* -------------------------------------------------------------------------- */
/* Outreach (FR-18)                                                            */
/* -------------------------------------------------------------------------- */

export const OutreachRequestSchema = z.object({
  id: idSchema,
  sender: z.object({
    id: idSchema,
    name: z.string(),
    handle: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }),
  recipient: z.object({
    id: idSchema,
    name: z.string(),
    handle: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }),
  type: OutreachTypeSchema,
  message: z.string(),
  status: OutreachStatusSchema,
  conversationId: idSchema.nullable(),
  createdAt: isoDate,
  respondedAt: isoDate.nullable(),
});
export type OutreachRequest = z.infer<typeof OutreachRequestSchema>;

export const CreateOutreachSchema = z
  .object({
    recipientId: z.string().min(1),
    type: OutreachTypeSchema,
    message: z.string().trim().min(10).max(500),
  })
  .strict();
export type CreateOutreach = z.infer<typeof CreateOutreachSchema>;

export const RespondOutreachSchema = z
  .object({ action: z.enum(['ACCEPT', 'DECLINE', 'BLOCK']) })
  .strict();
export type RespondOutreach = z.infer<typeof RespondOutreachSchema>;

export const OutreachListSchema = z.object({
  received: z.array(OutreachRequestSchema),
  sent: z.array(OutreachRequestSchema),
});
export type OutreachList = z.infer<typeof OutreachListSchema>;

export const OutreachMessageSchema = z.object({
  id: idSchema,
  senderId: idSchema,
  senderName: z.string(),
  body: z.string(),
  createdAt: isoDate,
});
export type OutreachMessage = z.infer<typeof OutreachMessageSchema>;

export const OutreachConversationSchema = z.object({
  id: idSchema,
  requestId: idSchema,
  messages: z.array(OutreachMessageSchema),
});
export type OutreachConversation = z.infer<typeof OutreachConversationSchema>;

export const SendOutreachMessageSchema = z
  .object({ body: z.string().trim().min(1).max(1000) })
  .strict();
export type SendOutreachMessage = z.infer<typeof SendOutreachMessageSchema>;

/* -------------------------------------------------------------------------- */
/* Admin dashboard (FR-19)                                                     */
/* -------------------------------------------------------------------------- */

export const AdminMetricsSchema = z.object({
  registeredUsers: z.number().int().nonnegative(),
  loggedInUsers: z.number().int().nonnegative(),
  issuesSuggested: z.number().int().nonnegative(),
  issuesRegenerated: z.number().int().nonnegative(),
  statusCounts: z.object({
    inProgress: z.number().int().nonnegative(),
    prOpen: z.number().int().nonnegative(),
    merged: z.number().int().nonnegative(),
    ignored: z.number().int().nonnegative(),
  }),
  capturedAt: isoDate,
  fresh: z.boolean(),
});
export type AdminMetrics = z.infer<typeof AdminMetricsSchema>;

export const AdminUserSchema = z.object({
  id: idSchema,
  name: z.string(),
  email: z.string(),
  role: RoleSchema,
  level: ExperienceLevelSchema.nullable(),
  createdAt: isoDate,
});
export type AdminUser = z.infer<typeof AdminUserSchema>;

export const AdminUsersSchema = z.object({
  items: z.array(AdminUserSchema),
  total: z.number().int().nonnegative(),
});
export type AdminUsers = z.infer<typeof AdminUsersSchema>;
