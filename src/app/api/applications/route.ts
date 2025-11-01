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
    const status = searchParams.get("status");

    // Build where clause
    const where: Prisma.ApplicationWhereInput = {};
    
    if (talentId) {
      where.talentId = talentId;
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
