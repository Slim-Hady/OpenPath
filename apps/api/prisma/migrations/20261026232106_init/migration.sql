-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DEVELOPER', 'MAINTAINER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "CvStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AiFeature" AS ENUM ('CV_EXTRACTION', 'ISSUE_MATCHING', 'ONBOARDING', 'AI_GUIDE');

-- CreateEnum
CREATE TYPE "SuggestionKind" AS ENUM ('SUGGESTED', 'REGENERATED');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('IN_PROGRESS', 'PR_OPEN', 'MERGED', 'IGNORED', 'PAUSED');

-- CreateEnum
CREATE TYPE "ProgressSource" AS ENUM ('MANUAL', 'SYNC');

-- CreateEnum
CREATE TYPE "SavedIssueState" AS ENUM ('OPEN', 'CLOSED', 'TAKEN', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_MATCH', 'PR_ACTIVITY', 'SAVED_ISSUE_CLOSED', 'BADGE_EARNED', 'OUTREACH_REQUEST', 'OUTREACH_ACCEPTED', 'OUTREACH_MESSAGE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationFrequency" AS ENUM ('INSTANT', 'DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "OutreachType" AS ENUM ('MENTORSHIP', 'RECRUITMENT');

-- CreateEnum
CREATE TYPE "OutreachStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "authId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'DEVELOPER',
    "githubLogin" TEXT,
    "githubTokenEnc" TEXT,
    "githubConnectedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT,
    "experienceLevel" "ExperienceLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkill" (
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',

    CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("userId","skillId")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLanguage" (
    "userId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',

    CONSTRAINT "UserLanguage_pkey" PRIMARY KEY ("userId","languageId")
);

-- CreateTable
CREATE TABLE "CvFile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "status" "CvStatus" NOT NULL DEFAULT 'PENDING',
    "extracted" JSONB,
    "rawText" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSetting" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "maxTokensPerUser" INTEGER NOT NULL DEFAULT 20000,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.4,
    "usageLimitUsd" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" "AiFeature" NOT NULL,
    "model" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiUsageDaily" (
    "id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "feature" "AiFeature" NOT NULL,
    "requests" INTEGER NOT NULL DEFAULT 0,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiUsageDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuggestionEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "kind" "SuggestionKind" NOT NULL,
    "batchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuggestionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GithubIssue" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "repoFullName" TEXT NOT NULL,
    "organization" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "url" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'open',
    "labels" TEXT[],
    "language" TEXT,
    "level" "ExperienceLevel",
    "assigned" BOOLEAN NOT NULL DEFAULT false,
    "repoDescription" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "defaultBranch" TEXT,
    "repoUpdatedAt" TIMESTAMP(3),
    "activityAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GithubIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "fallback" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Selection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "prUrl" TEXT,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),

    CONSTRAINT "Selection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressEvent" (
    "id" TEXT NOT NULL,
    "selectionId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL,
    "source" "ProgressSource" NOT NULL,
    "prUrl" TEXT,
    "note" TEXT,
    "dedupeKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IgnoredIssue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IgnoredIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "issueId" TEXT,
    "repoFullName" TEXT,
    "state" "SavedIssueState" NOT NULL DEFAULT 'UNKNOWN',
    "flaggedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepositoryOnboarding" (
    "id" TEXT NOT NULL,
    "repoFullName" TEXT NOT NULL,
    "commitSha" TEXT,
    "overview" TEXT NOT NULL,
    "structure" TEXT NOT NULL,
    "technologies" TEXT[],
    "firstFiles" JSONB NOT NULL,
    "setup" TEXT[],
    "run" TEXT[],
    "test" TEXT[],
    "branchGuidance" TEXT[],
    "contributing" TEXT,
    "prGuidance" TEXT[],
    "generatedFrom" TEXT NOT NULL,
    "sourceUpdatedAt" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepositoryOnboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueOnboarding" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "relatedFiles" JSONB NOT NULL,
    "researchTopics" TEXT[],
    "resources" JSONB NOT NULL,
    "generatedFrom" TEXT NOT NULL,
    "sourceUpdatedAt" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IssueOnboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "guardrailOutcome" TEXT,
    "tokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "readAt" TIMESTAMP(3),
    "dedupeKey" TEXT,
    "emailedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channels" TEXT[] DEFAULT ARRAY['IN_APP']::TEXT[],
    "frequency" "NotificationFrequency" NOT NULL DEFAULT 'INSTANT',
    "eventTypes" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "target" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publicVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("userId","badgeId")
);

-- CreateTable
CREATE TABLE "Streak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "longest" INTEGER NOT NULL DEFAULT 0,
    "lastActivityOn" DATE,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Streak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "mentorOptIn" BOOLEAN NOT NULL DEFAULT false,
    "showSkills" BOOLEAN NOT NULL DEFAULT true,
    "showContributions" BOOLEAN NOT NULL DEFAULT true,
    "showBadges" BOOLEAN NOT NULL DEFAULT true,
    "showStreak" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "OutreachType" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "OutreachStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "OutreachRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachConversation" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutreachConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutreachMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedUser" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningResource" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'GUIDE',
    "externalUrl" TEXT,
    "readingMinutes" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSnapshot" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRun" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeletionRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "DeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncState" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "cursor" TEXT,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_authId_key" ON "User"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_lastSeenAt_idx" ON "User"("lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperProfile_userId_key" ON "DeveloperProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "UserSkill_skillId_idx" ON "UserSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

-- CreateIndex
CREATE INDEX "UserLanguage_languageId_idx" ON "UserLanguage"("languageId");

-- CreateIndex
CREATE INDEX "CvFile_userId_createdAt_idx" ON "CvFile"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CvFile_status_idx" ON "CvFile"("status");

-- CreateIndex
CREATE INDEX "AiUsage_userId_createdAt_idx" ON "AiUsage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AiUsage_feature_createdAt_idx" ON "AiUsage"("feature", "createdAt");

-- CreateIndex
CREATE INDEX "AiUsageDaily_day_idx" ON "AiUsageDaily"("day");

-- CreateIndex
CREATE UNIQUE INDEX "AiUsageDaily_day_feature_key" ON "AiUsageDaily"("day", "feature");

-- CreateIndex
CREATE INDEX "SuggestionEvent_userId_createdAt_idx" ON "SuggestionEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SuggestionEvent_kind_createdAt_idx" ON "SuggestionEvent"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "GithubIssue_repoFullName_idx" ON "GithubIssue"("repoFullName");

-- CreateIndex
CREATE INDEX "GithubIssue_language_state_activityAt_idx" ON "GithubIssue"("language", "state", "activityAt");

-- CreateIndex
CREATE INDEX "GithubIssue_organization_idx" ON "GithubIssue"("organization");

-- CreateIndex
CREATE INDEX "GithubIssue_level_idx" ON "GithubIssue"("level");

-- CreateIndex
CREATE UNIQUE INDEX "GithubIssue_repoFullName_number_key" ON "GithubIssue"("repoFullName", "number");

-- CreateIndex
CREATE INDEX "Recommendation_userId_createdAt_idx" ON "Recommendation"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_batchId_issueId_key" ON "Recommendation"("batchId", "issueId");

-- CreateIndex
CREATE INDEX "Selection_userId_status_idx" ON "Selection"("userId", "status");

-- CreateIndex
CREATE INDEX "Selection_status_lastSyncedAt_idx" ON "Selection"("status", "lastSyncedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Selection_userId_issueId_key" ON "Selection"("userId", "issueId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgressEvent_dedupeKey_key" ON "ProgressEvent"("dedupeKey");

-- CreateIndex
CREATE INDEX "ProgressEvent_selectionId_createdAt_idx" ON "ProgressEvent"("selectionId", "createdAt");

-- CreateIndex
CREATE INDEX "IgnoredIssue_userId_idx" ON "IgnoredIssue"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "IgnoredIssue_userId_issueId_key" ON "IgnoredIssue"("userId", "issueId");

-- CreateIndex
CREATE INDEX "SavedList_userId_idx" ON "SavedList"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedList_userId_name_key" ON "SavedList"("userId", "name");

-- CreateIndex
CREATE INDEX "SavedItem_userId_idx" ON "SavedItem"("userId");

-- CreateIndex
CREATE INDEX "SavedItem_issueId_idx" ON "SavedItem"("issueId");

-- CreateIndex
CREATE INDEX "SavedItem_state_idx" ON "SavedItem"("state");

-- CreateIndex
CREATE UNIQUE INDEX "SavedItem_listId_issueId_key" ON "SavedItem"("listId", "issueId");

-- CreateIndex
CREATE INDEX "RepositoryOnboarding_repoFullName_idx" ON "RepositoryOnboarding"("repoFullName");

-- CreateIndex
CREATE UNIQUE INDEX "RepositoryOnboarding_repoFullName_commitSha_key" ON "RepositoryOnboarding"("repoFullName", "commitSha");

-- CreateIndex
CREATE UNIQUE INDEX "IssueOnboarding_issueId_key" ON "IssueOnboarding"("issueId");

-- CreateIndex
CREATE INDEX "ChatConversation_userId_idx" ON "ChatConversation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatConversation_userId_issueId_key" ON "ChatConversation"("userId", "issueId");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_createdAt_idx" ON "ChatMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_dedupeKey_key" ON "Notification"("userId", "dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_code_key" ON "Badge"("code");

-- CreateIndex
CREATE INDEX "UserBadge_badgeId_idx" ON "UserBadge"("badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "Streak_userId_key" ON "Streak"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PublicProfile_userId_key" ON "PublicProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PublicProfile_handle_key" ON "PublicProfile"("handle");

-- CreateIndex
CREATE INDEX "PublicProfile_mentorOptIn_published_idx" ON "PublicProfile"("mentorOptIn", "published");

-- CreateIndex
CREATE INDEX "OutreachRequest_recipientId_status_idx" ON "OutreachRequest"("recipientId", "status");

-- CreateIndex
CREATE INDEX "OutreachRequest_senderId_createdAt_idx" ON "OutreachRequest"("senderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OutreachConversation_requestId_key" ON "OutreachConversation"("requestId");

-- CreateIndex
CREATE INDEX "OutreachMessage_conversationId_createdAt_idx" ON "OutreachMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "BlockedUser_blockedId_idx" ON "BlockedUser"("blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedUser_blockerId_blockedId_key" ON "BlockedUser"("blockerId", "blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningResource_slug_key" ON "LearningResource"("slug");

-- CreateIndex
CREATE INDEX "LearningResource_topic_idx" ON "LearningResource"("topic");

-- CreateIndex
CREATE INDEX "AdminSnapshot_capturedAt_idx" ON "AdminSnapshot"("capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobRun_key_key" ON "JobRun"("key");

-- CreateIndex
CREATE INDEX "JobRun_status_idx" ON "JobRun"("status");

-- CreateIndex
CREATE INDEX "DeletionRequest_userId_idx" ON "DeletionRequest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SyncState_scope_key" ON "SyncState"("scope");

-- AddForeignKey
ALTER TABLE "DeveloperProfile" ADD CONSTRAINT "DeveloperProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLanguage" ADD CONSTRAINT "UserLanguage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLanguage" ADD CONSTRAINT "UserLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvFile" ADD CONSTRAINT "CvFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSetting" ADD CONSTRAINT "AiSetting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuggestionEvent" ADD CONSTRAINT "SuggestionEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuggestionEvent" ADD CONSTRAINT "SuggestionEvent_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "GithubIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "GithubIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Selection" ADD CONSTRAINT "Selection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Selection" ADD CONSTRAINT "Selection_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "GithubIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressEvent" ADD CONSTRAINT "ProgressEvent_selectionId_fkey" FOREIGN KEY ("selectionId") REFERENCES "Selection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IgnoredIssue" ADD CONSTRAINT "IgnoredIssue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IgnoredIssue" ADD CONSTRAINT "IgnoredIssue_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "GithubIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedList" ADD CONSTRAINT "SavedList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedItem" ADD CONSTRAINT "SavedItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "SavedList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedItem" ADD CONSTRAINT "SavedItem_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "GithubIssue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueOnboarding" ADD CONSTRAINT "IssueOnboarding_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "GithubIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Streak" ADD CONSTRAINT "Streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicProfile" ADD CONSTRAINT "PublicProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachRequest" ADD CONSTRAINT "OutreachRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachRequest" ADD CONSTRAINT "OutreachRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachConversation" ADD CONSTRAINT "OutreachConversation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "OutreachRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachMessage" ADD CONSTRAINT "OutreachMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "OutreachConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachMessage" ADD CONSTRAINT "OutreachMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedUser" ADD CONSTRAINT "BlockedUser_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedUser" ADD CONSTRAINT "BlockedUser_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletionRequest" ADD CONSTRAINT "DeletionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
