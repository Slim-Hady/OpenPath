-- Onboarding & Learning — database onboarding_learning_db
-- Owner: Onboarding & Learning service (container onboarding-learning)
-- Generated from apps/api/prisma/schema.prisma (PM1 per-service split).
-- Rule: only the Onboarding & Learning service writes this database.

\connect onboarding_learning_db

SET client_encoding = 'UTF8';

-- Types


-- Tables (3)
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

-- Indexes
-- CreateIndex
CREATE INDEX "RepositoryOnboarding_repoFullName_idx" ON "RepositoryOnboarding"("repoFullName");

-- CreateIndex
CREATE UNIQUE INDEX "RepositoryOnboarding_repoFullName_commitSha_key" ON "RepositoryOnboarding"("repoFullName", "commitSha");

-- CreateIndex
CREATE UNIQUE INDEX "IssueOnboarding_issueId_key" ON "IssueOnboarding"("issueId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningResource_slug_key" ON "LearningResource"("slug");

-- CreateIndex
CREATE INDEX "LearningResource_topic_idx" ON "LearningResource"("topic");

-- References owned by other services (no cross-database FK)
--   "IssueOnboarding" -> "GithubIssue" ("issueId") REFERENCES "GithubIssue"("id")
