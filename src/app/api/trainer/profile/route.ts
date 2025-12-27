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

// PUT - Update trainer/organization profile
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
      organizationName?: string;
      organizationType?: string;
      registrationNumber?: string;
      contactPersonName?: string;
      contactPersonRole?: string;
      contactEmail?: string;
      contactPhone?: string;
      description?: string;
      specializations?: string[];
      trainingAreas?: string[];
      accreditations?: string[];
      website?: string;
      location?: string;
      foundedYear?: string;
      organizationSize?: string;
    };

    // Validate required fields
    if (!body.organizationName || !body.contactPersonName) {
      return NextResponse.json(
        { error: "Organization name and contact person name are required" },
        { status: 400 }
      );
    }

    const updatedProfile = await db.trainerProfile.update({
      where: { userId: session.user.id },
      data: {
        organizationName: body.organizationName,
        organizationType: body.organizationType ?? null,
        registrationNumber: body.registrationNumber ?? null,
        contactPersonName: body.contactPersonName,
        contactPersonRole: body.contactPersonRole ?? null,
        contactEmail: body.contactEmail ?? null,
        contactPhone: body.contactPhone ?? null,
        description: body.description ?? null,
        specializations: body.specializations ?? [],
        trainingAreas: body.trainingAreas ?? [],
        accreditations: body.accreditations ?? [],
        website: body.website ?? null,
        location: body.location ?? null,
        foundedYear: body.foundedYear ?? null,
        organizationSize: body.organizationSize ?? null,
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
