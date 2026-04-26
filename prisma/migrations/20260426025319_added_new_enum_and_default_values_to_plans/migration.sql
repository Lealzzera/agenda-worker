-- AlterEnum
ALTER TYPE "ClinicStatus" ADD VALUE 'AWAITING_PAYMENT';

-- AlterTable
ALTER TABLE "clinics" ALTER COLUMN "status" SET DEFAULT 'AWAITING_PAYMENT';

-- AlterTable
ALTER TABLE "plans" ALTER COLUMN "max_users" SET DEFAULT 1,
ALTER COLUMN "max_whatsapp_sessions" SET DEFAULT 1;
