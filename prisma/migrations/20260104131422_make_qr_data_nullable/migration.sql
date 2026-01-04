/*
  Warnings:

  - You are about to drop the `TravelPass` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `TravelPass` DROP FOREIGN KEY `TravelPass_journeyId_fkey`;

-- AlterTable
ALTER TABLE `LegTravelPass` MODIFY `qrData` LONGTEXT NULL;

-- DropTable
DROP TABLE `TravelPass`;
