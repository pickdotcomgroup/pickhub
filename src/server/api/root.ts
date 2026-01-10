import { postRouter } from "~/server/api/routers/post";
import { paymentsRouter } from "~/server/api/routers/payments";
import { coursesRouter } from "~/server/api/routers/courses";
import { enrollmentsRouter } from "~/server/api/routers/enrollments";
import { jobsRouter } from "~/server/api/routers/jobs";
import { projectsRouter } from "~/server/api/routers/projects";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  payments: paymentsRouter,
  courses: coursesRouter,
  enrollments: enrollmentsRouter,
  jobs: jobsRouter,
  projects: projectsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
