import { provideDB } from "@/db/*";
import { addNewWorkspaceSchemaWithNoId } from "@/db/schema/*";
import { workspaceRepo } from "@/repositories/*";
import { trpcRunTime } from "@/trpc/layer/*";
import { authenticatedProcedure, createTRPCRouter } from "@/trpc/trpc";
import { Branded } from "@/types/*";
import { Result } from "@/utils/*";
import { Effect } from "effect";

export const workspaceRouter = createTRPCRouter({
  newWorkspace: authenticatedProcedure
    .input(addNewWorkspaceSchemaWithNoId)
    .mutation(({ ctx, input }) =>
      ctx.session.pipe(
        Effect.andThen(({ user: { id } }) =>
          workspaceRepo.addNewWorkspace({ ...input, creatorId: id }),
        ),
        Result.flatten,
        Result.catchAll,
        Result.catchAllDefect,
        provideDB,
        Effect.withSpan("workspaceRouter.newWorkspace"),
        trpcRunTime.runPromise,
      ),
    ),
  workspaces: authenticatedProcedure.query(({ ctx }) =>
    ctx.session.pipe(
      Effect.andThen(({ user: { id } }) =>
        workspaceRepo.getWorkspacesByUserId(Branded.UserId(id)),
      ),
      Result.flatten,
      Result.catchAll,
      Result.catchAllDefect,
      provideDB,
      Effect.withSpan("workspaceRouter.workspaces"),
      trpcRunTime.runPromise,
    ),
  ),
});
