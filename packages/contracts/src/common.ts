import { z } from 'zod';

export const RoleSchema = z.enum(['DEVELOPER', 'MAINTAINER', 'ADMIN']);
export type Role = z.infer<typeof RoleSchema>;

export const ExperienceLevelSchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
export type ExperienceLevel = z.infer<typeof ExperienceLevelSchema>;

export const ProgressStatusSchema = z.enum(['IN_PROGRESS', 'PR_OPEN', 'MERGED', 'IGNORED', 'PAUSED']);
export type ProgressStatus = z.infer<typeof ProgressStatusSchema>;

export const ProgressSourceSchema = z.enum(['MANUAL', 'SYNC']);
export type ProgressSource = z.infer<typeof ProgressSourceSchema>;

export const AiFeatureSchema = z.enum(['CV_EXTRACTION', 'ISSUE_MATCHING', 'ONBOARDING', 'AI_GUIDE']);
export type AiFeature = z.infer<typeof AiFeatureSchema>;

export const NotificationTypeSchema = z.enum([
  'NEW_MATCH',
  'PR_ACTIVITY',
  'SAVED_ISSUE_CLOSED',
  'BADGE_EARNED',
  'OUTREACH_REQUEST',
  'OUTREACH_ACCEPTED',
  'OUTREACH_MESSAGE',
  'SYSTEM',
]);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationFrequencySchema = z.enum(['INSTANT', 'DAILY', 'WEEKLY']);
export type NotificationFrequency = z.infer<typeof NotificationFrequencySchema>;

export const NotificationChannelSchema = z.enum(['IN_APP', 'EMAIL']);
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;

export const OutreachTypeSchema = z.enum(['MENTORSHIP', 'RECRUITMENT']);
export type OutreachType = z.infer<typeof OutreachTypeSchema>;

export const OutreachStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED']);
export type OutreachStatus = z.infer<typeof OutreachStatusSchema>;

export const isoDate = z.string().min(1);
export const idSchema = z.string().min(1).max(120);

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(500).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const ApiErrorDetailsSchema = z.object({
  field: z.string().optional(),
  message: z.string(),
});

export const ApiErrorSchema = z.object({
  statusCode: z.number().int(),
  code: z.string(),
  message: z.string(),
  requestId: z.string().optional(),
  details: z.array(ApiErrorDetailsSchema).optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const DeletedSchema = z.object({ deleted: z.literal(true) });
export const OkSchema = z.object({ ok: z.literal(true) });

export const GithubRepoRefSchema = z.object({
  owner: z.string().min(1),
  name: z.string().min(1),
});
export type GithubRepoRef = z.infer<typeof GithubRepoRefSchema>;

export const GithubIssueRefSchema = z.object({
  repoFullName: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
  number: z.number().int().positive(),
});
export type GithubIssueRef = z.infer<typeof GithubIssueRefSchema>;

export const issueId = (repoFullName: string, number: number): string => `${repoFullName}#${number}`;

export const toIso = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

export const todayIso = (): string => new Date().toISOString();
