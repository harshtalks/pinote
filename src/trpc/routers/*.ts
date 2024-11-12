// All the routers

import { Effect } from "effect";
import {
  authenticatedProcedure,
  createCallerFactory,
  createTRPCRouter,
} from "../trpc";
import { provideDB } from "@/db/*";
import { asEither } from "../utils.trpc";
import { trpcRunTime } from "../layer/*";

export const appRouter = createTRPCRouter({
  health: authenticatedProcedure.query(({ ctx }) => {
    return Effect.gen(function* () {
      const session = yield* ctx.session;
      return session.session.id;
    }).pipe(provideDB, asEither, trpcRunTime.runPromise);
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
