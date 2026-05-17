/*
  Warnings:

  - You are about to drop the column `stripe_customer_id` on the `subscriptions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripe_customer_id]` on the table `clinics` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "subscriptions_stripe_customer_id_idx";

-- AlterTable
ALTER TABLE "clinics" ADD COLUMN     "stripe_customer_id" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "stripe_customer_id";

-- CreateIndex
CREATE UNIQUE INDEX "clinics_stripe_customer_id_key" ON "clinics"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "clinics_stripe_customer_id_idx" ON "clinics"("stripe_customer_id");
