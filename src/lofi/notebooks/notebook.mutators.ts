import { Notebook } from "@/db/schema/*";
import { Effect, pipe } from "effect";
import { WriteTransaction } from "replicache";
import { notebookMutationKeys } from "./notebook.keys";
import { Merge } from "ts-essentials";
import { Branded } from "@/types/*";
import { keyCaster } from "@/utils/casting";

export const notebookMutators = {
  createNotebook: (tx: WriteTransaction, payload: Notebook) =>
    pipe(
      Effect.promise(() =>
        tx.set(
          notebookMutationKeys.create(
            Branded.WorkspaceId(payload.workspaceId),
            Branded.NotebookId(payload.id),
          ),
          payload,
        ),
      ),
      Effect.as(payload),
      Effect.runPromise,
    ),
  updateNotebook: (
    tx: WriteTransaction,
    payload: Merge<Partial<Notebook>, Pick<Notebook, "id" | "workspaceId">>,
  ) =>
    pipe(
      Effect.promise(() =>
        tx.get<Notebook>(
          notebookMutationKeys.create(
            Branded.WorkspaceId(payload.workspaceId),
            Branded.NotebookId(payload.id),
          ),
        ),
      ),
      Effect.andThen((notebook) => ({
        ...notebook,
        ...payload,
      })),
      Effect.andThen((notebook) =>
        tx.set(
          notebookMutationKeys.create(
            Branded.WorkspaceId(payload.workspaceId),
            Branded.NotebookId(payload.id),
          ),
          notebook,
        ),
      ),
      Effect.runPromise,
    ),
} as const;

export type NotebookMutators = typeof notebookMutators;
export type NotebookMutatorKeys = keyof typeof notebookMutators;

export const {
  isKeyInObject: isMutatorKeyOfNotebook,
  objectKeys: notebookMutatorKeys,
} = keyCaster(notebookMutators);
