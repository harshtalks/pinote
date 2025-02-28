import { Branded } from "@/types/*";
import { Chunk, Effect, pipe, Stream } from "effect";
import { ReadTransaction } from "replicache";
import { notebookMutationKeys } from "./notebook.keys";
import { Notebook } from "@/db/schema/*";
import { NonEmptyArray } from "ts-essentials";

export const notebookQueries = {
  read: (
    tx: ReadTransaction,
    workspaceId: Branded.WorkspaceId,
    notebookId: Branded.NotebookId,
  ) =>
    pipe(
      Effect.promise(() =>
        tx.get<Notebook>(notebookMutationKeys.create(workspaceId, notebookId)),
      ),
      Effect.runPromise,
    ),
  readAll: (tx: ReadTransaction, workspaceId: Branded.WorkspaceId) =>
    pipe(
      Effect.promise(async () =>
        tx.scan({
          prefix: notebookMutationKeys.all(workspaceId),
        }),
      ),
      Effect.andThen((data) => data.values()),
      Effect.andThen((data) =>
        Stream.fromAsyncIterable(data, (e) => new Error(String(e))),
      ),
      Effect.andThen(Stream.runCollect),
      Effect.andThen(Chunk.toArray),
      Effect.andThen((data) => data as NonEmptyArray<Notebook>),
      Effect.runPromise,
    ),
};
