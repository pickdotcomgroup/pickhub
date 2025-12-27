-- Migration: Convert TrainerProfile from individual to organization
-- This migration transforms the TrainerProfile table to use organization fields

-- Step 1: Add new columns with nullable constraints first
ALTER TABLE "TrainerProfile" ADD COLUMN "organizationName" TEXT;
ALTER TABLE "TrainerProfile" ADD COLUMN "organizationType" TEXT;
ALTER TABLE "TrainerProfile" ADD COLUMN "registrationNumber" TEXT;
ALTER TABLE "TrainerProfile" ADD COLUMN "contactPersonName" TEXT;
ALTER TABLE "TrainerProfile" ADD COLUMN "contactPersonRole" TEXT;
ALTER TABLE "TrainerProfile" ADD COLUMN "contactEmail" TEXT;
ALTER TABLE "TrainerProfile" ADD COLUMN "contactPhone" TEXT;
ALTER TABLE "TrainerProfile" ADD COLUMN "description" TEXT;
ALTER TABLE "TrainerProfile" ADD COLUMN "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "TrainerProfile" ADD COLUMN "trainingAreas" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "TrainerProfile" ADD COLUMN "accreditations" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "TrainerProfile" ADD COLUMN "foundedYear" TEXT;
ALTER TABLE "TrainerProfile" ADD COLUMN "organizationSize" TEXT;

-- Step 2: Migrate existing data - use existing fields to populate new fields
UPDATE "TrainerProfile" SET
  "organizationName" = COALESCE("title", "firstName" || ' ' || "lastName" || ' Training'),
  "contactPersonName" = "firstName" || ' ' || "lastName",
  "description" = "bio",
  "specializations" = CASE WHEN "specialization" IS NOT NULL THEN ARRAY["specialization"] ELSE ARRAY[]::TEXT[] END,
  "trainingAreas" = "skills"
WHERE "organizationName" IS NULL;

-- Step 3: Make required fields NOT NULL after data migration
ALTER TABLE "TrainerProfile" ALTER COLUMN "organizationName" SET NOT NULL;
ALTER TABLE "TrainerProfile" ALTER COLUMN "contactPersonName" SET NOT NULL;

-- Step 4: Drop old columns
ALTER TABLE "TrainerProfile" DROP COLUMN "firstName";
ALTER TABLE "TrainerProfile" DROP COLUMN "lastName";
ALTER TABLE "TrainerProfile" DROP COLUMN "title";
ALTER TABLE "TrainerProfile" DROP COLUMN "specialization";
ALTER TABLE "TrainerProfile" DROP COLUMN "bio";
ALTER TABLE "TrainerProfile" DROP COLUMN "skills";
ALTER TABLE "TrainerProfile" DROP COLUMN "experience";
ALTER TABLE "TrainerProfile" DROP COLUMN "certifications";
ALTER TABLE "TrainerProfile" DROP COLUMN "hourlyRate";
