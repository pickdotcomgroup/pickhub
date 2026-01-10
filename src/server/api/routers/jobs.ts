import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

// Input validation schemas
const createJobSchema = z.object({
  // Basic Info
  title: z.string().min(1, "Job title is required").max(200),
  employmentType: z.enum([
    "Full-time",
    "Part-time",
    "Contract",
    "Freelance",
    "Internship",
  ]),
  workLocationType: z.enum(["Remote", "On-site", "Hybrid"]),
  location: z.string().optional(),
  // Salary
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  salaryPeriod: z
    .enum(["Per Year", "Per Month", "Per Hour", "Per Project"])
    .optional(),
  // Description
  description: z.string().min(1, "Job description is required"),
  // Requirements
  experienceLevel: z.enum([
    "Entry Level",
    "Mid Level",
    "Senior Level",
    "Lead",
    "Executive",
  ]),
  education: z
    .enum([
      "High School",
      "Associate Degree",
      "Bachelor's",
      "Master's",
      "PhD",
      "No Requirement",
    ])
    .optional(),
  skills: z.array(z.string()).default([]),
  responsibilities: z.string().optional(),
  qualifications: z.string().optional(),
  // Benefits & Perks
  benefits: z.array(z.string()).default([]),
  equity: z.string().optional(),
  signingBonus: z.number().min(0).optional(),
  relocationAssistance: z.boolean().default(false),
  visaSponsorship: z.boolean().default(false),
  // Status
  status: z.enum(["draft", "active"]).default("draft"),
});

const updateJobSchema = createJobSchema.partial().extend({
  id: z.string(),
  status: z.enum(["draft", "active", "closed"]).optional(),
});

export const jobsRouter = createTRPCRouter({
  /**
   * Get all active jobs with optional filters (for talents)
   */
  getAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
          search: z.string().optional(),
          location: z.string().optional(),
          employmentType: z.string().optional(),
          workLocationType: z.string().optional(),
          experienceLevel: z.string().optional(),
          salaryMin: z.number().optional(),
          salaryMax: z.number().optional(),
          skills: z.array(z.string()).optional(),
          sortBy: z
            .enum(["newest", "salary_high", "salary_low", "relevant"])
            .default("newest"),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;

      // Build order by clause based on sortBy
      let orderBy: Record<string, string> = { createdAt: "desc" };
      if (input?.sortBy === "salary_high") {
        orderBy = { salaryMax: "desc" };
      } else if (input?.sortBy === "salary_low") {
        orderBy = { salaryMin: "asc" };
      }

      const jobs = await ctx.db.job.findMany({
        where: {
          status: "active",
          ...(input?.search
            ? {
                OR: [
                  { title: { contains: input.search, mode: "insensitive" } },
                  {
                    description: { contains: input.search, mode: "insensitive" },
                  },
                ],
              }
            : {}),
          ...(input?.location
            ? { location: { contains: input.location, mode: "insensitive" } }
            : {}),
          ...(input?.employmentType
            ? { employmentType: input.employmentType }
            : {}),
          ...(input?.workLocationType
            ? { workLocationType: input.workLocationType }
            : {}),
          ...(input?.experienceLevel
            ? { experienceLevel: input.experienceLevel }
            : {}),
          ...(input?.salaryMin !== undefined
            ? { salaryMax: { gte: input.salaryMin } }
            : {}),
          ...(input?.salaryMax !== undefined
            ? { salaryMin: { lte: input.salaryMax } }
            : {}),
          ...(input?.skills && input.skills.length > 0
            ? { skills: { hasSome: input.skills } }
            : {}),
        },
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy,
        include: {
          employer: {
            select: {
              id: true,
              name: true,
              image: true,
              employerProfile: {
                select: {
                  companyName: true,
                  industry: true,
                  location: true,
                  companySize: true,
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
      if (jobs.length > limit) {
        const nextItem = jobs.pop();
        nextCursor = nextItem?.id;
      }

      return {
        jobs,
        nextCursor,
      };
    }),

  /**
   * Get a single job by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.job.findUnique({
        where: { id: input.id },
        include: {
          employer: {
            select: {
              id: true,
              name: true,
              image: true,
              employerProfile: {
                select: {
                  companyName: true,
                  industry: true,
                  location: true,
                  companySize: true,
                  description: true,
                  website: true,
                },
              },
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      // Increment view count
      await ctx.db.job.update({
        where: { id: input.id },
        data: { viewCount: { increment: 1 } },
      });

      return job;
    }),

  /**
   * Get employer's jobs (for employer dashboard)
   */
  getEmployerJobs: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(["draft", "active", "closed"]).optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const limit = input?.limit ?? 20;

      const jobs = await ctx.db.job.findMany({
        where: {
          employerId: userId,
          ...(input?.status ? { status: input.status } : {}),
          ...(input?.search
            ? { title: { contains: input.search, mode: "insensitive" } }
            : {}),
        },
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { applications: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (jobs.length > limit) {
        const nextItem = jobs.pop();
        nextCursor = nextItem?.id;
      }

      // Get stats
      const stats = await ctx.db.job.groupBy({
        by: ["status"],
        where: { employerId: userId },
        _count: true,
      });

      const totalJobs = stats.reduce((sum, s) => sum + s._count, 0);
      const activeJobs = stats.find((s) => s.status === "active")?._count ?? 0;
      const draftJobs = stats.find((s) => s.status === "draft")?._count ?? 0;
      const closedJobs = stats.find((s) => s.status === "closed")?._count ?? 0;

      return {
        jobs,
        nextCursor,
        stats: {
          total: totalJobs,
          active: activeJobs,
          draft: draftJobs,
          closed: closedJobs,
        },
      };
    }),

  /**
   * Create a new job posting
   */
  create: protectedProcedure
    .input(createJobSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify user is an employer
      // const _user = await ctx.db.user.findUnique({
      //   where: { id: userId },
      // });

      const job = await ctx.db.job.create({
        data: {
          ...input,
          employerId: userId,
        },
      });

      return job;
    }),

  /**
   * Update a job posting
   */
  update: protectedProcedure
    .input(updateJobSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...updateData } = input;

      // Verify ownership
      const job = await ctx.db.job.findUnique({
        where: { id },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      if (job.employerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own job postings",
        });
      }

      const updated = await ctx.db.job.update({
        where: { id },
        data: updateData,
      });

      return updated;
    }),

  /**
   * Delete a job posting
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      const job = await ctx.db.job.findUnique({
        where: { id: input.id },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      if (job.employerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own job postings",
        });
      }

      await ctx.db.job.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Publish a draft job
   */
  publish: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const job = await ctx.db.job.findUnique({
        where: { id: input.id },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      if (job.employerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only publish your own job postings",
        });
      }

      if (job.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft jobs can be published",
        });
      }

      const updated = await ctx.db.job.update({
        where: { id: input.id },
        data: { status: "active" },
      });

      return updated;
    }),

  /**
   * Close a job posting
   */
  close: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const job = await ctx.db.job.findUnique({
        where: { id: input.id },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      if (job.employerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only close your own job postings",
        });
      }

      const updated = await ctx.db.job.update({
        where: { id: input.id },
        data: { status: "closed" },
      });

      return updated;
    }),

  /**
   * Apply to a job (for talents)
   */
  applyToJob: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        coverLetter: z.string().optional(),
        resumeUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify user is a talent
      const _user = await ctx.db.user.findUnique({
        where: { id: userId },
        include: { talentProfile: true },
      });

      // Check if job exists and is active
      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      if (job.status !== "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This job is no longer accepting applications",
        });
      }

      // Check if already applied
      const existingApplication = await ctx.db.jobApplication.findUnique({
        where: {
          jobId_talentId: {
            jobId: input.jobId,
            talentId: userId,
          },
        },
      });

      if (existingApplication) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already applied to this job",
        });
      }

      const application = await ctx.db.jobApplication.create({
        data: {
          jobId: input.jobId,
          talentId: userId,
          coverLetter: input.coverLetter,
          resumeUrl: input.resumeUrl,
        },
      });

      return application;
    }),

  /**
   * Get job applications (for employer)
   */
  getApplications: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        status: z
          .enum(["pending", "reviewed", "shortlisted", "rejected", "hired"])
          .optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const limit = input.limit;

      // Verify ownership of the job
      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      if (job.employerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view applications for your own job postings",
        });
      }

      const applications = await ctx.db.jobApplication.findMany({
        where: {
          jobId: input.jobId,
          ...(input.status ? { status: input.status } : {}),
        },
        take: limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          talent: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              talentProfile: {
                select: {
                  title: true,
                  skills: true,
                  experience: true,
                  hourlyRate: true,
                  portfolio: true,
                },
              },
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (applications.length > limit) {
        const nextItem = applications.pop();
        nextCursor = nextItem?.id;
      }

      return {
        applications,
        nextCursor,
      };
    }),

  /**
   * Update application status (for employer)
   */
  updateApplicationStatus: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        status: z.enum([
          "pending",
          "reviewed",
          "shortlisted",
          "rejected",
          "hired",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const application = await ctx.db.jobApplication.findUnique({
        where: { id: input.applicationId },
        include: { job: true },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      if (application.job.employerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update applications for your own job postings",
        });
      }

      const updated = await ctx.db.jobApplication.update({
        where: { id: input.applicationId },
        data: { status: input.status },
      });

      return updated;
    }),

  /**
   * Get single application details (for employer)
   */
  getApplicationById: protectedProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const application = await ctx.db.jobApplication.findUnique({
        where: { id: input.applicationId },
        include: {
          talent: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              createdAt: true,
              talentProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                  title: true,
                  skills: true,
                  experience: true,
                  hourlyRate: true,
                  portfolio: true,
                  portfolioUrl: true,
                  bio: true,
                  certifications: true,
                  phone: true,
                  resumeUrl: true,
                  resumeName: true,
                  completedProjects: true,
                  successRate: true,
                  tier: true,
                },
              },
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              description: true,
              skills: true,
              location: true,
              workLocationType: true,
              employmentType: true,
              salaryMin: true,
              salaryMax: true,
              salaryPeriod: true,
              experienceLevel: true,
              employerId: true,
              employer: {
                select: {
                  id: true,
                  name: true,
                  employerProfile: {
                    select: {
                      companyName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      // Verify the employer owns this job
      if (application.job.employerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view applications for your own job postings",
        });
      }

      // Calculate match score
      const talentSkills =
        application.talent.talentProfile?.skills.map((s) => s.toLowerCase()) ?? [];
      const jobSkills = application.job.skills.map((s) => s.toLowerCase());
      const matchingSkills = application.talent.talentProfile?.skills.filter((s) =>
        jobSkills.includes(s.toLowerCase())
      ) ?? [];
      const missingSkills = application.job.skills.filter(
        (s) => !talentSkills.includes(s.toLowerCase())
      );
      const matchScore =
        jobSkills.length > 0
          ? Math.round((matchingSkills.length / jobSkills.length) * 100)
          : 0;

      return {
        ...application,
        matchScore,
        matchingSkills,
        missingSkills,
      };
    }),

  /**
   * Get user's job applications (for talent)
   */
  getMyApplications: protectedProcedure
    .input(
      z
        .object({
          status: z
            .enum(["pending", "reviewed", "shortlisted", "rejected", "hired"])
            .optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const limit = input?.limit ?? 20;

      const applications = await ctx.db.jobApplication.findMany({
        where: {
          talentId: userId,
          ...(input?.status ? { status: input.status } : {}),
        },
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          job: {
            include: {
              employer: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  employerProfile: {
                    select: {
                      companyName: true,
                      industry: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (applications.length > limit) {
        const nextItem = applications.pop();
        nextCursor = nextItem?.id;
      }

      return {
        applications,
        nextCursor,
      };
    }),

  /**
   * Check if user has applied to a job
   */
  hasApplied: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      const application = await ctx.db.jobApplication.findUnique({
        where: {
          jobId_talentId: {
            jobId: input.jobId,
            talentId: ctx.session.user.id,
          },
        },
      });

      return { applied: !!application, application };
    }),

  /**
   * Get all applications for employer's jobs
   */
  getAllEmployerApplications: protectedProcedure
    .input(
      z
        .object({
          jobId: z.string().optional(),
          status: z
            .enum(["pending", "reviewed", "shortlisted", "rejected", "hired"])
            .optional(),
          search: z.string().optional(),
          sortBy: z
            .enum(["newest", "oldest", "match_high", "match_low"])
            .default("newest"),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const limit = input?.limit ?? 20;

      // First get all jobs belonging to this employer
      const employerJobs = await ctx.db.job.findMany({
        where: { employerId: userId },
        select: { id: true },
      });

      const jobIds = employerJobs.map((j) => j.id);

      if (jobIds.length === 0) {
        return {
          applications: [],
          nextCursor: undefined,
          stats: {
            pendingReview: 0,
            totalActive: 0,
          },
        };
      }

      // Build where clause
      const whereClause: {
        jobId: { in: string[] };
        status?: string;
        OR?: Array<{
          talent?: {
            OR: Array<{
              name?: { contains: string; mode: "insensitive" };
              email?: { contains: string; mode: "insensitive" };
            }>;
          };
          job?: { title: { contains: string; mode: "insensitive" } };
        }>;
      } = {
        jobId: input?.jobId ? { in: [input.jobId] } : { in: jobIds },
        ...(input?.status ? { status: input.status } : {}),
      };

      // Add search filter
      if (input?.search) {
        whereClause.OR = [
          {
            talent: {
              OR: [
                { name: { contains: input.search, mode: "insensitive" } },
                { email: { contains: input.search, mode: "insensitive" } },
              ],
            },
          },
          { job: { title: { contains: input.search, mode: "insensitive" } } },
        ];
      }

      // Build order by clause
      let orderBy: Record<string, string> = { createdAt: "desc" };
      if (input?.sortBy === "oldest") {
        orderBy = { createdAt: "asc" };
      }

      const applications = await ctx.db.jobApplication.findMany({
        where: whereClause,
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy,
        include: {
          talent: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              talentProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                  title: true,
                  skills: true,
                  experience: true,
                  hourlyRate: true,
                  portfolio: true,
                },
              },
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              skills: true,
              location: true,
              workLocationType: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (applications.length > limit) {
        const nextItem = applications.pop();
        nextCursor = nextItem?.id;
      }

      // Get stats
      const pendingReview = await ctx.db.jobApplication.count({
        where: {
          jobId: { in: jobIds },
          status: "pending",
        },
      });

      const totalActive = await ctx.db.jobApplication.count({
        where: {
          jobId: { in: jobIds },
          status: { not: "rejected" },
        },
      });

      // Calculate match scores for each application
      const applicationsWithMatch = applications.map((app) => {
        const talentSkills =
          app.talent.talentProfile?.skills.map((s) => s.toLowerCase()) ?? [];
        const jobSkills = app.job.skills.map((s) => s.toLowerCase());
        const matchingSkills = talentSkills.filter((s) =>
          jobSkills.includes(s)
        );
        const matchScore =
          jobSkills.length > 0
            ? Math.round((matchingSkills.length / jobSkills.length) * 100)
            : 0;

        return {
          ...app,
          matchScore,
        };
      });

      // Sort by match score if requested
      if (input?.sortBy === "match_high") {
        applicationsWithMatch.sort((a, b) => b.matchScore - a.matchScore);
      } else if (input?.sortBy === "match_low") {
        applicationsWithMatch.sort((a, b) => a.matchScore - b.matchScore);
      }

      return {
        applications: applicationsWithMatch,
        nextCursor,
        stats: {
          pendingReview,
          totalActive,
        },
      };
    }),

  /**
   * Get employer's jobs for filter dropdown
   */
  getEmployerJobsForFilter: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const jobs = await ctx.db.job.findMany({
      where: { employerId: userId },
      select: {
        id: true,
        title: true,
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return jobs;
  }),

  /**
   * Get job categories/filters data
   */
  getFilters: publicProcedure.query(async ({ ctx }) => {
    const jobs = await ctx.db.job.findMany({
      where: { status: "active" },
      select: {
        employmentType: true,
        workLocationType: true,
        experienceLevel: true,
        skills: true,
      },
    });

    // Get unique values with counts
    const employmentTypes: Record<string, number> = {};
    const workLocationTypes: Record<string, number> = {};
    const experienceLevels: Record<string, number> = {};
    const allSkills: Record<string, number> = {};

    jobs.forEach((job) => {
      employmentTypes[job.employmentType] =
        (employmentTypes[job.employmentType] ?? 0) + 1;
      workLocationTypes[job.workLocationType] =
        (workLocationTypes[job.workLocationType] ?? 0) + 1;
      experienceLevels[job.experienceLevel] =
        (experienceLevels[job.experienceLevel] ?? 0) + 1;
      job.skills.forEach((skill) => {
        allSkills[skill] = (allSkills[skill] ?? 0) + 1;
      });
    });

    return {
      employmentTypes: Object.entries(employmentTypes).map(([value, count]) => ({
        value,
        count,
      })),
      workLocationTypes: Object.entries(workLocationTypes).map(
        ([value, count]) => ({ value, count })
      ),
      experienceLevels: Object.entries(experienceLevels).map(
        ([value, count]) => ({ value, count })
      ),
      skills: Object.entries(allSkills)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20), // Top 20 skills
    };
  }),
});
