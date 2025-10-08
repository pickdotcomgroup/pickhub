import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, professionalData } = body;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Create professional profile if provided
    if (professionalData) {
      const { professionalType, ...profileData } = professionalData;

      switch (professionalType) {
        case "client":
          await db.clientProfile.create({
            data: {
              userId: user.id,
              ...profileData,
            },
          });
          break;
        case "talent":
          await db.talentProfile.create({
            data: {
              userId: user.id,
              ...profileData,
            },
          });
          break;
        case "agency":
          await db.agencyProfile.create({
            data: {
              userId: user.id,
              ...profileData,
            },
          });
          break;
      }
    }

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
