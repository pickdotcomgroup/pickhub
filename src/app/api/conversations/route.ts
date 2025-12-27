import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// GET /api/conversations - Get all conversations for the current user
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const archived = searchParams.get("archived") === "true";

    // Determine archive filter based on user role
    const isEmployer = await db.user.findUnique({
      where: { id: userId },
      select: { employerProfile: true },
    });

    const archiveFilter = isEmployer?.employerProfile
      ? { archivedByClient: archived }
      : { archivedByTalent: archived };

    // Get conversations where user is either employer or talent
    // Exclude deleted conversations for the current user
    const conversations = await db.conversation.findMany({
      where: {
        OR: [
          {
            clientId: userId,
            deletedByClient: false,
            ...archiveFilter,
          },
          {
            talentId: userId,
            deletedByTalent: false,
            ...archiveFilter,
          }
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            employerProfile: {
              select: {
                firstName: true,
                lastName: true,
                companyName: true,
              },
            },
          },
        },
        talent: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            talentProfile: {
              select: {
                firstName: true,
                lastName: true,
                title: true,
              },
            },
            trainerProfile: {
              select: {
                organizationName: true,
                contactPersonName: true,
                organizationType: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Get only the last message
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            isRead: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: userId }, // Unread messages from the other person
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}

// POST /api/conversations - Create or get existing conversation
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      otherUserId: string;
      projectId?: string;
    };
    const { otherUserId, projectId } = body;

    if (!otherUserId) {
      return NextResponse.json(
        { error: "otherUserId is required" },
        { status: 400 },
      );
    }

    const currentUserId = session.user.id;

    // Determine who is employer and who is talent/trainer
    const currentUser = await db.user.findUnique({
      where: { id: currentUserId },
      include: {
        employerProfile: true,
        talentProfile: true,
        trainerProfile: true,
      },
    });

    const otherUser = await db.user.findUnique({
      where: { id: otherUserId },
      include: {
        employerProfile: true,
        talentProfile: true,
        trainerProfile: true,
      },
    });

    if (!currentUser || !otherUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine employer and talent/trainer IDs
    // Note: We use talentId field for both talents and trainers
    // Support conversation types:
    // 1. Employer <-> Talent
    // 2. Employer <-> Trainer
    // 3. Trainer <-> Talent
    let clientId: string;
    let talentId: string;

    if (currentUser.employerProfile && (otherUser.talentProfile || otherUser.trainerProfile)) {
      // Employer messaging talent or trainer
      clientId = currentUserId;
      talentId = otherUserId;
    } else if ((currentUser.talentProfile || currentUser.trainerProfile) && otherUser.employerProfile) {
      // Talent or trainer messaging employer
      clientId = otherUserId;
      talentId = currentUserId;
    } else if (currentUser.trainerProfile && otherUser.talentProfile) {
      // Trainer messaging talent - use trainer as "client" and talent as "talent"
      clientId = currentUserId;
      talentId = otherUserId;
    } else if (currentUser.talentProfile && otherUser.trainerProfile) {
      // Talent messaging trainer - use trainer as "client" and talent as "talent"
      clientId = otherUserId;
      talentId = currentUserId;
    } else {
      return NextResponse.json(
        { error: "Invalid conversation participants" },
        { status: 400 },
      );
    }

    // Try to find existing conversation or create new one
    const conversation =
      (await db.conversation.findFirst({
        where: {
          clientId,
          talentId,
          projectId: projectId ?? null,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              employerProfile: true,
              trainerProfile: true,
            },
          },
          talent: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              talentProfile: true,
              trainerProfile: true,
            },
          },
        },
      })) ??
      (await db.conversation.create({
        data: {
          clientId,
          talentId,
          projectId: projectId ?? null,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              employerProfile: true,
              trainerProfile: true,
            },
          },
          talent: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              talentProfile: true,
              trainerProfile: true,
            },
          },
        },
      }));

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 },
    );
  }
}
