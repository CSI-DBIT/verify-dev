/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `EventCategory` table. All the data in the column will be lost.
  - You are about to drop the column `alternatePhoneNo` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `birthday` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `occupation` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `alternatePhoneNo` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `chatRoomId` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Participant` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `Participant` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `SocialUrl` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Certificate" (
    "certificateId" TEXT NOT NULL PRIMARY KEY,
    "certificateCode" TEXT NOT NULL,
    "certificateUrl" TEXT,
    "issuedAt" DATETIME,
    "participantId" TEXT,
    "memberId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Certificate_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("participantId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Certificate_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("memberId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Certificate" ("certificateCode", "certificateId", "certificateUrl", "createdAt", "issuedAt", "memberId", "participantId", "updatedAt") SELECT "certificateCode", "certificateId", "certificateUrl", "createdAt", "issuedAt", "memberId", "participantId", "updatedAt" FROM "Certificate";
DROP TABLE "Certificate";
ALTER TABLE "new_Certificate" RENAME TO "Certificate";
CREATE UNIQUE INDEX "Certificate_certificateCode_key" ON "Certificate"("certificateCode");
CREATE UNIQUE INDEX "Certificate_participantId_key" ON "Certificate"("participantId");
CREATE TABLE "new_Event" (
    "eventId" TEXT NOT NULL PRIMARY KEY,
    "eventName" TEXT NOT NULL,
    "description" TEXT,
    "eventPoster" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "pointsRequired" INTEGER,
    "eventDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "attachmentUrl" TEXT,
    "reportUrl" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("orgId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("attachmentUrl", "category", "createdAt", "description", "eventDate", "eventId", "eventName", "eventPoster", "organizationId", "pointsRequired", "reportUrl", "status", "type", "updatedAt") SELECT "attachmentUrl", "category", "createdAt", "description", "eventDate", "eventId", "eventName", "eventPoster", "organizationId", "pointsRequired", "reportUrl", "status", "type", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_eventDate_idx" ON "Event"("eventDate");
CREATE INDEX "Event_organizationId_idx" ON "Event"("organizationId");
CREATE TABLE "new_EventCategory" (
    "categoryId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "EventCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("orgId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EventCategory" ("categoryId", "createdAt", "name", "organizationId", "updatedAt") SELECT "categoryId", "createdAt", "name", "organizationId", "updatedAt" FROM "EventCategory";
DROP TABLE "EventCategory";
ALTER TABLE "new_EventCategory" RENAME TO "EventCategory";
CREATE UNIQUE INDEX "EventCategory_name_organizationId_key" ON "EventCategory"("name", "organizationId");
CREATE TABLE "new_Member" (
    "memberId" TEXT NOT NULL PRIMARY KEY,
    "memberName" TEXT NOT NULL,
    "about" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "gender" TEXT,
    "phoneNo" TEXT,
    "memberImg" TEXT,
    "birthdate" DATETIME,
    "country" TEXT,
    "loyaltyCredits" INTEGER NOT NULL DEFAULT 1000,
    "feedbackCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "refreshToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Member" ("about", "commentsCount", "country", "createdAt", "email", "emailVerified", "feedbackCount", "gender", "loyaltyCredits", "memberId", "memberImg", "memberName", "password", "phoneNo", "refreshToken", "updatedAt") SELECT "about", "commentsCount", "country", "createdAt", "email", "emailVerified", "feedbackCount", "gender", "loyaltyCredits", "memberId", "memberImg", "memberName", "password", "phoneNo", "refreshToken", "updatedAt" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
CREATE TABLE "new_Membership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "isFavourite" BOOLEAN NOT NULL DEFAULT false,
    "memberId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Membership_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("memberId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("orgId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Membership" ("createdAt", "id", "isFavourite", "memberId", "organizationId", "role", "startDate", "status", "updatedAt") SELECT "createdAt", "id", "isFavourite", "memberId", "organizationId", "role", "startDate", "status", "updatedAt" FROM "Membership";
DROP TABLE "Membership";
ALTER TABLE "new_Membership" RENAME TO "Membership";
CREATE TABLE "new_Notification" (
    "notificationId" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "memberId" TEXT,
    "organizationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Notification_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("memberId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("orgId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("createdAt", "isRead", "memberId", "message", "notificationId", "organizationId", "type", "updatedAt") SELECT "createdAt", "isRead", "memberId", "message", "notificationId", "organizationId", "type", "updatedAt" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE TABLE "new_Organization" (
    "orgId" TEXT NOT NULL PRIMARY KEY,
    "orgName" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FREE_FOR_ALL',
    "category" TEXT NOT NULL,
    "logo" TEXT,
    "address" TEXT,
    "phoneNo" TEXT,
    "startDate" DATETIME NOT NULL,
    "reputationCredits" INTEGER NOT NULL DEFAULT 1000,
    "refreshToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Organization" ("address", "category", "createdAt", "description", "email", "emailVerified", "logo", "orgId", "orgName", "password", "phoneNo", "refreshToken", "reputationCredits", "startDate", "type", "updatedAt") SELECT "address", "category", "createdAt", "description", "email", "emailVerified", "logo", "orgId", "orgName", "password", "phoneNo", "refreshToken", "reputationCredits", "startDate", "type", "updatedAt" FROM "Organization";
DROP TABLE "Organization";
ALTER TABLE "new_Organization" RENAME TO "Organization";
CREATE UNIQUE INDEX "Organization_email_key" ON "Organization"("email");
CREATE INDEX "Organization_email_idx" ON "Organization"("email");
CREATE TABLE "new_Participant" (
    "participantId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "gender" TEXT,
    "phoneNo" TEXT,
    "address" TEXT,
    "registeredAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "type" TEXT NOT NULL,
    "isMember" BOOLEAN NOT NULL,
    "memberId" TEXT,
    "eventId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Participant_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("memberId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Participant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("eventId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Participant" ("address", "createdAt", "email", "eventId", "gender", "isMember", "memberId", "name", "participantId", "phoneNo", "registeredAt", "status", "type", "updatedAt") SELECT "address", "createdAt", "email", "eventId", "gender", "isMember", "memberId", "name", "participantId", "phoneNo", "registeredAt", "status", "type", "updatedAt" FROM "Participant";
DROP TABLE "Participant";
ALTER TABLE "new_Participant" RENAME TO "Participant";
CREATE INDEX "Participant_eventId_idx" ON "Participant"("eventId");
CREATE INDEX "Participant_email_idx" ON "Participant"("email");
CREATE UNIQUE INDEX "Participant_email_eventId_key" ON "Participant"("email", "eventId");
CREATE TABLE "new_SocialUrl" (
    "urlId" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "organizationId" TEXT,
    "memberId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SocialUrl_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("orgId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SocialUrl_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("memberId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SocialUrl" ("createdAt", "memberId", "organizationId", "platform", "updatedAt", "url", "urlId") SELECT "createdAt", "memberId", "organizationId", "platform", "updatedAt", "url", "urlId" FROM "SocialUrl";
DROP TABLE "SocialUrl";
ALTER TABLE "new_SocialUrl" RENAME TO "SocialUrl";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
