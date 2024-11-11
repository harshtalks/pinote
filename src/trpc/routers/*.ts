// All the routers

import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "../trpc";

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => {
    return "Hi this is working..";
  }),
});

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
