-- Admin — database admin_db
-- Owner: Admin service (container admin)
-- Generated from apps/api/prisma/schema.prisma (PM1 per-service split).
-- Rule: only the Admin service writes this database.

\connect admin_db

SET client_encoding = 'UTF8';

-- Types
-- CreateEnum
CREATE TYPE "AiFeature" AS ENUM ('CV_EXTRACTION', 'ISSUE_MATCHING', 'ONBOARDING', 'AI_GUIDE');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'DONE', 'FAILED');

-- Tables (6)
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
CREATE TABLE "SyncState" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "cursor" TEXT,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncState_pkey" PRIMARY KEY ("id")
);

-- Indexes
-- CreateIndex
CREATE INDEX "AiUsage_userId_createdAt_idx" ON "AiUsage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AiUsage_feature_createdAt_idx" ON "AiUsage"("feature", "createdAt");

-- CreateIndex
CREATE INDEX "AiUsageDaily_day_idx" ON "AiUsageDaily"("day");

-- CreateIndex
CREATE UNIQUE INDEX "AiUsageDaily_day_feature_key" ON "AiUsageDaily"("day", "feature");

-- CreateIndex
CREATE INDEX "AdminSnapshot_capturedAt_idx" ON "AdminSnapshot"("capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobRun_key_key" ON "JobRun"("key");

-- CreateIndex
CREATE INDEX "JobRun_status_idx" ON "JobRun"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SyncState_scope_key" ON "SyncState"("scope");

-- References owned by other services (no cross-database FK)
--   "AiSetting" -> "User" ("updatedById") REFERENCES "User"("id")
--   "AiUsage" -> "User" ("userId") REFERENCES "User"("id")
