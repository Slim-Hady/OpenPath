-- Mentor Network — database mentor_network_db
-- Owner: Mentor Network service (container mentor-network)
-- Generated from apps/api/prisma/schema.prisma (PM1 per-service split).
-- Rule: only the Mentor Network service writes this database.

\connect mentor_network_db

SET client_encoding = 'UTF8';

-- Types
-- CreateEnum
CREATE TYPE "OutreachStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "OutreachType" AS ENUM ('MENTORSHIP', 'RECRUITMENT');

-- Tables (4)
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

-- Indexes
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

-- Foreign keys inside this database
-- AddForeignKey
ALTER TABLE "OutreachConversation" ADD CONSTRAINT "OutreachConversation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "OutreachRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachMessage" ADD CONSTRAINT "OutreachMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "OutreachConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- References owned by other services (no cross-database FK)
--   "OutreachRequest" -> "User" ("senderId") REFERENCES "User"("id")
--   "OutreachRequest" -> "User" ("recipientId") REFERENCES "User"("id")
--   "OutreachMessage" -> "User" ("senderId") REFERENCES "User"("id")
--   "BlockedUser" -> "User" ("blockerId") REFERENCES "User"("id")
--   "BlockedUser" -> "User" ("blockedId") REFERENCES "User"("id")
