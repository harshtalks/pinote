import { provideDB } from "@/db/*";
import { userRepo } from "@/repositories/*";
import { trpcRunTime } from "@/trpc/layer/*";
import { authenticatedProcedure, createTRPCRouter } from "@/trpc/trpc";
import { Branded } from "@/types/*";
import { Result } from "@/utils/*";
import { Effect } from "effect";

export const userRouter = createTRPCRouter({
  me: authenticatedProcedure.query(({ ctx }) =>
    ctx.session.pipe(
      Effect.map((session) => session.user),
      provideDB,
      trpcRunTime.runPromise,
    ),
  ),
  reset: authenticatedProcedure.mutation(({ ctx }) => {
    return ctx.session.pipe(
      Effect.andThen(({ user: { id } }) =>
        userRepo.resetUser(Branded.UserId(id)),
      ),
      provideDB,
      Result.flatten,
      Result.catchAll,
      Result.catchAllDefect,
      trpcRunTime.runPromise,
    );
  }),
});
