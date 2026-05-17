/*
  Warnings:

  - You are about to drop the column `valuePerHour` on the `WorkRecord` table. All the data in the column will be lost.
  - Added the required column `hoursFridayExtra` to the `WorkRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hoursLastWeek` to the `WorkRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hoursMondayExtra` to the `WorkRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hoursSaturdayExtra` to the `WorkRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hoursSundayExtra` to the `WorkRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hoursThursdayExtra` to the `WorkRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hoursTuesdayExtra` to the `WorkRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hoursWednesdayExtra` to the `WorkRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkRecord" DROP COLUMN "valuePerHour",
ADD COLUMN     "hoursFridayExtra" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "hoursLastWeek" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "hoursMondayExtra" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "hoursSaturdayExtra" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "hoursSundayExtra" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "hoursThursdayExtra" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "hoursTuesdayExtra" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "hoursWednesdayExtra" DOUBLE PRECISION NOT NULL;
