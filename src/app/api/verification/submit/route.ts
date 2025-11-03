import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import {
  isValidGitLabUsername,
  isValidLinkedInUrl,
  extractGitHubUsername,
} from "~/lib/verification-system";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as {
      portfolioUrl?: string;
      portfolioProjects?: string;
      githubUsername?: string;
      gitlabUsername?: string;
      codeRepositoryUrl?: string;
      linkedInUrl?: string;
    };
    const {
      portfolioUrl,
      portfolioProjects,
      githubUsername,
      gitlabUsername,
      codeRepositoryUrl,
      linkedInUrl,
    } = body;

    // Get talent profile
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

    // Validate inputs
    const errors: string[] = [];

    if (githubUsername) {
      const extractedUsername = extractGitHubUsername(githubUsername);
      if (!extractedUsername) {
        errors.push("Invalid GitHub username format");
      }
    }

    if (gitlabUsername && !isValidGitLabUsername(gitlabUsername)) {
      errors.push("Invalid GitLab username format");
    }

    if (linkedInUrl && !isValidLinkedInUrl(linkedInUrl)) {
      errors.push("Invalid LinkedIn URL format");
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Update talent profile with portfolio info
    await db.talentProfile.update({
      where: { id: talentProfile.id },
      data: {
        portfolioUrl: portfolioUrl ?? talentProfile.portfolioUrl,
        ...(portfolioProjects && { portfolioProjects }),
        verificationStatus: "in_review",
      },
    });

    // Create or update verification record
    const verificationData = {
      githubUsername: githubUsername
        ? extractGitHubUsername(githubUsername) ?? undefined
        : undefined,
      gitlabUsername: gitlabUsername ?? undefined,
      codeRepositoryUrl: codeRepositoryUrl ?? undefined,
      linkedInUrl: linkedInUrl ?? undefined,
    };

    if (talentProfile.verification) {
      // Update existing verification
      await db.talentVerification.update({
        where: { id: talentProfile.verification.id },
        data: verificationData,
      });
    } else {
      // Create new verification
      await db.talentVerification.create({
        data: {
          talentProfileId: talentProfile.id,
          ...verificationData,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Verification submission received. Our team will review it shortly.",
    });
  } catch (error) {
    console.error("Error submitting verification:", error);
    return NextResponse.json(
      { error: "Failed to submit verification" },
      { status: 500 }
    );
  }
}
