// All the routers

import { Effect, Either } from "effect";
import {
  asEither,
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "../*";
import Database, { provideDB } from "@/db/*";
import { ServerRuntime } from "../layer/*";

export const appRouter = createTRPCRouter({
  hello: publicProcedure.query(() => {
    return Database.pipe(
      Effect.andThen(() => Effect.succeed("hello world niceky done")),
      asEither,
      provideDB,
      ServerRuntime.runPromise,
    );
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
