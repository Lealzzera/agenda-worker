ALTER TABLE "plans"
ALTER COLUMN "trial_days" SET DEFAULT 3;

UPDATE "plans"
SET "trial_days" = 3
WHERE "trial_days" = 7;
