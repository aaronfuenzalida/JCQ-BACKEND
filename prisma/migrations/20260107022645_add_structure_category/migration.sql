/*
  Warnings:

  - You are about to drop the column `category` on the `Structure` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Structure` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Structure" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."StructureCategory";

-- CreateTable
CREATE TABLE "structure_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "structure_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Structure_categoryId_idx" ON "Structure"("categoryId");

-- AddForeignKey
ALTER TABLE "Structure" ADD CONSTRAINT "Structure_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "structure_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
