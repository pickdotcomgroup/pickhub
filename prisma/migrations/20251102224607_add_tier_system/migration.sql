-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "clientFeedback" TEXT,
ADD COLUMN     "clientRating" DOUBLE PRECISION,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "isPicked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pickedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "mutualInterest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "minimumTier" TEXT NOT NULL DEFAULT 'bronze';

-- AlterTable
ALTER TABLE "TalentProfile" ADD COLUMN     "activePicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "completedProjects" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "portfolioProjects" JSONB,
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "tier" TEXT NOT NULL DEFAULT 'bronze',
ADD COLUMN     "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- CreateIndex
CREATE INDEX "Application_isPicked_idx" ON "Application"("isPicked");

-- CreateIndex
CREATE INDEX "Project_minimumTier_idx" ON "Project"("minimumTier");
