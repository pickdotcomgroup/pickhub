-- AlterTable
ALTER TABLE "TalentProfile" ADD COLUMN     "platformAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationStatus" TEXT NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "TalentVerification" (
    "id" TEXT NOT NULL,
    "talentProfileId" TEXT NOT NULL,
    "portfolioReviewed" BOOLEAN NOT NULL DEFAULT false,
    "portfolioScore" DOUBLE PRECISION,
    "portfolioNotes" TEXT,
    "githubUsername" TEXT,
    "gitlabUsername" TEXT,
    "codeRepositoryUrl" TEXT,
    "codeSampleReviewed" BOOLEAN NOT NULL DEFAULT false,
    "codeSampleScore" DOUBLE PRECISION,
    "codeSampleNotes" TEXT,
    "skillTestsTaken" JSONB,
    "skillTestsScore" DOUBLE PRECISION,
    "linkedInUrl" TEXT,
    "linkedInVerified" BOOLEAN NOT NULL DEFAULT false,
    "identityVerified" BOOLEAN NOT NULL DEFAULT false,
    "identityDocumentType" TEXT,
    "identityVerifiedAt" TIMESTAMP(3),
    "overallScore" DOUBLE PRECISION,
    "verificationDecision" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalentVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillTest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technology" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "passingScore" DOUBLE PRECISION NOT NULL,
    "questions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TalentVerification_talentProfileId_key" ON "TalentVerification"("talentProfileId");

-- CreateIndex
CREATE INDEX "TalentVerification_verificationDecision_idx" ON "TalentVerification"("verificationDecision");

-- CreateIndex
CREATE INDEX "SkillTest_technology_idx" ON "SkillTest"("technology");

-- CreateIndex
CREATE INDEX "SkillTest_difficulty_idx" ON "SkillTest"("difficulty");

-- AddForeignKey
ALTER TABLE "TalentVerification" ADD CONSTRAINT "TalentVerification_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
