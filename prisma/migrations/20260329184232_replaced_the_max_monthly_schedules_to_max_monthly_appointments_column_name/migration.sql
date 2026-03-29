/*
  Warnings:

  - You are about to drop the column `max_monthly_schedules` on the `plans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plans" DROP COLUMN "max_monthly_schedules",
ADD COLUMN     "max_monthly_appointments" INTEGER DEFAULT 50;
