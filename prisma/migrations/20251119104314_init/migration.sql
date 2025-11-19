-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `booksRead` INTEGER NOT NULL DEFAULT 0,
    `firstName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Books` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `publishedAt` DATETIME(3) NULL,
    `category` VARCHAR(191) NOT NULL,
    `coverImage` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fileSize` BIGINT NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `language` VARCHAR(191) NOT NULL DEFAULT 'English',
    `pageCount` INTEGER NULL,
    `pdfUrl` TEXT NULL,
    `manifestUrl` VARCHAR(191) NULL,
    `processed` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Books_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
