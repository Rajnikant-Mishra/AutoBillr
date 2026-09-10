/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `EmailVerification` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "EmailVerification_email_key";

-- AlterTable
ALTER TABLE "EmailVerification" DROP COLUMN "updatedAt";

-- CreateIndex
CREATE INDEX "EmailVerification_email_verifiedAt_idx" ON "EmailVerification"("email", "verifiedAt");
