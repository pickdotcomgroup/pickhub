import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "talent") {
      return NextResponse.json({ error: "Forbidden - Talent access only" }, { status: 403 });
    }

    const talentProfile = await db.talentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        verification: true,
      },
    });

    if (!talentProfile) {
      return NextResponse.json(
        { error: "Talent profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile: talentProfile });
  } catch (error) {
    console.error("Error fetching talent profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch talent profile" },
      { status: 500 }
    );
  }
}
