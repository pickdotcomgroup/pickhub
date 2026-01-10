import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";

export const coursesRouter = createTRPCRouter({
  /**
   * Get all published courses with optional filters
   */
  getAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
          category: z.string().optional(),
          level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
          search: z.string().optional(),
          trainerId: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;

      const courses = await ctx.db.course.findMany({
        where: {
          status: "published",
          ...(input?.category ? { category: input.category } : {}),
          ...(input?.level ? { level: input.level } : {}),
          ...(input?.trainerId ? { trainerId: input.trainerId } : {}),
          ...(input?.search
            ? {
                OR: [
                  { title: { contains: input.search, mode: "insensitive" } },
                  { description: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : {}),
          ...(input?.minPrice !== undefined || input?.maxPrice !== undefined
            ? {
                price: {
                  ...(input?.minPrice !== undefined ? { gte: input.minPrice } : {}),
                  ...(input?.maxPrice !== undefined ? { lte: input.maxPrice } : {}),
                },
              }
            : {}),
        },
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              image: true,
              trainerProfile: {
                select: {
                  organizationName: true,
                },
              },
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (courses.length > limit) {
        const nextItem = courses.pop();
        nextCursor = nextItem?.id;
      }

      return {
        courses,
        nextCursor,
      };
    }),

  /**
   * Get a single course by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.db.course.findUnique({
        where: { id: input.id },
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              image: true,
              trainerProfile: {
                select: {
                  organizationName: true,
                  description: true,
                  specializations: true,
                  website: true,
                },
              },
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      return course;
    }),

  /**
   * Get courses by trainer (for trainer dashboard)
   */
  getTrainerCourses: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(["draft", "published", "archived"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const courses = await ctx.db.course.findMany({
        where: {
          trainerId: userId,
          ...(input?.status ? { status: input.status } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { enrollments: true, orders: true },
          },
        },
      });

      // Calculate revenue for each course
      const coursesWithRevenue = await Promise.all(
        courses.map(async (course) => {
          const orders = await ctx.db.order.findMany({
            where: {
              courseId: course.id,
              status: "paid",
            },
            select: { trainerPayout: true },
          });

          const totalRevenue = orders.reduce(
            (sum, order) => sum + (order.trainerPayout ?? 0),
            0
          );

          return {
            ...course,
            totalRevenue,
          };
        })
      );

      return coursesWithRevenue;
    }),

  /**
   * Create a new course
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().min(1),
        price: z.number().min(0),
        level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
        category: z.string().optional(),
        duration: z.string().optional(),
        thumbnail: z.string().url().optional(),
        skills: z.array(z.string()).default([]),
        status: z.enum(["draft", "published"]).default("draft"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify user is a trainer
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        include: { trainerProfile: true },
      });

      if (!user?.trainerProfile) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only trainers can create courses",
        });
      }

      const course = await ctx.db.course.create({
        data: {
          ...input,
          trainerId: userId,
        },
      });

      return course;
    }),

  /**
   * Update a course
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().min(1).optional(),
        price: z.number().min(0).optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        category: z.string().optional(),
        duration: z.string().optional(),
        thumbnail: z.string().url().optional(),
        skills: z.array(z.string()).optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        polarProductId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...updateData } = input;

      // Verify ownership
      const course = await ctx.db.course.findUnique({
        where: { id },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      if (course.trainerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own courses",
        });
      }

      const updated = await ctx.db.course.update({
        where: { id },
        data: updateData,
      });

      return updated;
    }),

  /**
   * Delete a course (soft delete by archiving)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      const course = await ctx.db.course.findUnique({
        where: { id: input.id },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      if (course.trainerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own courses",
        });
      }

      // Soft delete by archiving
      await ctx.db.course.update({
        where: { id: input.id },
        data: { status: "archived" },
      });

      return { success: true };
    }),

  /**
   * Get user's enrolled courses
   */
  getEnrolledCourses: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const enrollments = await ctx.db.enrollment.findMany({
      where: { userId },
      orderBy: { enrolledAt: "desc" },
      include: {
        course: {
          include: {
            trainer: {
              select: {
                id: true,
                name: true,
                image: true,
                trainerProfile: {
                  select: {
                    organizationName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return enrollments;
  }),

  /**
   * Check if user is enrolled in a course
   */
  isEnrolled: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const enrollment = await ctx.db.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: ctx.session.user.id,
            courseId: input.courseId,
          },
        },
      });

      return { enrolled: !!enrollment, enrollment };
    }),

  /**
   * Get course categories (distinct values)
   */
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const courses = await ctx.db.course.findMany({
      where: { status: "published" },
      select: { category: true },
      distinct: ["category"],
    });

    return courses
      .map((c) => c.category)
      .filter((c): c is string => c !== null);
  }),
});
