/*
  Warnings:

  - Made the column `booksRead` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `password` VARCHAR(191) NULL,
    MODIFY `booksRead` INTEGER NOT NULL DEFAULT 0;
