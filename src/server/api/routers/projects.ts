import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

// Helper function to generate unique project key
async function generateProjectKey(db: typeof import("~/server/db").db): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const lastProject = await db.project.findFirst({
    orderBy: { createdAt: "desc" },
    select: { projectKey: true },
  });

  let nextNumber = 1;
  if (lastProject?.projectKey) {
    const match = /PRJ-(\d+)/.exec(lastProject.projectKey);
    if (match?.[1]) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `PRJ-${nextNumber.toString().padStart(3, "0")}`;
}

// Input validation schemas
const createProjectSchema = z.object({
  title: z.string().min(1, "Project title is required").max(200),
  description: z.string().min(1, "Project description is required"),
  budget: z.number().min(0, "Budget must be positive"),
  deadline: z.date(),
  category: z.string().min(1, "Category is required"),
  skills: z.array(z.string()).default([]),
  projectType: z.enum(["fixed", "hourly"]).default("fixed"),
  estimatedDuration: z.number().min(1).optional(),
  projectTemplate: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  visibility: z.enum(["public", "private", "invite_only"]).default("public"),
  minimumTier: z.enum(["bronze", "silver", "gold", "platinum"]).default("bronze"),
  hourlyRate: z.number().min(0).optional(),
});

const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.string(),
  status: z.enum(["open", "in_progress", "planning", "completed", "cancelled"]).optional(),
});

export const projectsRouter = createTRPCRouter({
  /**
   * Get all projects with optional filters (for talents to browse)
   */
  getAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
          search: z.string().optional(),
          category: z.string().optional(),
          status: z.string().optional(),
          projectType: z.string().optional(),
          minBudget: z.number().optional(),
          maxBudget: z.number().optional(),
          skills: z.array(z.string()).optional(),
          sortBy: z
            .enum(["newest", "budget_high", "budget_low", "deadline"])
            .default("newest"),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;

      // Build order by clause based on sortBy
      let orderBy: Record<string, string> = { createdAt: "desc" };
      if (input?.sortBy === "budget_high") {
        orderBy = { budget: "desc" };
      } else if (input?.sortBy === "budget_low") {
        orderBy = { budget: "asc" };
      } else if (input?.sortBy === "deadline") {
        orderBy = { deadline: "asc" };
      }

      const projects = await ctx.db.project.findMany({
        where: {
          visibility: "public",
          status: input?.status ?? "open",
          ...(input?.search
            ? {
                OR: [
                  { title: { contains: input.search, mode: "insensitive" } },
                  { description: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : {}),
          ...(input?.category ? { category: input.category } : {}),
          ...(input?.projectType ? { projectType: input.projectType } : {}),
          ...(input?.minBudget !== undefined
            ? { budget: { gte: input.minBudget } }
            : {}),
          ...(input?.maxBudget !== undefined
            ? { budget: { lte: input.maxBudget } }
            : {}),
          ...(input?.skills && input.skills.length > 0
            ? { skills: { hasSome: input.skills } }
            : {}),
        },
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              image: true,
              employerProfile: {
                select: {
                  companyName: true,
                  industry: true,
                  location: true,
                },
              },
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (projects.length > limit) {
        const nextItem = projects.pop();
        nextCursor = nextItem?.id;
      }

      return {
        projects,
        nextCursor,
      };
    }),

  /**
   * Get a single project by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              image: true,
              employerProfile: {
                select: {
                  companyName: true,
                  industry: true,
                  location: true,
                  description: true,
                  website: true,
                },
              },
            },
          },
          tasks: {
            orderBy: { createdAt: "desc" },
          },
          milestones: {
            orderBy: { startDate: "asc" },
          },
          _count: {
            select: { applications: true },
          },
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return project;
    }),

  /**
   * Get employer's projects (for employer dashboard)
   */
  getEmployerProjects: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(["open", "in_progress", "planning", "completed", "cancelled"]).optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const limit = input?.limit ?? 20;

      const projects = await ctx.db.project.findMany({
        where: {
          clientId: userId,
          ...(input?.status ? { status: input.status } : {}),
          ...(input?.search
            ? {
                OR: [
                  { title: { contains: input.search, mode: "insensitive" } },
                  { projectKey: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { applications: true, tasks: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (projects.length > limit) {
        const nextItem = projects.pop();
        nextCursor = nextItem?.id;
      }

      // Get stats
      const stats = await ctx.db.project.groupBy({
        by: ["status"],
        where: { clientId: userId },
        _count: true,
      });

      const totalProjects = stats.reduce((sum, s) => sum + s._count, 0);
      const openProjects = stats.find((s) => s.status === "open")?._count ?? 0;
      const inProgressProjects = stats.find((s) => s.status === "in_progress")?._count ?? 0;
      const planningProjects = stats.find((s) => s.status === "planning")?._count ?? 0;
      const completedProjects = stats.find((s) => s.status === "completed")?._count ?? 0;

      return {
        projects,
        nextCursor,
        stats: {
          total: totalProjects,
          open: openProjects,
          inProgress: inProgressProjects,
          planning: planningProjects,
          completed: completedProjects,
        },
      };
    }),

  /**
   * Create a new project
   */
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Generate unique project key
      const projectKey = await generateProjectKey(ctx.db);

      const project = await ctx.db.project.create({
        data: {
          ...input,
          projectKey,
          clientId: userId,
          status: "open",
        },
      });

      return project;
    }),

  /**
   * Update a project
   */
  update: protectedProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...updateData } = input;

      // Verify ownership
      const project = await ctx.db.project.findUnique({
        where: { id },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (project.clientId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own projects",
        });
      }

      const updated = await ctx.db.project.update({
        where: { id },
        data: updateData,
      });

      return updated;
    }),

  /**
   * Delete a project
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (project.clientId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own projects",
        });
      }

      await ctx.db.project.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Update project status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["open", "in_progress", "planning", "completed", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (project.clientId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own projects",
        });
      }

      const updated = await ctx.db.project.update({
        where: { id: input.id },
        data: { status: input.status },
      });

      return updated;
    }),

  /**
   * Get project categories for filters
   */
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: { status: "open", visibility: "public" },
      select: {
        category: true,
        skills: true,
      },
    });

    // Get unique categories with counts
    const categories: Record<string, number> = {};
    const allSkills: Record<string, number> = {};

    projects.forEach((project) => {
      categories[project.category] = (categories[project.category] ?? 0) + 1;
      project.skills.forEach((skill) => {
        allSkills[skill] = (allSkills[skill] ?? 0) + 1;
      });
    });

    return {
      categories: Object.entries(categories).map(([value, count]) => ({
        value,
        count,
      })),
      skills: Object.entries(allSkills)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20),
    };
  }),
});
