import Database from "@/db/*";
import { AddNewWorkspaceSchema, workspaces } from "@/db/schema/*";
import { Array, Brand, Effect } from "effect";
import { dbTry } from "./common";
import { httpError } from "@/utils/*";
import { addNewMember, getMembersForUserId } from "./member.repo";
import { Branded } from "@/types/*";
import { eq } from "drizzle-orm";

export const addNewWorkspace = (workspace: AddNewWorkspaceSchema) =>
  Database.pipe(
    dbTry((db) => db.insert(workspaces).values(workspace).returning()),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "We could not find user associated with given user id",
        }),
    ),
    Effect.map((workspaces) => workspaces[0]),
    Effect.andThen((workspace) =>
      addNewMember({
        permission: "write",
        role: "admin",
        userId: workspace.creatorId,
        workspaceId: workspace.id,
      }),
    ),
    Effect.withSpan("workspaceRepo.addNewWorkspace"),
  );

export const getWorkspaceById = (workspaceId: Branded.WorkspaceId) =>
  Database.pipe(
    dbTry((db) =>
      db.select().from(workspaces).where(eq(workspaces.id, workspaceId)),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "We could not find user associated with given user id",
        }),
    ),
    Effect.map((workspaces) => workspaces[0]),
    Effect.withSpan("workspaceRepo.getWorkspaceById"),
  );

export const getWorkspacesByUserId = (userId: Branded.UserId) => {
  return getMembersForUserId(userId)
    .pipe(
      Effect.map((members) =>
        members.map((member) => Branded.WorkspaceId(member.workspaceId)),
      ),
      Effect.map(Array.map(getWorkspaceById)),
    )
    .pipe(
      Effect.andThen(Effect.all),
      Effect.filterOrFail(
        Array.isNonEmptyArray,
        () =>
          new httpError.NotFoundError({
            message: "We could not find user associated with given user id",
          }),
      ),
      Effect.withSpan("workspaceRepo.getWorkspacesByUserId"),
    );
};
