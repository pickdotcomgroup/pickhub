import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createCourseCheckoutSession } from "~/lib/paymongo";

export const paymentsRouter = createTRPCRouter({
  /**
   * Create a checkout session for purchasing a course
   */
  createCourseCheckout: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user is already enrolled
      const existingEnrollment = await ctx.db.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: input.courseId,
          },
        },
      });

      if (existingEnrollment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already enrolled in this course",
        });
      }

      const checkout = await createCourseCheckoutSession({
        userId,
        courseId: input.courseId,
        successUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
      });

      return { checkoutUrl: checkout.url };
    }),

  /**
   * Get user's order history
   */
  getOrderHistory: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;

      const orders = await ctx.db.order.findMany({
        where: { userId: ctx.session.user.id },
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (orders.length > limit) {
        const nextItem = orders.pop();
        nextCursor = nextItem?.id;
      }

      return {
        orders,
        nextCursor,
      };
    }),

  /**
   * Get trainer's earnings summary
   */
  getTrainerEarnings: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Verify user is a trainer
    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      include: { trainerProfile: true },
    });

    if (!user?.trainerProfile) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only trainers can access earnings",
      });
    }

    // Get all payouts
    const payouts = await ctx.db.payout.findMany({
      where: { trainerId: userId },
      include: {
        order: {
          include: {
            course: {
              select: { title: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate totals
    const totalEarnings = payouts.reduce((sum, p) => sum + p.amount, 0);
    const pendingEarnings = payouts
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);
    const completedEarnings = payouts
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalEarnings,
      pendingEarnings,
      completedEarnings,
      payouts,
    };
  }),

  /**
   * Get trainer's payout history
   */
  getPayoutHistory: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
          status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const limit = input?.limit ?? 20;

      const payouts = await ctx.db.payout.findMany({
        where: {
          trainerId: userId,
          ...(input?.status ? { status: input.status } : {}),
        },
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          order: {
            include: {
              course: {
                select: { id: true, title: true },
              },
              user: {
                select: { name: true, email: true },
              },
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (payouts.length > limit) {
        const nextItem = payouts.pop();
        nextCursor = nextItem?.id;
      }

      return {
        payouts,
        nextCursor,
      };
    }),
});
