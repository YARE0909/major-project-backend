-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Journey` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` ENUM('PLANNED', 'BOOKED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
    `totalCost` DOUBLE NULL,
    `totalTime` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JourneyLeg` (
    `id` VARCHAR(191) NOT NULL,
    `journeyId` VARCHAR(191) NOT NULL,
    `mode` ENUM('METRO', 'BUS', 'AUTO', 'CAB', 'TRAIN', 'WALK') NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `cost` DOUBLE NOT NULL,
    `duration` INTEGER NOT NULL,
    `order` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` VARCHAR(191) NOT NULL,
    `journeyId` VARCHAR(191) NOT NULL,
    `status` ENUM('SUCCESS', 'FAILED', 'PENDING') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Booking_journeyId_key`(`journeyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TravelPass` (
    `id` VARCHAR(191) NOT NULL,
    `journeyId` VARCHAR(191) NOT NULL,
    `validFrom` DATETIME(3) NOT NULL,
    `validTill` DATETIME(3) NOT NULL,
    `qrData` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TravelPass_journeyId_key`(`journeyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Journey` ADD CONSTRAINT `Journey_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JourneyLeg` ADD CONSTRAINT `JourneyLeg_journeyId_fkey` FOREIGN KEY (`journeyId`) REFERENCES `Journey`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_journeyId_fkey` FOREIGN KEY (`journeyId`) REFERENCES `Journey`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TravelPass` ADD CONSTRAINT `TravelPass_journeyId_fkey` FOREIGN KEY (`journeyId`) REFERENCES `Journey`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
