import { Notebook } from "@/db/schema/*";
import { Effect, pipe } from "effect";
import { WriteTransaction } from "replicache";
import { notebookMutationKeys } from "./notebook.keys";
import { Merge } from "ts-essentials";

export const notebookMutators = {
  createNotebook: (tx: WriteTransaction, payload: Notebook) =>
    pipe(
      Effect.promise(() =>
        tx.set(notebookMutationKeys.create(payload.id), payload),
      ),
      Effect.as(payload),
      Effect.runPromise,
    ),
  updateNotebook: (
    tx: WriteTransaction,
    payload: Merge<Partial<Notebook>, Pick<Notebook, "id">>,
  ) =>
    pipe(
      Effect.promise(() =>
        tx.get<Notebook>(notebookMutationKeys.create(payload.id)),
      ),
      Effect.andThen((notebook) => ({
        ...notebook,
        ...payload,
      })),
      Effect.andThen((notebook) =>
        tx.set(notebookMutationKeys.create(payload.id), notebook),
      ),
      Effect.as(payload),
      Effect.runPromise,
    ),
};

export type NotebookMutators = typeof notebookMutators;
