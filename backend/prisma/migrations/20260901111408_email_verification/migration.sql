/*
  Warnings:

  - You are about to drop the column `tokenHash` on the `EmailVerification` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `EmailVerification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `EmailVerification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `EmailVerification` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "EmailVerification_email_verifiedAt_idx";

-- DropIndex
DROP INDEX "EmailVerification_expiresAt_idx";

-- DropIndex
DROP INDEX "EmailVerification_tokenHash_key";

-- AlterTable
ALTER TABLE "EmailVerification" DROP COLUMN "tokenHash",
DROP COLUMN "verifiedAt",
ADD COLUMN     "token" TEXT NOT NULL,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_token_key" ON "EmailVerification"("token");
