import { provideDB } from "@/db/*";
import { trpcRunTime } from "@/trpc/layer/*";
import { authenticatedProcedure, createTRPCRouter } from "@/trpc/trpc";
import { Effect } from "effect";

export const userRouter = createTRPCRouter({
  me: authenticatedProcedure.query(({ ctx }) =>
    ctx.session.pipe(
      Effect.map((session) => session.user),
      provideDB,
      trpcRunTime.runPromise,
    ),
  ),
});
