-- Notification — database notification_db
-- Owner: Notification service (container notification)
-- Generated from apps/api/prisma/schema.prisma (PM1 per-service split).
-- Rule: only the Notification service writes this database.

\connect notification_db

SET client_encoding = 'UTF8';

-- Types
-- CreateEnum
CREATE TYPE "NotificationFrequency" AS ENUM ('INSTANT', 'DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_MATCH', 'PR_ACTIVITY', 'SAVED_ISSUE_CLOSED', 'BADGE_EARNED', 'OUTREACH_REQUEST', 'OUTREACH_ACCEPTED', 'OUTREACH_MESSAGE', 'SYSTEM');

-- Tables (2)
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

-- Indexes
-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_dedupeKey_key" ON "Notification"("userId", "dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- References owned by other services (no cross-database FK)
--   "Notification" -> "User" ("userId") REFERENCES "User"("id")
--   "NotificationPreference" -> "User" ("userId") REFERENCES "User"("id")
