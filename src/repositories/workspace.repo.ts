import Database from "@/db/*";
import { AddNewWorkspaceSchema, workspaces } from "@/db/schema/*";
import { Array, Effect } from "effect";
import { dbError } from "./common";
import { httpError } from "@/utils/*";

export const addNewWorkspace = (workspace: AddNewWorkspaceSchema) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) => db.insert(workspaces).values(workspace).returning(),
      catch: dbError,
    }),
    Effect.filterOrFail(
      (result) => Array.isNonEmptyArray(result),
      () =>
        new httpError.NotFoundError({
          message: "We could not find user associated with given user id",
        }),
    ),
    Effect.withSpan("workspaceRepo.addNewWorkspace"),
    Effect.map((workspaces) => workspaces[0]),
  );
