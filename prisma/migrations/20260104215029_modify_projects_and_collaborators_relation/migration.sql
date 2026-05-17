/*
  Warnings:

  - You are about to drop the column `collabDisplayName` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `collabValuePerHour` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `collabWorkersCount` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `collaboratorId` on the `projects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."projects" DROP CONSTRAINT "projects_collaboratorId_fkey";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "collabDisplayName",
DROP COLUMN "collabValuePerHour",
DROP COLUMN "collabWorkersCount",
DROP COLUMN "collaboratorId";

-- CreateTable
CREATE TABLE "project_collaborators" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "collaboratorId" TEXT NOT NULL,
    "workersCount" INTEGER NOT NULL,
    "hoursCount" DOUBLE PRECISION NOT NULL,
    "valuePerHour" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_collaborators_projectId_collaboratorId_key" ON "project_collaborators"("projectId", "collaboratorId");

-- AddForeignKey
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "collaborators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
