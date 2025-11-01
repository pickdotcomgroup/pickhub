import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only clients can browse talents
    if (session.user.role !== "client") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search") ?? "";
    const experienceLevel = searchParams.get("experience") ?? "";
    const skills = searchParams.get("skills")?.split(",").filter(Boolean) ?? [];

    // Build AND conditions array
    const andConditions: Prisma.UserWhereInput[] = [
      {
        talentProfile: {
          isNot: null,
        },
      },
    ];

    // Add experience level filter
    if (experienceLevel) {
      andConditions.push({
        talentProfile: {
          experience: experienceLevel,
        },
      });
    }

    // Add skills filter
    if (skills.length > 0) {
      andConditions.push({
        talentProfile: {
          skills: {
            hasSome: skills,
          },
        },
      });
    }

    // Build the where clause for filtering
    const whereClause: Prisma.UserWhereInput = {
      AND: andConditions,
    };

    // Add search filter
    if (searchQuery) {
      whereClause.OR = [
        {
          name: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        {
          talentProfile: {
            firstName: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
        {
          talentProfile: {
            lastName: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
        {
          talentProfile: {
            title: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // Fetch talents with their profiles
    const talents = await db.user.findMany({
      where: whereClause,
      include: {
        talentProfile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to a cleaner format
    const transformedTalents = talents.map((talent) => ({
      id: talent.id,
      name: talent.name,
      email: talent.email,
      image: talent.image,
      profile: talent.talentProfile
        ? {
            id: talent.talentProfile.id,
            firstName: talent.talentProfile.firstName,
            lastName: talent.talentProfile.lastName,
            title: talent.talentProfile.title,
            skills: talent.talentProfile.skills,
            experience: talent.talentProfile.experience,
            hourlyRate: talent.talentProfile.hourlyRate,
            portfolio: talent.talentProfile.portfolio,
          }
        : null,
    }));

    return NextResponse.json({ talents: transformedTalents });
  } catch (error) {
    console.error("Error fetching talents:", error);
    return NextResponse.json(
      { error: "Failed to fetch talents" },
      { status: 500 }
    );
  }
}
