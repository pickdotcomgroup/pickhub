import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// PATCH /api/conversations/[id] - Archive or delete a conversation
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const body = (await request.json()) as {
      action: "archive" | "delete";
    };

    const { action } = body;

    if (!action || (action !== "archive" && action !== "delete")) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'archive' or 'delete'" },
        { status: 400 }
      );
    }

    // Get the conversation to determine user role
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        clientId: true,
        talentId: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const isClient = conversation.clientId === userId;
    const isTalent = conversation.talentId === userId;

    if (!isClient && !isTalent) {
      return NextResponse.json(
        { error: "You are not a participant in this conversation" },
        { status: 403 }
      );
    }

    // Update the conversation based on action and user role
    const updateData: Record<string, boolean> = {};

    if (action === "archive") {
      if (isClient) {
        updateData.archivedByClient = true;
      } else {
        updateData.archivedByTalent = true;
      }
    } else if (action === "delete") {
      if (isClient) {
        updateData.deletedByClient = true;
      } else {
        updateData.deletedByTalent = true;
      }
    }

    const updatedConversation = await db.conversation.update({
      where: { id: conversationId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      action,
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}
