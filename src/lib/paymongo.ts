import Paymongo from "paymongo-node";
import { env } from "~/env";
import { db } from "~/server/db";

// PayMongo client instance
let paymongoClient: ReturnType<typeof Paymongo> | null = null;

/**
 * Get the PayMongo client instance
 * Uses singleton pattern to avoid creating multiple instances
 */
export function getPaymongoClient() {
  if (!paymongoClient) {
    if (!env.PAYMONGO_SECRET_KEY) {
      throw new Error("PAYMONGO_SECRET_KEY is not configured");
    }

    paymongoClient = Paymongo(env.PAYMONGO_SECRET_KEY);
  }

  return paymongoClient;
}

/**
 * Create a checkout session for a course purchase using PayMongo Links
 */
export async function createCourseCheckoutSession({
  userId,
  courseId,
  successUrl,
  cancelUrl: _cancelUrl,
}: {
  userId: string;
  courseId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const paymongo = getPaymongoClient();

  // Get course and user details
  const [course, user] = await Promise.all([
    db.course.findUnique({
      where: { id: courseId },
      include: { trainer: true },
    }),
    db.user.findUnique({
      where: { id: userId },
    }),
  ]);

  if (!course) {
    throw new Error("Course not found");
  }

  if (!user) {
    throw new Error("User not found");
  }

  // Convert price to centavos (PayMongo uses smallest currency unit)
  const amountInCentavos = Math.round(course.price * 100);

  // Create payment link using PayMongo Links API
  const link = await paymongo.links.create({
    amount: amountInCentavos,
    description: `Purchase: ${course.title}`,
    remarks: JSON.stringify({
      type: "course_purchase",
      courseId,
      userId,
      trainerId: course.trainerId,
      successUrl,
    }),
  });

  return {
    id: link.id,
    url: link.checkout_url,
  };
}

/**
 * Calculate platform fee and trainer payout for a course sale
 * Platform takes 15%, trainer gets 85%
 */
export function calculatePayoutSplit(amount: number) {
  const platformFeeRate = 0.15; // 15%
  const platformFee = Math.round(amount * platformFeeRate * 100) / 100;
  const trainerPayout = Math.round((amount - platformFee) * 100) / 100;

  return {
    platformFee,
    trainerPayout,
    platformFeeRate,
  };
}

/**
 * Create an order record from a PayMongo webhook event
 */
export async function createOrderFromPaymongoEvent({
  paymongoCheckoutId,
  paymongoPaymentId,
  userId,
  courseId,
  type,
  amount,
  currency = "PHP",
}: {
  paymongoCheckoutId: string;
  paymongoPaymentId?: string;
  userId: string;
  courseId?: string;
  type: "course_purchase" | "job_posting";
  amount: number;
  currency?: string;
}) {
  const { platformFee, trainerPayout } = calculatePayoutSplit(amount);

  const order = await db.order.create({
    data: {
      paymongoCheckoutId,
      paymongoPaymentId,
      userId,
      courseId,
      type,
      amount,
      currency,
      platformFee,
      trainerPayout: type === "course_purchase" ? trainerPayout : null,
      status: "paid",
      paidAt: new Date(),
    },
  });

  return order;
}

/**
 * Create enrollment after successful course purchase
 */
export async function createEnrollmentFromOrder(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { course: true },
  });

  if (!order || !order.courseId) {
    throw new Error("Order or course not found");
  }

  // Check if enrollment already exists
  const existingEnrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: order.userId,
        courseId: order.courseId,
      },
    },
  });

  if (existingEnrollment) {
    return existingEnrollment;
  }

  const enrollment = await db.enrollment.create({
    data: {
      userId: order.userId,
      courseId: order.courseId,
      orderId: order.id,
      status: "active",
    },
  });

  return enrollment;
}

/**
 * Create payout record for trainer after course sale
 */
export async function createTrainerPayout(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { course: true },
  });

  if (!order || !order.course || !order.trainerPayout) {
    throw new Error("Invalid order for payout");
  }

  // Check if payout already exists
  const existingPayout = await db.payout.findUnique({
    where: { orderId },
  });

  if (existingPayout) {
    return existingPayout;
  }

  const payout = await db.payout.create({
    data: {
      trainerId: order.course.trainerId,
      orderId: order.id,
      amount: order.trainerPayout,
      status: "pending",
    },
  });

  return payout;
}

