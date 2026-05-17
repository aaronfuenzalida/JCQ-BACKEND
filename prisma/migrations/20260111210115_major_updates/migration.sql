/*
  Warnings:

  - You are about to drop the `Dispatch` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."dispatch_items" DROP CONSTRAINT "dispatch_items_dispatchId_fkey";

-- DropTable
DROP TABLE "public"."Dispatch";

-- CreateTable
CREATE TABLE "dispatches" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "dispatches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dispatches_projectId_idx" ON "dispatches"("projectId");

-- AddForeignKey
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatch_items" ADD CONSTRAINT "dispatch_items_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "dispatches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
