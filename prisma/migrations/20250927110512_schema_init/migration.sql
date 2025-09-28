/*
  Warnings:

  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - Added the required column `fristName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `firstName`,
    ADD COLUMN `fristName` VARCHAR(191) NOT NULL;
