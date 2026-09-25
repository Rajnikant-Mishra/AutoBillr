/*
  Warnings:

  - You are about to drop the column `automation` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `mrr` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `nextInvoice` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `paymentTerms` on the `Client` table. All the data in the column will be lost.
  - The `status` column on the `Client` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `interval` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Plan` table. All the data in the column will be lost.
  - You are about to alter the column `budget` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `billed` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - The `billingMethod` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'PENDING', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL', 'FORTNIGHTLY');

-- CreateEnum
CREATE TYPE "PaymentTerms" AS ENUM ('DUE_ON_RECEIPT', 'NET_15', 'NET_30', 'NET_60');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ACH', 'CARD', 'WIRE', 'CHECK');

-- CreateEnum
CREATE TYPE "BillingRateType" AS ENUM ('FIXED', 'RECURRING');

-- CreateEnum
CREATE TYPE "RecurringStatus" AS ENUM ('ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "ProjectBillingMethod" AS ENUM ('FIXED_FEE', 'MILESTONE', 'HOURLY', 'RETAINER');

-- CreateEnum
CREATE TYPE "TeamMemberStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- DropIndex
DROP INDEX "Client_email_idx";

-- DropIndex
DROP INDEX "Client_status_idx";

-- DropIndex
DROP INDEX "Milestone_dueDate_idx";

-- DropIndex
DROP INDEX "Milestone_status_idx";

-- DropIndex
DROP INDEX "Project_status_idx";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "automation",
DROP COLUMN "currency",
DROP COLUMN "mrr",
DROP COLUMN "nextInvoice",
DROP COLUMN "paymentMethod",
DROP COLUMN "paymentTerms",
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "portalAccess" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "welcomeEmail" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "status",
ADD COLUMN     "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "brandColor" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "showFooter" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showQr" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showThumbnails" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "interval",
DROP COLUMN "price",
ADD COLUMN     "invoiceLimit" INTEGER,
ADD COLUMN     "monthlyPrice" DECIMAL(10,2),
ADD COLUMN     "trialDays" INTEGER NOT NULL DEFAULT 14,
ADD COLUMN     "yearlyPrice" DECIMAL(10,2),
ALTER COLUMN "currency" SET DEFAULT 'INR';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "autoCharge" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "billingCycle" "BillingCycle",
ADD COLUMN     "billingRate" DECIMAL(15,2),
ADD COLUMN     "billingRateType" "BillingRateType" NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nextBillingDate" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "paymentTerms" "PaymentTerms" NOT NULL DEFAULT 'NET_30',
ADD COLUMN     "recurringAmount" DECIMAL(15,2),
ADD COLUMN     "recurringEndDate" TIMESTAMP(3),
ADD COLUMN     "recurringStartDate" TIMESTAMP(3),
ADD COLUMN     "recurringStatus" "RecurringStatus",
ALTER COLUMN "budget" DROP NOT NULL,
ALTER COLUMN "budget" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "billed" SET DATA TYPE DECIMAL(15,2),
DROP COLUMN "billingMethod",
ADD COLUMN     "billingMethod" "ProjectBillingMethod" NOT NULL DEFAULT 'FIXED_FEE',
ALTER COLUMN "autoInvoice" SET DEFAULT true,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "SubscriptionPayment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PAID',
    "paymentMethod" TEXT NOT NULL DEFAULT 'TEST_CARD',
    "transactionId" TEXT NOT NULL,
    "cardLast4" TEXT,
    "cardBrand" TEXT,
    "isTest" BOOLEAN NOT NULL DEFAULT true,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT,
    "status" "TeamMemberStatus" NOT NULL DEFAULT 'PENDING',
    "channels" TEXT[],
    "whatsapp" TEXT,
    "github" TEXT,
    "discord" TEXT,
    "invitationToken" TEXT,
    "invitationMessage" TEXT,
    "invitedById" TEXT,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPayment_transactionId_key" ON "SubscriptionPayment"("transactionId");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_companyId_idx" ON "SubscriptionPayment"("companyId");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_subscriptionId_idx" ON "SubscriptionPayment"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_planId_idx" ON "SubscriptionPayment"("planId");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_status_idx" ON "SubscriptionPayment"("status");

-- CreateIndex
CREATE INDEX "Role_companyId_idx" ON "Role"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_companyId_name_key" ON "Role"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_invitationToken_key" ON "TeamMember"("invitationToken");

-- CreateIndex
CREATE INDEX "TeamMember_companyId_idx" ON "TeamMember"("companyId");

-- CreateIndex
CREATE INDEX "TeamMember_companyId_status_idx" ON "TeamMember"("companyId", "status");

-- CreateIndex
CREATE INDEX "TeamMember_companyId_role_idx" ON "TeamMember"("companyId", "role");

-- CreateIndex
CREATE INDEX "TeamMember_invitationToken_idx" ON "TeamMember"("invitationToken");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_companyId_email_key" ON "TeamMember"("companyId", "email");

-- CreateIndex
CREATE INDEX "Client_companyId_status_idx" ON "Client"("companyId", "status");

-- CreateIndex
CREATE INDEX "Client_companyId_email_idx" ON "Client"("companyId", "email");

-- CreateIndex
CREATE INDEX "Client_companyId_name_idx" ON "Client"("companyId", "name");

-- CreateIndex
CREATE INDEX "Client_companyId_createdAt_idx" ON "Client"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "Project_companyId_createdAt_idx" ON "Project"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Project_companyId_status_idx" ON "Project"("companyId", "status");

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
