import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "talent") {
      return NextResponse.json(
        { error: "Only talents can apply to projects" },
        { status: 403 }
      );
    }

    const body = await req.json() as { projectId?: string; coverLetter?: string; proposedRate?: string | number };
    const { projectId, coverLetter, proposedRate } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Check if project exists and is open
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.status !== "open") {
      return NextResponse.json(
        { error: "This project is no longer accepting applications" },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingApplication = await db.application.findUnique({
      where: {
        projectId_talentId: {
          projectId: projectId,
          talentId: session.user.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this project" },
        { status: 400 }
      );
    }

    // Create application
    const application = await db.application.create({
      data: {
        projectId: projectId,
        talentId: session.user.id,
        coverLetter: coverLetter ?? null,
        proposedRate: proposedRate ? parseFloat(String(proposedRate)) : null,
        status: "pending",
      },
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      { 
        message: "Application submitted successfully",
        application 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
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
    const talentId = searchParams.get("talentId");
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    // Build where clause
    const where: Prisma.ApplicationWhereInput = {};
    
    if (talentId) {
      where.talentId = talentId;
    }
    
    if (projectId) {
      where.projectId = projectId;
    }
    
    if (status) {
      where.status = status as "pending" | "accepted" | "rejected";
    }

    const applications = await db.application.findMany({
      where,
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        talent: {
          include: {
            talentProfile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
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
        { error: "Only clients can update application status" },
        { status: 403 }
      );
    }

    const body = await req.json() as { applicationId?: string; status?: string };
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: "Application ID and status are required" },
        { status: 400 }
      );
    }

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be pending, accepted, or rejected" },
        { status: 400 }
      );
    }

    // Get the application with project info
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        project: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify the client owns the project
    if (application.project.clientId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update applications for your own projects" },
        { status: 403 }
      );
    }

    // Update the application status
    const updatedApplication = await db.application.update({
      where: { id: applicationId },
      data: { status: status as "pending" | "accepted" | "rejected" },
      include: {
        talent: {
          include: {
            talentProfile: true,
          },
        },
      },
    });

    return NextResponse.json(
      { 
        message: "Application status updated successfully",
        application: updatedApplication 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    );
  }
}
