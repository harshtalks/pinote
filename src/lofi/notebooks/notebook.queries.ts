import { Branded } from "@/types/*";
import { Chunk, Effect, pipe, Stream } from "effect";
import { ReadTransaction } from "replicache";
import { notebookMutationKeys } from "./notebook.keys";
import { Notebook } from "@/db/schema/*";
import { NonEmptyArray } from "ts-essentials";

export const notebookQueries = {
  read: (tx: ReadTransaction, notebookId: Branded.NotebookId) =>
    pipe(
      Effect.promise(() =>
        tx.get<Notebook>(notebookMutationKeys.create(notebookId)),
      ),
      Effect.runPromise,
    ),
  readAll: (tx: ReadTransaction) =>
    pipe(
      Effect.promise(async () =>
        tx.scan({
          prefix: notebookMutationKeys.all,
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
