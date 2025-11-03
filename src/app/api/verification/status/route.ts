import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import {
  calculateVerificationProgress,
  getVerificationStatusInfo,
  generateVerificationChecklist,
  type VerificationStatus,
} from "~/lib/verification-system";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get talent profile with verification
    const talentProfile = await db.talentProfile.findUnique({
      where: { userId: session.user.id },
      include: { verification: true },
    });

    if (!talentProfile) {
      return NextResponse.json(
        { error: "Talent profile not found" },
        { status: 404 }
      );
    }

    // Calculate progress
    const progress = talentProfile.verification
      ? calculateVerificationProgress({
          portfolioReviewed: talentProfile.verification.portfolioReviewed,
          codeSampleReviewed: talentProfile.verification.codeSampleReviewed,
          skillTestsTaken: talentProfile.verification.skillTestsTaken,
          linkedInVerified: talentProfile.verification.linkedInVerified,
          identityVerified: talentProfile.verification.identityVerified,
        })
      : {
          portfolioReviewed: false,
          codeSampleReviewed: false,
          skillTestsTaken: false,
          linkedInVerified: false,
          identityVerified: false,
          completionPercentage: 0,
        };

    // Get status info
    const statusInfo = getVerificationStatusInfo(
      talentProfile.verificationStatus as VerificationStatus
    );

    // Generate checklist
    const checklist = generateVerificationChecklist();

    return NextResponse.json({
      verificationStatus: talentProfile.verificationStatus,
      platformAccess: talentProfile.platformAccess,
      statusInfo,
      progress,
      checklist,
      verification: talentProfile.verification
        ? {
            portfolioScore: talentProfile.verification.portfolioScore,
            codeSampleScore: talentProfile.verification.codeSampleScore,
            skillTestsScore: talentProfile.verification.skillTestsScore,
            overallScore: talentProfile.verification.overallScore,
            verificationDecision: talentProfile.verification.verificationDecision,
            rejectionReason: talentProfile.verification.rejectionReason,
            reviewedAt: talentProfile.verification.reviewedAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching verification status:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification status" },
      { status: 500 }
    );
  }
}
