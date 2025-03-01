import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { Effect, Either } from "effect";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import Database from "@/db/*";
import { readSessionFromCookieAndValidate } from "@/auth/auth.handlers";
import { httpError } from "@/utils/*";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = (opts: {
  headers: Headers;
  cookies: ReadonlyRequestCookies;
}) => ({
  db: Database,
  session: readSessionFromCookieAndValidate().pipe(
    Effect.map((session) => Either.getOrNull(session)),
  ),
  cookies: Effect.succeed(opts.cookies),
  headers: Effect.succeed(opts.headers),
});

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return {
      ...shape,
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/**
 * Authenticated procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It guarantees that a user querying is authorized, and you can access user session data.
 */

export const authenticatedProcedure = t.procedure.use(({ ctx, next }) => {
  const sessionUpdated = ctx.session.pipe(
    Effect.andThen((session) => {
      if (!session) {
        return Effect.fail(
          new httpError.UnauthorizedError({
            message: "You are not authorized to access this resource",
          }),
        );
      } else return Effect.succeed(session);
    }),
  );
  return next({
    ctx: {
      session: sessionUpdated,
    },
  });
});
