import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// GET - Fetch current trainer's profile
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "trainer") {
      return NextResponse.json(
        { error: "Forbidden - Trainer role required" },
        { status: 403 }
      );
    }

    const trainerProfile = await db.trainerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!trainerProfile) {
      return NextResponse.json(
        { error: "Trainer profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(trainerProfile);
  } catch (error) {
    console.error("Error fetching trainer profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update trainer profile
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "trainer") {
      return NextResponse.json(
        { error: "Forbidden - Trainer role required" },
        { status: 403 }
      );
    }

    const body = await request.json() as {
      firstName?: string;
      lastName?: string;
      title?: string;
      specialization?: string;
      bio?: string;
      skills?: string[];
      experience?: string;
      certifications?: string[];
      hourlyRate?: string;
      website?: string;
      location?: string;
    };

    // Validate required fields
    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    const updatedProfile = await db.trainerProfile.update({
      where: { userId: session.user.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        title: body.title ?? null,
        specialization: body.specialization ?? null,
        bio: body.bio ?? null,
        skills: body.skills ?? [],
        experience: body.experience ?? null,
        certifications: body.certifications ?? [],
        hourlyRate: body.hourlyRate ?? null,
        website: body.website ?? null,
        location: body.location ?? null,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error updating trainer profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
