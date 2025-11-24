import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// GET /api/tasks?projectId=xxx
export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.clientId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Fetch tasks for the project
    const tasks = await db.task.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json() as {
      projectId: string;
      title: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string;
      assignedTo?: string;
    };

    const { projectId, title, description, status, priority, dueDate, assignedTo } = body;

    if (!projectId || !title) {
      return NextResponse.json(
        { error: "Project ID and title are required" },
        { status: 400 }
      );
    }

    // Verify user owns this project
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { clientId: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.clientId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Create the task
    const task = await db.task.create({
      data: {
        projectId,
        title,
        description: description ?? null,
        status: status ?? "todo",
        priority: priority ?? "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assignedTo ?? null,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json() as {
      taskId: string;
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string;
      assignedTo?: string;
    };

    const { taskId, ...updates } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Verify task exists and user has access
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { clientId: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    if (task.project.clientId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Update the task
    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        ...(updates.title && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.status && { status: updates.status }),
        ...(updates.priority && { priority: updates.priority }),
        ...(updates.dueDate !== undefined && { 
          dueDate: updates.dueDate ? new Date(updates.dueDate) : null 
        }),
        ...(updates.assignedTo !== undefined && { assigneeId: updates.assignedTo }),
      },
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// PUT /api/tasks
export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json() as {
      taskId: string;
      title: string;
      description?: string | null;
      priority: string;
      dueDate?: string | null;
    };

    const { taskId, title, description, priority, dueDate } = body;

    if (!taskId || !title) {
      return NextResponse.json(
        { error: "Task ID and title are required" },
        { status: 400 }
      );
    }

    // Verify task exists and user has access
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { clientId: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    if (task.project.clientId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Update the task
    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        title,
        description: description ?? null,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks?taskId=xxx
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Verify task exists and user has access
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { clientId: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    if (task.project.clientId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Delete the task
    await db.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
