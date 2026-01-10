import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const enrollmentsRouter = createTRPCRouter({
  /**
   * Get all enrollments for the current user
   */
  getUserEnrollments: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(["active", "completed", "paused", "expired"]).optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const limit = input?.limit ?? 20;

      const enrollments = await ctx.db.enrollment.findMany({
        where: {
          userId,
          ...(input?.status ? { status: input.status } : {}),
        },
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
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
                    select: { organizationName: true },
                  },
                },
              },
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (enrollments.length > limit) {
        const nextItem = enrollments.pop();
        nextCursor = nextItem?.id;
      }

      return {
        enrollments,
        nextCursor,
      };
    }),

  /**
   * Get a specific enrollment
   */
  getEnrollment: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const enrollment = await ctx.db.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: ctx.session.user.id,
            courseId: input.courseId,
          },
        },
        include: {
          course: {
            include: {
              trainer: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  trainerProfile: {
                    select: { organizationName: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!enrollment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Enrollment not found",
        });
      }

      return enrollment;
    }),

  /**
   * Update course progress
   */
  updateProgress: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        progress: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const enrollment = await ctx.db.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: input.courseId,
          },
        },
      });

      if (!enrollment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Enrollment not found",
        });
      }

      // Auto-complete if progress is 100%
      const updateData: {
        progress: number;
        status?: string;
        completedAt?: Date;
      } = {
        progress: input.progress,
      };

      if (input.progress >= 100 && enrollment.status !== "completed") {
        updateData.status = "completed";
        updateData.completedAt = new Date();
      }

      const updated = await ctx.db.enrollment.update({
        where: {
          userId_courseId: {
            userId,
            courseId: input.courseId,
          },
        },
        data: updateData,
      });

      return updated;
    }),

  /**
   * Mark course as completed
   */
  markCompleted: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const enrollment = await ctx.db.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: input.courseId,
          },
        },
      });

      if (!enrollment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Enrollment not found",
        });
      }

      const updated = await ctx.db.enrollment.update({
        where: {
          userId_courseId: {
            userId,
            courseId: input.courseId,
          },
        },
        data: {
          status: "completed",
          progress: 100,
          completedAt: new Date(),
        },
      });

      // Create notification
      await ctx.db.notification.create({
        data: {
          userId,
          type: "course_completed",
          title: "Course Completed!",
          message: "Congratulations on completing the course!",
          relatedProjectId: null,
        },
      });

      return updated;
    }),

  /**
   * Pause/resume enrollment
   */
  togglePause: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const enrollment = await ctx.db.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: input.courseId,
          },
        },
      });

      if (!enrollment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Enrollment not found",
        });
      }

      if (enrollment.status === "completed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot pause a completed course",
        });
      }

      const newStatus = enrollment.status === "paused" ? "active" : "paused";

      const updated = await ctx.db.enrollment.update({
        where: {
          userId_courseId: {
            userId,
            courseId: input.courseId,
          },
        },
        data: { status: newStatus },
      });

      return updated;
    }),

  /**
   * Get enrollment statistics for the current user
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [total, inProgress, completed] = await Promise.all([
      ctx.db.enrollment.count({ where: { userId } }),
      ctx.db.enrollment.count({ where: { userId, status: "active" } }),
      ctx.db.enrollment.count({ where: { userId, status: "completed" } }),
    ]);

    // Calculate average progress across active enrollments
    const activeEnrollments = await ctx.db.enrollment.findMany({
      where: { userId, status: "active" },
      select: { progress: true },
    });

    const averageProgress =
      activeEnrollments.length > 0
        ? activeEnrollments.reduce((sum, e) => sum + e.progress, 0) /
          activeEnrollments.length
        : 0;

    return {
      total,
      inProgress,
      completed,
      averageProgress: Math.round(averageProgress),
    };
  }),

  /**
   * Get trainer's student enrollments (for trainer dashboard)
   */
  getTrainerEnrollments: protectedProcedure
    .input(
      z
        .object({
          courseId: z.string().optional(),
          status: z.enum(["active", "completed", "paused", "expired"]).optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const limit = input?.limit ?? 20;

      // Get trainer's course IDs
      const trainerCourses = await ctx.db.course.findMany({
        where: { trainerId: userId },
        select: { id: true },
      });

      const courseIds = trainerCourses.map((c) => c.id);

      if (courseIds.length === 0) {
        return { enrollments: [], nextCursor: undefined };
      }

      const enrollments = await ctx.db.enrollment.findMany({
        where: {
          courseId: {
            in: input?.courseId ? [input.courseId] : courseIds,
          },
          ...(input?.status ? { status: input.status } : {}),
        },
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: { enrolledAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (enrollments.length > limit) {
        const nextItem = enrollments.pop();
        nextCursor = nextItem?.id;
      }

      return {
        enrollments,
        nextCursor,
      };
    }),

  /**
   * Get enrollment counts for trainer dashboard
   */
  getTrainerStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get trainer's course IDs
    const trainerCourses = await ctx.db.course.findMany({
      where: { trainerId: userId },
      select: { id: true },
    });

    const courseIds = trainerCourses.map((c) => c.id);

    if (courseIds.length === 0) {
      return {
        totalStudents: 0,
        activeStudents: 0,
        completedStudents: 0,
        totalCourses: 0,
      };
    }

    const [totalStudents, activeStudents, completedStudents] = await Promise.all([
      ctx.db.enrollment.count({ where: { courseId: { in: courseIds } } }),
      ctx.db.enrollment.count({
        where: { courseId: { in: courseIds }, status: "active" },
      }),
      ctx.db.enrollment.count({
        where: { courseId: { in: courseIds }, status: "completed" },
      }),
    ]);

    return {
      totalStudents,
      activeStudents,
      completedStudents,
      totalCourses: courseIds.length,
    };
  }),
});
