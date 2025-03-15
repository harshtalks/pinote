import { readSessionFromCookieAndValidate } from "@/auth/auth.handlers";
import { provideDB } from "@/db/*";
import { Client, ClientGroup, Notebook } from "@/db/schema/*";
import { PrefixedIDs } from "@/db/schema/schema.helper";
import { isMutatorKeyOfNotebook } from "@/lofi/notebooks/notebook.mutators";
import { processNotebookMutation } from "@/lofi/notebooks/process-mutations";
import { notebookRepo, replicacheRepo } from "@/repositories/*";
import { Branded } from "@/types/*";
import { httpError } from "@/utils/*";
import { Duration, Effect, Either, Match, pipe } from "effect";
import { NextRequest, NextResponse } from "next/server";
import { PushRequestV1 } from "replicache";

export const POST = (request: NextRequest) => {
  return pipe(
    Effect.gen(function* () {
      const t1 = Duration.millis(Date.now());

      const pushRequestBody = yield* pipe(
        Effect.promise(() => request.json()),
        Effect.andThen((data) => data as PushRequestV1),
      );

      const user = yield* readSessionFromCookieAndValidate().pipe(
        Effect.andThen((x) =>
          Either.getOrThrowWith(
            x,
            () =>
              new httpError.UnauthorizedError({
                message: "Unauthorized",
              }),
          ),
        ),
      );

      const clientGroup = yield* pipe(
        pushRequestBody.clientGroupID,
        Branded.ReplicacheClientGroupId,
        replicacheRepo.getClientGroupById,
        Effect.filterOrFail(
          (clientGroup) => clientGroup.userId === user.user.id,
          () =>
            new httpError.ForbiddenError({
              message: "User does not own this client group",
            }),
        ),
        Effect.catchTag("NotFoundError", () =>
          Effect.succeed({
            clientGroupId: pushRequestBody.clientGroupID,
            cvrVersion: 0,
            userId: user.user.id,
            id: PrefixedIDs.lofiClientGroup(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          } satisfies ClientGroup),
        ),
      );

      for (const mutation of pushRequestBody.mutations) {
        const client = yield* pipe(
          mutation.clientID,
          Branded.ReplicacheClientId,
          replicacheRepo.getClientByClientId,
          Effect.filterOrFail(
            (client) => client.clientGroupId === clientGroup.clientGroupId,
            () =>
              new httpError.ForbiddenError({
                message: "Client does not belong to the client group",
              }),
          ),
          Effect.catchTag("NotFoundError", () =>
            Effect.succeed({
              clientId: mutation.clientID,
              clientGroupId: clientGroup.clientGroupId,
              lastMutationId: 0,
              id: PrefixedIDs.lofiClient(),
              createdAt: Date.now(),
              updatedAt: Date.now(),
            } satisfies Client),
          ),
        );

        const nextMutationId = client.lastMutationId + 1;

        if (mutation.id < nextMutationId) {
          yield* Effect.logInfo("Mutation ID is already processed.");
        } else if (mutation.id > nextMutationId) {
          yield* new httpError.BadRequestError({
            message: "Mutation IDs are not in order",
          });
        } else {
          yield* pipe(
            mutation,
            Match.value,
            Match.when(
              {
                name: isMutatorKeyOfNotebook,
              },
              (mutation) => {
                return pipe(
                  mutation,
                  (mutation) => ({
                    ...mutation,
                    args: mutation.args as Notebook,
                  }),
                  (mutation) =>
                    notebookRepo
                      .getNotebookByNotebookId(
                        Branded.NotebookId(mutation.args.id),
                      )
                      .pipe(
                        Effect.andThen((notebook) =>
                          processNotebookMutation({
                            ...mutation,
                            name: mutation.name,
                            args: {
                              ...notebook,
                              ...mutation.args,
                            },
                          }),
                        ),
                        Effect.catchAll(() => {
                          return processNotebookMutation({
                            ...mutation,
                            name: mutation.name,
                            args: mutation.args,
                          });
                        }),
                      ),
                );
              },
            ),
            Match.orElse(() => {
              return Effect.fail(
                new httpError.InternalServerError({
                  message: "Unknown mutation type",
                }),
              );
            }),
          );

          yield* replicacheRepo.upsertClientGroup(clientGroup);
          yield* replicacheRepo.upsertClient({
            ...client,
            lastMutationId: nextMutationId,
          });
        }
      }

      const t2 = Duration.millis(Date.now());

      const diff = Duration.subtract(t2, t1);

      yield* Effect.logInfo(
        `Push happened at ${new Date(Duration.toMillis(t2)).toLocaleString()} and it took ${diff.toString()}`,
      );

      return NextResponse.json({});
    }),
    Effect.withSpan("replicache.push"),
    Effect.catchAll((err) =>
      Effect.zipRight(
        Effect.logError(err),
        Effect.succeed(
          NextResponse.json(err, {
            status: err.status,
          }),
        ),
      ),
    ),
    Effect.catchAllDefect((err) =>
      Effect.zipRight(
        Effect.logError(err),
        Effect.succeed(
          NextResponse.json(err, {
            status: 500,
          }),
        ),
      ),
    ),
    provideDB,
    Effect.runPromise,
  );
};
