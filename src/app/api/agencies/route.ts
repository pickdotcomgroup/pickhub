import { NextResponse } from "next/server";
import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";

// This route now handles employers (previously agencies)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Public browsing of employers (no authentication required)
    const searchQuery = searchParams.get("search") ?? "";
    const industry = searchParams.get("industry") ?? "";
    const companySize = searchParams.get("companySize") ?? "";

    // Build AND conditions array
    const andConditions: Prisma.UserWhereInput[] = [
      {
        employerProfile: {
          isNot: null,
        },
      },
    ];

    // Add company size filter
    if (companySize) {
      andConditions.push({
        employerProfile: {
          companySize: companySize,
        },
      });
    }

    // Add industry filter
    if (industry) {
      andConditions.push({
        employerProfile: {
          industry: industry,
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
          employerProfile: {
            companyName: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
        {
          employerProfile: {
            description: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
        {
          employerProfile: {
            location: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // Fetch employers with their profiles
    const employers = await db.user.findMany({
      where: whereClause,
      include: {
        employerProfile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit results for public browsing
    });

    // Transform the data to a cleaner format
    const transformedEmployers = employers.map((employer) => ({
      id: employer.id,
      name: employer.name,
      email: employer.email,
      image: employer.image,
      profile: employer.employerProfile
        ? {
            id: employer.employerProfile.id,
            firstName: employer.employerProfile.firstName,
            lastName: employer.employerProfile.lastName,
            companyName: employer.employerProfile.companyName,
            description: employer.employerProfile.description,
            companySize: employer.employerProfile.companySize,
            industry: employer.employerProfile.industry,
            website: employer.employerProfile.website,
            location: employer.employerProfile.location,
            foundedYear: employer.employerProfile.foundedYear,
          }
        : null,
    }));

    // Return as "agencies" for backward compatibility, can be changed to "employers" later
    return NextResponse.json({ agencies: transformedEmployers, employers: transformedEmployers });
  } catch (error) {
    console.error("Error fetching employers:", error);
    return NextResponse.json(
      { error: "Failed to fetch employers" },
      { status: 500 }
    );
  }
}
