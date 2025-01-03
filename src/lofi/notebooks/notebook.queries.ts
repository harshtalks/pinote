import { Branded } from "@/types/*";
import { Effect, pipe } from "effect";
import { ReadTransaction } from "replicache";
import { notebookMutationKeys } from "./notebook.keys";
import { Notebook } from "@/db/schema/*";

export const notebookQueries = {
  read: (tx: ReadTransaction, notebookId: Branded.NotebookId) =>
    pipe(
      Effect.promise(() =>
        tx.get<Notebook>(notebookMutationKeys.create(notebookId)),
      ),
      Effect.runPromise,
    ),
};
