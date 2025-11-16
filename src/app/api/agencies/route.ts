import { NextResponse } from "next/server";
import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Public browsing of agencies (no authentication required)
    const searchQuery = searchParams.get("search") ?? "";
    const skills = searchParams.get("skills")?.split(",").filter(Boolean) ?? [];
    const teamSize = searchParams.get("teamSize") ?? "";

    // Build AND conditions array
    const andConditions: Prisma.UserWhereInput[] = [
      {
        agencyProfile: {
          isNot: null,
        },
      },
    ];

    // Add team size filter
    if (teamSize) {
      andConditions.push({
        agencyProfile: {
          teamSize: teamSize,
        },
      });
    }

    // Add skills filter
    if (skills.length > 0) {
      andConditions.push({
        agencyProfile: {
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
          agencyProfile: {
            agencyName: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
        {
          agencyProfile: {
            description: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
        {
          agencyProfile: {
            location: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // Fetch agencies with their profiles
    const agencies = await db.user.findMany({
      where: whereClause,
      include: {
        agencyProfile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit results for public browsing
    });

    // Transform the data to a cleaner format
    const transformedAgencies = agencies.map((agency) => ({
      id: agency.id,
      name: agency.name,
      email: agency.email,
      image: agency.image,
      profile: agency.agencyProfile
        ? {
            id: agency.agencyProfile.id,
            firstName: agency.agencyProfile.firstName,
            lastName: agency.agencyProfile.lastName,
            agencyName: agency.agencyProfile.agencyName,
            description: agency.agencyProfile.description,
            teamSize: agency.agencyProfile.teamSize,
            skills: agency.agencyProfile.skills,
            website: agency.agencyProfile.website,
            location: agency.agencyProfile.location,
            foundedYear: agency.agencyProfile.foundedYear,
          }
        : null,
    }));

    return NextResponse.json({ agencies: transformedAgencies });
  } catch (error) {
    console.error("Error fetching agencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch agencies" },
      { status: 500 }
    );
  }
}
