import { readSessionFromCookieAndValidate } from "@/auth/auth.handlers";
import { provideDB } from "@/db/*";
import { Client, ClientGroup, Notebook } from "@/db/schema/*";
import { PrefixedIDs } from "@/db/schema/schema.helper";
import {
  isMutatorKeyOfNotebook,
  NotebookMutatorKeys,
} from "@/lofi/notebooks/notebook.mutators";
import { processNotebookMutation } from "@/lofi/notebooks/process-mutations";
import { replicacheRepo } from "@/repositories/*";
import { Branded } from "@/types/*";
import { httpError } from "@/utils/*";
import { Effect, Either, Match, pipe } from "effect";
import { NextRequest, NextResponse } from "next/server";
import { PushRequestV1 } from "replicache";

export const POST = (request: NextRequest) => {
  return pipe(
    Effect.gen(function* () {
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

      console.log(pushRequestBody.mutations);

      yield* Effect.forEach(pushRequestBody.mutations, (mutation) =>
        Effect.gen(function* () {
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

          if (mutation.id < nextMutationId || mutation.id > nextMutationId) {
            yield* new httpError.BadRequestError({
              message: "Mutation IDs are not in order",
            });
          }

          yield* pipe(
            mutation,
            Match.value,
            Match.when(
              {
                name: isMutatorKeyOfNotebook,
              },
              (mutation) => {
                return processNotebookMutation({
                  ...mutation,
                  name: mutation.name as NotebookMutatorKeys,
                  args: mutation.args as Notebook,
                });
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
        }),
      );

      return NextResponse.json({ hello: "word" });
    }),
    Effect.withSpan("replicache.push"),
    Effect.catchAll((err) => Effect.succeed(NextResponse.json(err))),
    Effect.catchAllDefect((err) => Effect.succeed(NextResponse.json(err))),
    provideDB,
    Effect.runPromise,
  );
};
