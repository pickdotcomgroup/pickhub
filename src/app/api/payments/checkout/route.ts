import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { createCourseCheckoutSession } from "~/lib/paymongo";

/**
 * Create a checkout session
 * Supports course purchases via PayMongo
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      type?: string;
      courseId?: string;
      successUrl?: string;
      cancelUrl?: string;
    };
    const { type, courseId, successUrl, cancelUrl } = body;

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "Missing successUrl or cancelUrl" },
        { status: 400 }
      );
    }

    let checkoutUrl: string;

    if (type === "course" && courseId) {
      // Course purchase checkout
      const existingEnrollment = await db.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId,
          },
        },
      });

      if (existingEnrollment) {
        return NextResponse.json(
          { error: "Already enrolled in this course" },
          { status: 400 }
        );
      }

      const checkout = await createCourseCheckoutSession({
        userId: session.user.id,
        courseId,
        successUrl,
        cancelUrl,
      });

      checkoutUrl = checkout.url;
    } else {
      return NextResponse.json(
        { error: "Invalid checkout type or missing parameters" },
        { status: 400 }
      );
    }

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
