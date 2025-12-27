import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";

interface EmployerProfileData {
  professionalType: "employer";
  firstName: string;
  lastName: string;
  companyName: string;
  industry: string;
  companySize?: string;
  description?: string;
  website?: string;
  location?: string;
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

interface TrainerProfileData {
  professionalType: "trainer";
  organizationName: string;
  organizationType?: string;
  contactPersonName: string;
  contactPersonRole?: string;
  description?: string;
  specializations: string[];
  website?: string;
  location?: string;
}

interface RequestBody {
  email: string;
  password: string;
  name: string;
  professionalData?: EmployerProfileData | TalentProfileData | TrainerProfileData;
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
        case "employer": {
          const employerData = profileData as Omit<EmployerProfileData, "professionalType">;
          await db.employerProfile.create({
            data: {
              userId: user.id,
              firstName: employerData.firstName,
              lastName: employerData.lastName,
              companyName: employerData.companyName,
              industry: employerData.industry,
              companySize: employerData.companySize,
              description: employerData.description,
              website: employerData.website,
              location: employerData.location,
            },
          });
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
              skills: talentData.skills ?? [],
              experience: talentData.experience,
              hourlyRate: talentData.hourlyRate,
              portfolio: talentData.portfolio,
            },
          });
          break;
        }
        case "trainer": {
          const trainerData = profileData as Omit<TrainerProfileData, "professionalType">;
          await db.trainerProfile.create({
            data: {
              userId: user.id,
              organizationName: trainerData.organizationName,
              organizationType: trainerData.organizationType,
              contactPersonName: trainerData.contactPersonName,
              contactPersonRole: trainerData.contactPersonRole,
              description: trainerData.description,
              specializations: trainerData.specializations ?? [],
              website: trainerData.website,
              location: trainerData.location,
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
