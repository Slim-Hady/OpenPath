-- Issue Search — database issue_search_db
-- Owner: Issue Search service (container issue-search)
-- Generated from apps/api/prisma/schema.prisma (PM1 per-service split).
-- Rule: only the Issue Search service writes this database.

\connect issue_search_db

SET client_encoding = 'UTF8';

-- Types
-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "SuggestionKind" AS ENUM ('SUGGESTED', 'REGENERATED');

-- Tables (3)
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
CREATE TABLE "SuggestionEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "kind" "SuggestionKind" NOT NULL,
    "batchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuggestionEvent_pkey" PRIMARY KEY ("id")
);

-- Indexes
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

-- Foreign keys inside this database
-- AddForeignKey
ALTER TABLE "SuggestionEvent" ADD CONSTRAINT "SuggestionEvent_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "GithubIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "GithubIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- References owned by other services (no cross-database FK)
--   "SuggestionEvent" -> "User" ("userId") REFERENCES "User"("id")
--   "Recommendation" -> "User" ("userId") REFERENCES "User"("id")
