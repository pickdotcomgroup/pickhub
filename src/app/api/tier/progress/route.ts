import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import {
  calculateProgressToNextTier,
  shouldUpgradeTier,
  calculateEligibleTier,
  getTierConfig,
} from "~/lib/tier-system";
import type { TierLevel } from "~/lib/tier-system";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get talent profile
    const talentProfile = await db.talentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!talentProfile) {
      return NextResponse.json(
        { error: "Talent profile not found" },
        { status: 404 }
      );
    }

    const currentTier = talentProfile.tier as TierLevel;
    const currentTierConfig = getTierConfig(currentTier);

    // Calculate progress to next tier
    const progress = calculateProgressToNextTier(
      currentTier,
      talentProfile.completedProjects,
      talentProfile.successRate,
      talentProfile.totalEarnings
    );

    // Check if eligible for upgrade
    const canUpgrade = shouldUpgradeTier(
      currentTier,
      talentProfile.completedProjects,
      talentProfile.successRate,
      talentProfile.totalEarnings
    );

    return NextResponse.json({
      currentTier: {
        ...currentTierConfig,
        stats: {
          activePicks: talentProfile.activePicks,
          completedProjects: talentProfile.completedProjects,
          successRate: talentProfile.successRate,
          totalEarnings: talentProfile.totalEarnings,
        },
      },
      progress,
      canUpgrade,
    });
  } catch (error) {
    console.error("Error fetching tier progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch tier progress" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get talent profile
    const talentProfile = await db.talentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!talentProfile) {
      return NextResponse.json(
        { error: "Talent profile not found" },
        { status: 404 }
      );
    }

    const currentTier = talentProfile.tier as TierLevel;

    // Check if eligible for upgrade
    const canUpgrade = shouldUpgradeTier(
      currentTier,
      talentProfile.completedProjects,
      talentProfile.successRate,
      talentProfile.totalEarnings
    );

    if (!canUpgrade) {
      return NextResponse.json(
        { error: "Not eligible for tier upgrade" },
        { status: 400 }
      );
    }

    // Calculate new tier
    const newTier = calculateEligibleTier(
      talentProfile.completedProjects,
      talentProfile.successRate,
      talentProfile.totalEarnings
    );

    // Update tier
    const updatedProfile = await db.talentProfile.update({
      where: { userId: session.user.id },
      data: {
        tier: newTier,
      },
    });

    const newTierConfig = getTierConfig(newTier);

    return NextResponse.json({
      success: true,
      message: `Congratulations! You've been upgraded to ${newTierConfig.displayName} tier!`,
      newTier: {
        ...newTierConfig,
        stats: {
          activePicks: updatedProfile.activePicks,
          completedProjects: updatedProfile.completedProjects,
          successRate: updatedProfile.successRate,
          totalEarnings: updatedProfile.totalEarnings,
        },
      },
    });
  } catch (error) {
    console.error("Error upgrading tier:", error);
    return NextResponse.json(
      { error: "Failed to upgrade tier" },
      { status: 500 }
    );
  }
}
