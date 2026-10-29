-- Contribution Tracking — database contribution_tracking_db
-- Owner: Contribution Tracking service (container contribution-tracking)
-- Generated from apps/api/prisma/schema.prisma (PM1 per-service split).
-- Rule: only the Contribution Tracking service writes this database.

\connect contribution_tracking_db

SET client_encoding = 'UTF8';

-- Types
-- CreateEnum
CREATE TYPE "ProgressSource" AS ENUM ('MANUAL', 'SYNC');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('IN_PROGRESS', 'PR_OPEN', 'MERGED', 'IGNORED', 'PAUSED');

-- CreateEnum
CREATE TYPE "SavedIssueState" AS ENUM ('OPEN', 'CLOSED', 'TAKEN', 'UNKNOWN');

-- Tables (5)
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

-- Indexes
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

-- Foreign keys inside this database
-- AddForeignKey
ALTER TABLE "ProgressEvent" ADD CONSTRAINT "ProgressEvent_selectionId_fkey" FOREIGN KEY ("selectionId") REFERENCES "Selection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedItem" ADD CONSTRAINT "SavedItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "SavedList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- References owned by other services (no cross-database FK)
--   "Selection" -> "User" ("userId") REFERENCES "User"("id")
--   "Selection" -> "GithubIssue" ("issueId") REFERENCES "GithubIssue"("id")
--   "IgnoredIssue" -> "User" ("userId") REFERENCES "User"("id")
--   "IgnoredIssue" -> "GithubIssue" ("issueId") REFERENCES "GithubIssue"("id")
--   "SavedList" -> "User" ("userId") REFERENCES "User"("id")
--   "SavedItem" -> "GithubIssue" ("issueId") REFERENCES "GithubIssue"("id")
