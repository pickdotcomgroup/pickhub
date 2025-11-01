import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Count unread messages where the current user is NOT the sender
    const unreadCount = await db.message.count({
      where: {
        isRead: false,
        senderId: {
          not: session.user.id,
        },
        conversation: {
          OR: [
            { clientId: session.user.id },
            { talentId: session.user.id },
          ],
        },
      },
    });

    return NextResponse.json({ count: unreadCount });
  } catch (error) {
    console.error("Error fetching unread message count:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread message count" },
      { status: 500 }
    );
  }
}
