-- CreateTable
CREATE TABLE `UserAccessibilityProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `wheelchair` BOOLEAN NOT NULL DEFAULT false,
    `blind` BOOLEAN NOT NULL DEFAULT false,
    `deaf` BOOLEAN NOT NULL DEFAULT false,
    `cognitive` BOOLEAN NOT NULL DEFAULT false,
    `fatigue` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserAccessibilityProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserAccessibilityProfile` ADD CONSTRAINT `UserAccessibilityProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
