import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// Verify or reject a talent's verification request
export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { adminProfile: true },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json() as {
      talentProfileId?: string;
      decision?: string;
      portfolioScore?: number;
      codeSampleScore?: number;
      skillTestsScore?: number;
      overallScore?: number;
      rejectionReason?: string;
      portfolioNotes?: string;
      codeSampleNotes?: string;
    };
    const {
      talentProfileId,
      decision, // "approved" or "rejected"
      portfolioScore,
      codeSampleScore,
      skillTestsScore,
      overallScore,
      rejectionReason,
      portfolioNotes,
      codeSampleNotes,
    } = body;

    if (!talentProfileId || !decision) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (decision !== "approved" && decision !== "rejected") {
      return NextResponse.json(
        { error: "Invalid decision. Must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    // Get talent profile
    const talentProfile = await db.talentProfile.findUnique({
      where: { id: talentProfileId },
      include: { verification: true },
    });

    if (!talentProfile) {
      return NextResponse.json(
        { error: "Talent profile not found" },
        { status: 404 }
      );
    }

    // Update or create verification record
    const verificationData = {
      portfolioScore: portfolioScore ?? null,
      codeSampleScore: codeSampleScore ?? null,
      skillTestsScore: skillTestsScore ?? null,
      overallScore: overallScore ?? null,
      portfolioNotes: portfolioNotes ?? null,
      codeSampleNotes: codeSampleNotes ?? null,
      verificationDecision: decision,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      rejectionReason: decision === "rejected" ? (rejectionReason ?? null) : null,
      portfolioReviewed: true,
      codeSampleReviewed: true,
    };

    let verification;
    if (talentProfile.verification) {
      // Update existing verification
      verification = await db.talentVerification.update({
        where: { id: talentProfile.verification.id },
        data: verificationData,
      });
    } else {
      // Create new verification record
      verification = await db.talentVerification.create({
        data: {
          ...verificationData,
          talentProfileId: talentProfile.id,
        },
      });
    }

    // Update talent profile status and access
    const updatedTalentProfile = await db.talentProfile.update({
      where: { id: talentProfileId },
      data: {
        verificationStatus: decision === "approved" ? "verified" : "rejected",
        platformAccess: decision === "approved",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Talent ${decision === "approved" ? "verified" : "rejected"} successfully`,
      talentProfile: updatedTalentProfile,
      verification,
    });
  } catch (error) {
    console.error("Error verifying talent:", error);
    return NextResponse.json(
      { error: "Failed to verify talent" },
      { status: 500 }
    );
  }
}

// Get pending verification requests
export async function GET() {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { adminProfile: true },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get all talent profiles with pending or in_review status
    const pendingTalents = await db.talentProfile.findMany({
      where: {
        verificationStatus: {
          in: ["pending", "in_review"],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
        verification: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      pendingTalents,
      count: pendingTalents.length,
    });
  } catch (error) {
    console.error("Error fetching pending verifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending verifications" },
      { status: 500 }
    );
  }
}
