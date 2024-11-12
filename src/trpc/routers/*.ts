// All the routers

import {
  authenticatedProcedure,
  createCallerFactory,
  createTRPCRouter,
} from "../trpc";
import { tfRouter } from "./tf/*";

export const appRouter = createTRPCRouter({
  health: authenticatedProcedure.query(() => {
    return "Hello World!!";
  }),
  twoFactor: tfRouter,
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
