import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: talentId } = await params;

    // Fetch talent with profile and verification details
    const talent = await db.user.findUnique({
      where: { id: talentId },
      include: {
        talentProfile: {
          include: {
            verification: true,
          },
        },
      },
    });

    if (!talent || !talent.talentProfile) {
      return NextResponse.json(
        { error: "Talent not found" },
        { status: 404 }
      );
    }

    // Only show verified talents to clients
    if (talent.talentProfile.verificationStatus !== "verified") {
      return NextResponse.json(
        { error: "Talent not available" },
        { status: 403 }
      );
    }

    // Transform the data
    const response = {
      id: talent.id,
      name: talent.name,
      email: talent.email,
      image: talent.image,
      profile: {
        id: talent.talentProfile.id,
        firstName: talent.talentProfile.firstName,
        lastName: talent.talentProfile.lastName,
        title: talent.talentProfile.title,
        skills: talent.talentProfile.skills,
        experience: talent.talentProfile.experience,
        hourlyRate: talent.talentProfile.hourlyRate,
        portfolio: talent.talentProfile.portfolio,
        portfolioUrl: talent.talentProfile.portfolioUrl,
        bio: talent.talentProfile.bio,
        certifications: talent.talentProfile.certifications,
        tier: talent.talentProfile.tier,
        completedProjects: talent.talentProfile.completedProjects,
        successRate: talent.talentProfile.successRate,
        verificationStatus: talent.talentProfile.verificationStatus,
        platformAccess: talent.talentProfile.platformAccess,
      },
      verification: talent.talentProfile.verification
        ? {
            portfolioReviewed: talent.talentProfile.verification.portfolioReviewed,
            portfolioScore: talent.talentProfile.verification.portfolioScore,
            codeSampleReviewed: talent.talentProfile.verification.codeSampleReviewed,
            codeSampleScore: talent.talentProfile.verification.codeSampleScore,
            githubUsername: talent.talentProfile.verification.githubUsername,
            gitlabUsername: talent.talentProfile.verification.gitlabUsername,
            linkedInUrl: talent.talentProfile.verification.linkedInUrl,
            linkedInVerified: talent.talentProfile.verification.linkedInVerified,
            identityVerified: talent.talentProfile.verification.identityVerified,
            overallScore: talent.talentProfile.verification.overallScore,
            verificationDecision: talent.talentProfile.verification.verificationDecision,
            reviewedAt: talent.talentProfile.verification.reviewedAt,
          }
        : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching talent details:", error);
    return NextResponse.json(
      { error: "Failed to fetch talent details" },
      { status: 500 }
    );
  }
}
