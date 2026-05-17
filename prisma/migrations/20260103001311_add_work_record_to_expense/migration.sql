/*
  Warnings:

  - A unique constraint covering the columns `[workRecordId]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "workRecordId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Expense_workRecordId_key" ON "Expense"("workRecordId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_workRecordId_fkey" FOREIGN KEY ("workRecordId") REFERENCES "WorkRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
