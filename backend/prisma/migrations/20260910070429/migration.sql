-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "locale" TEXT DEFAULT 'en-US',
    "decimalDigits" INTEGER NOT NULL DEFAULT 2,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE INDEX "Notification_companyId_idx" ON "Notification"("companyId");

-- CreateIndex
CREATE INDEX "Currency_active_idx" ON "Currency"("active");

-- CreateIndex
CREATE INDEX "Currency_sortOrder_idx" ON "Currency"("sortOrder");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
