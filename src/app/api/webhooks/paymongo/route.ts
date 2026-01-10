import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";
import {
  createOrderFromPaymongoEvent,
  createEnrollmentFromOrder,
  createTrainerPayout,
  getPaymongoClient,
} from "~/lib/paymongo";

/**
 * PayMongo Webhook Handler
 * Processes payment events from PayMongo
 */
export async function POST(request: NextRequest) {
  // Verify webhook secret is configured
  if (!env.PAYMONGO_WEBHOOK_SECRET) {
    console.error("PAYMONGO_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  try {
    const requestBody = await request.text();
    const signatureHeader = request.headers.get("paymongo-signature") ?? "";

    // Validate the webhook signature using the SDK
    const paymongo = getPaymongoClient();
    let event;

    try {
      event = paymongo.webhooks.constructEvent({
        payload: requestBody,
        signatureHeader,
        webhookSecretKey: env.PAYMONGO_WEBHOOK_SECRET,
      });
    } catch (error) {
      console.error("Webhook verification failed:", error);
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 403 }
      );
    }

    const eventType = event.type;
    const eventData = event.data;

    console.log(`Processing PayMongo webhook: ${eventType}`);

    switch (eventType) {
      case "link.payment.paid":
        await handleLinkPaymentPaid(eventData as unknown as LinkPaymentData);
        break;

      case "payment.paid":
        await handlePaymentPaid(eventData as unknown as PaymentData);
        break;

      case "payment.failed":
        await handlePaymentFailed(eventData as unknown as PaymentData);
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// ==================== EVENT HANDLERS ====================

interface LinkPaymentData {
  id: string;
  attributes: {
    amount: number;
    remarks?: string;
    payments?: Array<{
      id: string;
      attributes: {
        amount: number;
        currency: string;
        status: string;
      };
    }>;
  };
}

async function handleLinkPaymentPaid(data: LinkPaymentData) {
  const linkId = data.id;
  const remarks = data.attributes.remarks;

  if (!remarks) {
    console.log("No remarks in link payment:", linkId);
    return;
  }

  // Parse the metadata from remarks
  let metadata: {
    type?: string;
    courseId?: string;
    userId?: string;
    trainerId?: string;
  };

  try {
    metadata = JSON.parse(remarks) as typeof metadata;
  } catch {
    console.log("Invalid remarks JSON in link:", linkId);
    return;
  }

  const { type, courseId, userId, trainerId } = metadata;

  // Check if order already exists (idempotency)
  const existingOrder = await db.order.findUnique({
    where: { paymongoCheckoutId: linkId },
  });

  if (existingOrder) {
    console.log("Order already exists:", linkId);
    return;
  }

  if (type === "course_purchase" && courseId && userId) {
    // Get payment details
    const payment = data.attributes.payments?.[0];
    const amount = data.attributes.amount / 100; // Convert from centavos

    // Create order record
    const order = await createOrderFromPaymongoEvent({
      paymongoCheckoutId: linkId,
      paymongoPaymentId: payment?.id,
      userId,
      courseId,
      type: "course_purchase",
      amount,
      currency: "PHP",
    });

    console.log(`Created order ${order.id} for course ${courseId}`);

    // Create enrollment
    const enrollment = await createEnrollmentFromOrder(order.id);
    console.log(`Created enrollment ${enrollment.id}`);

    // Create trainer payout record
    if (trainerId) {
      const payout = await createTrainerPayout(order.id);
      console.log(`Created payout ${payout.id} for trainer ${trainerId}`);
    }

    // Create notification for user
    await db.notification.create({
      data: {
        userId,
        type: "enrollment",
        title: "Course Enrollment Confirmed",
        message: "You have been successfully enrolled in the course.",
        relatedProjectId: null,
        relatedApplicationId: null,
      },
    });
  }
}

interface PaymentData {
  id: string;
  attributes: {
    amount: number;
    metadata?: Record<string, string>;
  };
}

async function handlePaymentPaid(data: PaymentData) {
  console.log("Payment paid:", data.id);
  // Additional payment handling if needed
}

async function handlePaymentFailed(data: PaymentData) {
  console.log("Payment failed:", data.id);
  // Handle failed payment - maybe notify user
}
