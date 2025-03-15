import { readSessionFromCookieAndValidate } from "@/auth/auth.handlers";
import { provideDB } from "@/db/*";
import { ClientGroup } from "@/db/schema/*";
import { PrefixedIDs } from "@/db/schema/schema.helper";
import { CvrCache, makeCvrKey } from "@/lofi/cvr-cache";
import { notebookRepo, replicacheRepo } from "@/repositories/*";
import { Branded } from "@/types/*";
import { httpError } from "@/utils/*";
import { Array, Duration, Effect, Either, Match, Option } from "effect";
import { pipe } from "effect";
import { NextRequest, NextResponse } from "next/server";
import {
  Cookie,
  PatchOperation,
  PullRequestV1,
  PullResponseOKV1,
} from "replicache";
import { create } from "mutative";
import { notebookMutationKeys } from "@/lofi/notebooks/*";

export const POST = (request: NextRequest) => {
  return pipe(
    Effect.gen(function* () {
      const t1 = Duration.millis(Date.now());

      const pullRequestBody = yield* pipe(
        Effect.promise(() => request.json()),
        Effect.andThen((value) => value as PullRequestV1),
      );

      const { clientGroupID, cookie } = pullRequestBody;

      const prevCVR = yield* pipe(
        cookie,
        Match.value,
        Match.when(
          (
            cookie: Cookie,
          ): cookie is {
            order: number;
          } =>
            typeof cookie === "object" &&
            cookie !== null &&
            typeof cookie.order === "number",
          (cookie) =>
            CvrCache.pipe(
              Effect.andThen((x) =>
                x.get(makeCvrKey(clientGroupID, cookie.order.toString())),
              ),
            ),
        ),
        Match.orElse(() => Effect.succeed(undefined)),
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

      const baseCVR = Option.fromNullable(prevCVR).pipe(
        Option.match({
          onSome: (some) => some,
          onNone: () => ({
            notebooks: new Map<string, number>(),
          }),
        }),
      );

      const clientGroup = yield* pipe(
        clientGroupID,
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
            clientGroupId: clientGroupID,
            cvrVersion: pipe(
              cookie,
              Match.value,
              Match.when(
                (
                  cookie: Cookie,
                ): cookie is {
                  order: number;
                } =>
                  typeof cookie === "object" &&
                  cookie !== null &&
                  typeof cookie.order === "number",
                (cookie) => cookie.order,
              ),
              Match.orElse(() => 0),
            ),
            userId: user.user.id,
            id: PrefixedIDs.lofiClientGroup(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          } satisfies ClientGroup),
        ),
      );

      const clients = yield* pipe(
        clientGroupID,
        Branded.ReplicacheClientGroupId,
        replicacheRepo.getAllClientsForGroup,
      );

      const notebookCVR = yield* pipe(
        user.user.id,
        Branded.UserId,
        replicacheRepo.searchNotebookList,
        Effect.andThen(
          Array.map((notebook) => ({
            id: notebook.id,
            rowVersion: notebook.version,
          })),
        ),
        Effect.andThen((rows) =>
          pipe(new Map<string, number>(), (notebookMeta) =>
            pipe(
              rows,
              Array.forEach((row) => notebookMeta.set(row.id, row.rowVersion)),
              () => notebookMeta,
            ),
          ),
        ),
      );

      const notebookMeta = (() => {
        const updatesSinceLast: string[] = [];
        notebookCVR.forEach((rowVersion, id) => {
          const previous = baseCVR.notebooks.get(id);
          if (!previous || previous < rowVersion) {
            updatesSinceLast.push(id);
          }
        });

        return updatesSinceLast;
      })();

      const nextClientGroup = create(clientGroup, (group) => {
        group.cvrVersion += 1;
      });

      const updatedNotebooks = yield* pipe(
        notebookMeta,
        Array.map(Branded.NotebookId),
        notebookRepo.getNotebooksByNotebookIds,
      );

      yield* replicacheRepo.upsertClientGroup(nextClientGroup);

      const patchOperations = [] as PatchOperation[];

      if (!prevCVR) {
        patchOperations.push({
          op: "clear",
        });
      }

      pipe(
        updatedNotebooks,
        Array.forEach((updatedNotebook) => {
          patchOperations.push({
            op: "put",
            value: updatedNotebook,
            key: notebookMutationKeys.create(
              Branded.WorkspaceId(updatedNotebook.workspaceId),
              Branded.NotebookId(updatedNotebook.id),
            ),
          });
        }),
      );

      const respCookie = {
        clientGroupID: clientGroupID,
        order: nextClientGroup.cvrVersion,
      };

      const body: PullResponseOKV1 = {
        cookie: respCookie,
        patch: patchOperations,
        lastMutationIDChanges: pipe(
          clients,
          Array.map((client) => [client.id, client.lastMutationId]),
          Object.fromEntries,
        ),
      };

      yield* pipe(
        CvrCache,
        Effect.andThen((cache) =>
          cache.set(
            makeCvrKey(respCookie.clientGroupID, respCookie.order.toString()),
            {
              notebooks: notebookCVR,
            },
          ),
        ),
      );

      const t2 = Duration.millis(Date.now());

      const diff = Duration.subtract(t2, t1);

      yield* Effect.logInfo(
        `Pull happened at ${new Date(Duration.toMillis(t2)).toLocaleString()} and it took ${diff.toString()}`,
      );
      return NextResponse.json(body);
    }),
    Effect.withSpan("replicache.pull"),
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
    Effect.provide(CvrCache.Default),
    provideDB,
    Effect.runPromise,
  );
};
