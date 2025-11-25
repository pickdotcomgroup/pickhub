-- AlterTable: Update Milestone to use startDate and endDate instead of dueDate
-- Step 1: Add new columns with temporary nullable constraint
ALTER TABLE "Milestone" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "Milestone" ADD COLUMN "endDate" TIMESTAMP(3);

-- Step 2: Migrate existing data (set startDate = dueDate, endDate = dueDate)
UPDATE "Milestone" SET "startDate" = "dueDate", "endDate" = "dueDate";

-- Step 3: Make the new columns required
ALTER TABLE "Milestone" ALTER COLUMN "startDate" SET NOT NULL;
ALTER TABLE "Milestone" ALTER COLUMN "endDate" SET NOT NULL;

-- Step 4: Drop the old dueDate column
ALTER TABLE "Milestone" DROP COLUMN "dueDate";
