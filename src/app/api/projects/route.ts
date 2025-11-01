import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { NextResponse } from "next/server";

interface ProjectRequestBody {
  title?: string;
  description?: string;
  budget?: string | number;
  deadline?: string | Date;
  category?: string;
  skills?: string[];
  projectType?: string;
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "client") {
      return NextResponse.json(
        { error: "Only clients can post projects" },
        { status: 403 }
      );
    }

    const body = await req.json() as ProjectRequestBody;
    const { title, description, budget, deadline, category, skills, projectType } = body;

    // Validation
    if (!title || !description || !budget || !deadline || !category || !skills || skills.length === 0) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Create project in database
    const project = await db.project.create({
      data: {
        title: title,
        description: description,
        budget: parseFloat(String(budget)),
        deadline: new Date(String(deadline)),
        category: category,
        skills: skills,
        projectType: projectType ?? "fixed",
        status: "open",
        clientId: session.user.id,
      },
    });

    return NextResponse.json(
      { 
        message: "Project created successfully",
        project 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    // If clientId is provided, filter by client
    const where = clientId ? { clientId } : {};

    const projects = await db.project.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
