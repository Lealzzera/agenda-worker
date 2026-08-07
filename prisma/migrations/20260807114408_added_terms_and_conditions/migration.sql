-- AlterTable
ALTER TABLE "signup_drafts" ADD COLUMN     "accepted_terms" BOOLEAN;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "accepted_terms" BOOLEAN;
