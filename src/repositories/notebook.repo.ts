import Database from "@/db/*";
import { Notebook, notebooks } from "@/db/schema/*";
import { Array, Effect, pipe } from "effect";
import { dbTry } from "./common";
import { httpError } from "@/utils/*";
import { Merge } from "ts-essentials";
import { eq } from "drizzle-orm";

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
