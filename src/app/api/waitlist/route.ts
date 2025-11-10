import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email: string };
    const { email } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEntry = await db.waitlist.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: "This email is already on the waitlist" },
        { status: 409 }
      );
    }

    // Add to waitlist
    const waitlistEntry = await db.waitlist.create({
      data: {
        email: email.toLowerCase(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully joined the waitlist!",
        data: {
          id: waitlistEntry.id,
          email: waitlistEntry.email,
          createdAt: waitlistEntry.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to waitlist:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist. Please try again." },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve waitlist count (for admin purposes)
export async function GET() {
  try {
    const count = await db.waitlist.count();
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("Error fetching waitlist count:", error);
    return NextResponse.json(
      { error: "Failed to fetch waitlist count" },
      { status: 500 }
    );
  }
}
