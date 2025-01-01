import Database from "@/db/*";
import { AddNewWorkspaceSchema, workspaces } from "@/db/schema/*";
import { Array, Effect } from "effect";
import { dbTry, isNotUndefined } from "./common";
import { httpError } from "@/utils/*";
import { addNewMember, getMembersForUserId } from "./member.repo";
import { Branded } from "@/types/*";

export const addNewWorkspace = (workspace: AddNewWorkspaceSchema) =>
  Database.pipe(
    dbTry((db) => db.insert(workspaces).values(workspace).returning()),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: `Looks like we could not create the workspace`,
        }),
    ),
    Effect.map((workspaces) => workspaces[0]),
    Effect.flatMap((workspace) =>
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
      db.query.workspaces.findFirst({
        where: (table, { eq }) => eq(table.id, workspaceId),
        with: {
          members: {
            with: {
              user: true,
            },
          },
        },
      }),
    ),
    Effect.filterOrFail(
      isNotUndefined,
      () =>
        new httpError.NotFoundError({
          message: "We could not find user associated with given user id",
        }),
    ),
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
