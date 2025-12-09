import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// GET - Fetch milestones for a project
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this project
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { clientId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Allow access if user is the client OR has an accepted application for this project
    const hasAccess = project.clientId === session.user.id ||
      await db.application.findFirst({
        where: {
          projectId,
          talentId: session.user.id,
          status: "accepted"
        }
      });

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const milestones = await db.milestone.findMany({
      where: { projectId },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({ milestones });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return NextResponse.json(
      { error: "Failed to fetch milestones" },
      { status: 500 }
    );
  }
}

// POST - Create a new milestone
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      projectId: string;
      title: string;
      description?: string;
      amount: number;
      startDate: string;
      endDate: string;
    };

    const { projectId, title, description, amount, startDate, endDate } = body;

    if (!projectId || !title || !amount || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user owns this project
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { clientId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.clientId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const milestone = await db.milestone.create({
      data: {
        title,
        description: description ?? null,
        amount,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        projectId,
        createdBy: session.user.id,
        status: "pending",
      },
    });

    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json(
      { error: "Failed to create milestone" },
      { status: 500 }
    );
  }
}

// PUT - Update a milestone
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      milestoneId: string;
      title?: string;
      description?: string;
      amount?: number;
      startDate?: string;
      endDate?: string;
      status?: string;
    };

    const { milestoneId, title, description, amount, startDate, endDate, status } = body;

    if (!milestoneId) {
      return NextResponse.json(
        { error: "Milestone ID is required" },
        { status: 400 }
      );
    }

    // Verify user owns the project this milestone belongs to
    const milestone = await db.milestone.findUnique({
      where: { id: milestoneId },
      include: { project: { select: { clientId: true } } },
    });

    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    if (milestone.project.clientId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: {
      title?: string;
      description?: string | null;
      amount?: number;
      startDate?: Date;
      endDate?: Date;
      status?: string;
      completedAt?: Date | null;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (amount !== undefined) updateData.amount = amount;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (status !== undefined) {
      updateData.status = status;
      // Set completedAt when status changes to completed
      if (status === "completed" && milestone.status !== "completed") {
        updateData.completedAt = new Date();
      } else if (status !== "completed") {
        updateData.completedAt = null;
      }
    }

    const updatedMilestone = await db.milestone.update({
      where: { id: milestoneId },
      data: updateData,
    });

    return NextResponse.json({ milestone: updatedMilestone });
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json(
      { error: "Failed to update milestone" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a milestone
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const milestoneId = searchParams.get("milestoneId");

    if (!milestoneId) {
      return NextResponse.json(
        { error: "Milestone ID is required" },
        { status: 400 }
      );
    }

    // Verify user owns the project this milestone belongs to
    const milestone = await db.milestone.findUnique({
      where: { id: milestoneId },
      include: { project: { select: { clientId: true } } },
    });

    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    if (milestone.project.clientId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.milestone.delete({
      where: { id: milestoneId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    return NextResponse.json(
      { error: "Failed to delete milestone" },
      { status: 500 }
    );
  }
}
