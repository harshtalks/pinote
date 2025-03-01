import { provideDB } from "@/db/*";
import { membersRepo } from "@/repositories/*";
import { trpcRunTime } from "@/trpc/layer/*";
import { authenticatedProcedure, createTRPCRouter } from "@/trpc/trpc";
import { inputAsSchema } from "@/trpc/utils.trpc";
import { Branded } from "@/types/*";
import { Result } from "@/utils/*";
import { Effect, Schema } from "effect";

export const membersRouter = createTRPCRouter({
  forUserAndWorkspace: authenticatedProcedure
    .input(
      inputAsSchema(
        Schema.Struct({
          userId: Schema.String.pipe(Schema.fromBrand(Branded.UserId)),
          workspaceId: Schema.String.pipe(
            Schema.fromBrand(Branded.WorkspaceId),
          ),
        }),
      ),
    )
    .query(({ input: { userId, workspaceId } }) => {
      return membersRepo
        .getMemberForUserInWorkspace(userId, workspaceId)
        .pipe(
          Result.flatten,
          Result.catchAll,
          Result.catchAllDefect,
          provideDB,
          Effect.withSpan("membersRouter.memberForUserInWorkspace"),
          trpcRunTime.runPromise,
        );
    }),
});
