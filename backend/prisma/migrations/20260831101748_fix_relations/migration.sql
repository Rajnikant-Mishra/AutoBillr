/*
  Warnings:

  - You are about to drop the column `billing` on the `Client` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "billing",
ADD COLUMN     "automation" JSONB,
ADD COLUMN     "billingAddress" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "initials" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentTerms" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "stateRegion" TEXT,
ADD COLUMN     "tags" JSONB,
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "tier" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "clientName" TEXT,
    "projectType" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "budget" DOUBLE PRECISION NOT NULL,
    "billed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "billingMethod" TEXT,
    "autoInvoice" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "icon" TEXT,
    "teamMembers" JSONB,
    "members" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_companyId_idx" ON "Project"("companyId");

-- CreateIndex
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Milestone_projectId_idx" ON "Milestone"("projectId");

-- CreateIndex
CREATE INDEX "Milestone_status_idx" ON "Milestone"("status");

-- CreateIndex
CREATE INDEX "Milestone_dueDate_idx" ON "Milestone"("dueDate");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
