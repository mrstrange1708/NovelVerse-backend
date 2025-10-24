/*
  Warnings:

  - You are about to drop the column `isPublic` on the `Books` table. All the data in the column will be lost.
  - You are about to drop the column `isbn` on the `Books` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Books_isbn_key` ON `Books`;

-- AlterTable
ALTER TABLE `Books` DROP COLUMN `isPublic`,
    DROP COLUMN `isbn`;
