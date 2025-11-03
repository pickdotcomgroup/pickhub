-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "complexity" TEXT,
ADD COLUMN     "estimatedDuration" INTEGER,
ADD COLUMN     "projectTemplate" TEXT,
ADD COLUMN     "techStack" TEXT[],
ADD COLUMN     "visibility" TEXT DEFAULT 'public';
