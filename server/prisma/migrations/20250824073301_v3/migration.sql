/*
  Warnings:

  - You are about to drop the `_EventToMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `memberId` on the `Certificate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eventName,organizationId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[memberId,organizationId,isDeleted]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "_EventToMember_B_index";

-- DropIndex
DROP INDEX "_EventToMember_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_EventToMember";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_FavouriteEvents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_FavouriteEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "Event" ("eventId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_FavouriteEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "Member" ("memberId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CertificateToMember" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CertificateToMember_A_fkey" FOREIGN KEY ("A") REFERENCES "Certificate" ("certificateId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CertificateToMember_B_fkey" FOREIGN KEY ("B") REFERENCES "Member" ("memberId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Certificate" (
    "certificateId" TEXT NOT NULL PRIMARY KEY,
    "certificateCode" TEXT NOT NULL,
    "certificateUrl" TEXT,
    "issuedAt" DATETIME,
    "participantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Certificate_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("participantId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Certificate" ("certificateCode", "certificateId", "certificateUrl", "createdAt", "isDeleted", "issuedAt", "participantId", "updatedAt") SELECT "certificateCode", "certificateId", "certificateUrl", "createdAt", "isDeleted", "issuedAt", "participantId", "updatedAt" FROM "Certificate";
DROP TABLE "Certificate";
ALTER TABLE "new_Certificate" RENAME TO "Certificate";
CREATE UNIQUE INDEX "Certificate_certificateCode_key" ON "Certificate"("certificateCode");
CREATE UNIQUE INDEX "Certificate_participantId_key" ON "Certificate"("participantId");
CREATE INDEX "Certificate_issuedAt_idx" ON "Certificate"("issuedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_FavouriteEvents_AB_unique" ON "_FavouriteEvents"("A", "B");

-- CreateIndex
CREATE INDEX "_FavouriteEvents_B_index" ON "_FavouriteEvents"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CertificateToMember_AB_unique" ON "_CertificateToMember"("A", "B");

-- CreateIndex
CREATE INDEX "_CertificateToMember_B_index" ON "_CertificateToMember"("B");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventName_organizationId_key" ON "Event"("eventName", "organizationId");

-- CreateIndex
CREATE INDEX "Membership_organizationId_idx" ON "Membership"("organizationId");

-- CreateIndex
CREATE INDEX "Membership_memberId_idx" ON "Membership"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_memberId_organizationId_isDeleted_key" ON "Membership"("memberId", "organizationId", "isDeleted");

-- CreateIndex
CREATE INDEX "Notification_memberId_idx" ON "Notification"("memberId");

-- CreateIndex
CREATE INDEX "Notification_organizationId_idx" ON "Notification"("organizationId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "SocialUrl_platform_url_organizationId_idx" ON "SocialUrl"("platform", "url", "organizationId");

-- CreateIndex
CREATE INDEX "SocialUrl_platform_url_memberId_idx" ON "SocialUrl"("platform", "url", "memberId");
