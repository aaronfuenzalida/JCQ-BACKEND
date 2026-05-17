/*
  Warnings:

  - A unique constraint covering the columns `[dispatchNumber]` on the table `dispatches` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "dispatches" ADD COLUMN     "dispatchNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "dispatches_dispatchNumber_key" ON "dispatches"("dispatchNumber");
