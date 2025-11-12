import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { canPickProject, getMaxConcurrentPicks } from "~/lib/tier-system";
import type { TierLevel } from "~/lib/tier-system";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as { applicationId?: string };
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    // Get talent profile with tier information
    const talentProfile = await db.talentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!talentProfile) {
      return NextResponse.json(
        { error: "Talent profile not found" },
        { status: 404 }
      );
    }

    // Check if talent can pick more projects based on tier
    const canPick = canPickProject(
      talentProfile.activePicks,
      talentProfile.tier as TierLevel
    );

    if (!canPick) {
      const maxPicks = getMaxConcurrentPicks(
        talentProfile.tier as TierLevel
      );
      return NextResponse.json(
        {
          error: `You have reached your maximum concurrent picks (${maxPicks}) for ${talentProfile.tier} tier`,
        },
        { status: 403 }
      );
    }

    // Get the application
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        project: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify the application belongs to the current user
    if (application.talentId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to pick this application" },
        { status: 403 }
      );
    }

    // Check if already picked
    if (application.isPicked) {
      return NextResponse.json(
        { error: "Application already picked" },
        { status: 400 }
      );
    }

    // Update application, talent profile, and project status in a transaction
    const result = await db.$transaction([
      db.application.update({
        where: { id: applicationId },
        data: {
          isPicked: true,
          pickedAt: new Date(),
          status: "accepted",
        },
      }),
      db.talentProfile.update({
        where: { userId: session.user.id },
        data: {
          activePicks: {
            increment: 1,
          },
        },
      }),
      db.project.update({
        where: { id: application.projectId },
        data: {
          status: "in_progress",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      application: result[0],
      activePicks: talentProfile.activePicks + 1,
    });
  } catch (error) {
    console.error("Error picking project:", error);
    return NextResponse.json(
      { error: "Failed to pick project" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    // Get the application
    const application = await db.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify the application belongs to the current user
    if (application.talentId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to unpick this application" },
        { status: 403 }
      );
    }

    // Check if it's picked
    if (!application.isPicked) {
      return NextResponse.json(
        { error: "Application is not picked" },
        { status: 400 }
      );
    }

    // Update application, talent profile, and project status in a transaction
    await db.$transaction([
      db.application.update({
        where: { id: applicationId },
        data: {
          isPicked: false,
          pickedAt: null,
          status: "pending",
        },
      }),
      db.talentProfile.update({
        where: { userId: session.user.id },
        data: {
          activePicks: {
            decrement: 1,
          },
        },
      }),
      db.project.update({
        where: { id: application.projectId },
        data: {
          status: "open",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Project unpicked successfully",
    });
  } catch (error) {
    console.error("Error unpicking project:", error);
    return NextResponse.json(
      { error: "Failed to unpick project" },
      { status: 500 }
    );
  }
}
