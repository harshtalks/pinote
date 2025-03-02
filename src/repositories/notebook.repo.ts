import Database from "@/db/*";
import { Notebook, notebooks } from "@/db/schema/*";
import { Array, Effect, pipe } from "effect";
import { dbTry } from "./common";
import { httpError } from "@/utils/*";
import { Merge } from "ts-essentials";
import { eq, inArray } from "drizzle-orm";
import { Branded } from "@/types/*";

export const addNewNotebook = (notebook: Notebook) =>
  pipe(
    Database,
    dbTry((db) => db.insert(notebooks).values(notebook).returning()),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "No notebook returned from the db",
        }),
    ),
    Effect.andThen((result) => result[0]),
    Effect.withSpan("notebookRepo.createNotebook"),
  );

export const updateNotebook = (
  notebook: Merge<Partial<Notebook>, Pick<Notebook, "id">>,
) =>
  pipe(
    Database,
    dbTry((db) =>
      db
        .update(notebooks)
        .set(notebook)
        .where(eq(notebooks.id, notebook.id))
        .returning(),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "No notebook returned from the db",
        }),
    ),
    Effect.andThen((result) => result[0]),
    Effect.withSpan("notebookRepo.updateNotebook"),
  );

export const getNotebooksForWorkspaces = (
  workspaceIds: Branded.WorkspaceId[],
) =>
  pipe(
    Database,
    dbTry((db) =>
      db
        .select()
        .from(notebooks)
        .where(inArray(notebooks.workspaceId, workspaceIds)),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "No notebook found for the given workspace IDs",
        }),
    ),
    Effect.withSpan("notebookRepo.getNotebooksForWorkspaces"),
  );

export const getNotebooksByNotebookIds = (notebookIds: Branded.NotebookId[]) =>
  pipe(
    Database,
    dbTry((db) =>
      db.select().from(notebooks).where(inArray(notebooks.id, notebookIds)),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "No notebook found for the given notebook IDs",
        }),
    ),
    Effect.withSpan("notebookRepo.getNotebooksByNotebookIds"),
  );
