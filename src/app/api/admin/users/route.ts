import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// Get all users (talents, clients, agencies)
export async function GET(request: Request) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { adminProfile: true },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get("type"); // talent, client, agency, all
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    // Build where clause based on user type
    const whereClause: Record<string, unknown> = {};
    
    if (userType === "talent") {
      whereClause.talentProfile = { isNot: null };
    } else if (userType === "client") {
      whereClause.clientProfile = { isNot: null };
    } else if (userType === "agency") {
      whereClause.agencyProfile = { isNot: null };
    }

    // Get users with their profiles
    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where: whereClause,
        include: {
          talentProfile: {
            include: {
              verification: true,
            },
          },
          clientProfile: true,
          agencyProfile: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.user.count({ where: whereClause }),
    ]);

    // Format response
    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      type: user.talentProfile
        ? "talent"
        : user.clientProfile
          ? "client"
          : user.agencyProfile
            ? "agency"
            : "unknown",
      profile: user.talentProfile ?? user.clientProfile ?? user.agencyProfile,
      verification: user.talentProfile?.verification ?? null,
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
