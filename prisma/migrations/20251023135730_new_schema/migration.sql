/*
  Warnings:

  - A unique constraint covering the columns `[isbn]` on the table `Books` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Books` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Books` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Books` ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `coverImage` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `fileSize` BIGINT NULL,
    ADD COLUMN `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isPublic` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isbn` VARCHAR(191) NULL,
    ADD COLUMN `language` VARCHAR(191) NOT NULL DEFAULT 'English',
    ADD COLUMN `pageCount` INTEGER NULL,
    ADD COLUMN `pdfUrl` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Books_isbn_key` ON `Books`(`isbn`);
