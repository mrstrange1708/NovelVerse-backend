-- Add ReadingProgress table
CREATE TABLE IF NOT EXISTS `ReadingProgress` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `bookId` VARCHAR(191) NOT NULL,
    `currentPage` INTEGER NOT NULL,
    `totalPages` INTEGER NOT NULL,
    `progressPercent` DOUBLE NOT NULL,
    `lastReadAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,

    UNIQUE INDEX `ReadingProgress_userId_bookId_key`(`userId`, `bookId`),
    INDEX `ReadingProgress_userId_idx`(`userId`),
    INDEX `ReadingProgress_lastReadAt_idx`(`lastReadAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add ReadingStreak table
CREATE TABLE IF NOT EXISTS `ReadingStreak` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `pagesRead` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ReadingStreak_userId_date_key`(`userId`, `date`),
    INDEX `ReadingStreak_userId_date_idx`(`userId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key constraints for ReadingProgress
ALTER TABLE `ReadingProgress` 
ADD CONSTRAINT `ReadingProgress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT `ReadingProgress_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Books`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add foreign key constraint for ReadingStreak
ALTER TABLE `ReadingStreak` 
ADD CONSTRAINT `ReadingStreak_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
