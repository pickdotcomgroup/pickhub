import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// GET /api/conversations - Get all conversations for the current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get conversations where user is either client or talent
    const conversations = await db.conversation.findMany({
      where: {
        OR: [{ clientId: userId }, { talentId: userId }],
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            clientProfile: {
              select: {
                firstName: true,
                lastName: true,
                companyName: true,
              },
            },
            agencyProfile: {
              select: {
                firstName: true,
                lastName: true,
                agencyName: true,
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
            agencyProfile: {
              select: {
                firstName: true,
                lastName: true,
                agencyName: true,
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

    // Determine who is client and who is talent/agency
    const currentUser = await db.user.findUnique({
      where: { id: currentUserId },
      include: {
        clientProfile: true,
        talentProfile: true,
        agencyProfile: true,
      },
    });

    const otherUser = await db.user.findUnique({
      where: { id: otherUserId },
      include: {
        clientProfile: true,
        talentProfile: true,
        agencyProfile: true,
      },
    });

    if (!currentUser || !otherUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine client and talent/agency IDs
    // Note: We use talentId field for both talents and agencies
    // Support three conversation types:
    // 1. Client <-> Talent
    // 2. Client <-> Agency
    // 3. Agency <-> Talent
    let clientId: string;
    let talentId: string;

    if (currentUser.clientProfile && (otherUser.talentProfile || otherUser.agencyProfile)) {
      // Client messaging talent or agency
      clientId = currentUserId;
      talentId = otherUserId;
    } else if ((currentUser.talentProfile || currentUser.agencyProfile) && otherUser.clientProfile) {
      // Talent or agency messaging client
      clientId = otherUserId;
      talentId = currentUserId;
    } else if (currentUser.agencyProfile && otherUser.talentProfile) {
      // Agency messaging talent - use agency as "client" and talent as "talent"
      clientId = currentUserId;
      talentId = otherUserId;
    } else if (currentUser.talentProfile && otherUser.agencyProfile) {
      // Talent messaging agency - use agency as "client" and talent as "talent"
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
              clientProfile: true,
              agencyProfile: true,
            },
          },
          talent: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              talentProfile: true,
              agencyProfile: true,
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
              clientProfile: true,
              agencyProfile: true,
            },
          },
          talent: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              talentProfile: true,
              agencyProfile: true,
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
