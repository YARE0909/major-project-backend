/*
  Warnings:

  - A unique constraint covering the columns `[journeyLegId]` on the table `LegTravelPass` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[journeyLegId]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `LegTravelPass_journeyLegId_key` ON `LegTravelPass`(`journeyLegId`);

-- CreateIndex
CREATE UNIQUE INDEX `Ticket_journeyLegId_key` ON `Ticket`(`journeyLegId`);
