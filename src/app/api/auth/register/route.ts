import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";

interface ClientProfileData {
  professionalType: "client";
  firstName?: string;
  lastName?: string;
  companyName?: string;
  industry?: string;
  companySize?: string;
}

interface TalentProfileData {
  professionalType: "talent";
  firstName: string;
  lastName: string;
  title: string;
  skills: string[];
  experience: string;
  hourlyRate?: string;
  portfolio?: string;
}

interface AgencyProfileData {
  professionalType: "agency";
  firstName: string;
  lastName: string;
  agencyName: string;
  description: string;
  teamSize?: string;
  skills: string[];
}

interface RequestBody {
  email: string;
  password: string;
  name: string;
  professionalData?: ClientProfileData | TalentProfileData | AgencyProfileData;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const { email, password, name, professionalData } = body;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email },
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
        email: email,
        password: hashedPassword,
        name: name,
      },
    });

    // Create professional profile if provided
    if (professionalData) {
      const { professionalType, ...profileData } = professionalData;

      switch (professionalType) {
        case "client": {
          const clientData = profileData as Omit<ClientProfileData, "professionalType">;
          // Only create client profile if professional data is provided
          if (clientData.firstName || clientData.lastName || clientData.companyName || clientData.industry) {
            await db.clientProfile.create({
              data: {
                userId: user.id,
                firstName: clientData.firstName || "",
                lastName: clientData.lastName || "",
                companyName: clientData.companyName || "",
                industry: clientData.industry || "",
                companySize: clientData.companySize,
              },
            });
          }
          break;
        }
        case "talent": {
          const talentData = profileData as Omit<TalentProfileData, "professionalType">;
          await db.talentProfile.create({
            data: {
              userId: user.id,
              firstName: talentData.firstName,
              lastName: talentData.lastName,
              title: talentData.title,
              skills: talentData.skills,
              experience: talentData.experience,
              hourlyRate: talentData.hourlyRate,
              portfolio: talentData.portfolio,
            },
          });
          break;
        }
        case "agency": {
          const agencyData = profileData as Omit<AgencyProfileData, "professionalType">;
          await db.agencyProfile.create({
            data: {
              userId: user.id,
              firstName: agencyData.firstName,
              lastName: agencyData.lastName,
              agencyName: agencyData.agencyName,
              description: agencyData.description,
              teamSize: agencyData.teamSize,
              skills: agencyData.skills,
            },
          });
          break;
        }
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
