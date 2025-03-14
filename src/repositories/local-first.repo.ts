// Everything related to local-first db calls

import Database from "@/db/*";
import { Branded } from "@/types/*";
import { Array, Effect, pipe } from "effect";
import { dbTry } from "./common";
import {
  ClientGroupInsert,
  ClientInsert,
  lofiClient,
  lofiClientGroup,
} from "@/db/schema/*";
import { eq } from "drizzle-orm";
import { httpError } from "@/utils/*";
import { notebookRepo, workspaceRepo } from "./*";

export const getClientGroupById = (
  clientGroupId: Branded.ReplicacheClientGroupId,
) =>
  pipe(
    Database,
    dbTry((db) =>
      db
        .select()
        .from(lofiClientGroup)
        .where(eq(lofiClientGroup.clientGroupId, clientGroupId)),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message:
            "We could not find any client group associated with given client id",
        }),
    ),
    Effect.andThen((result) => result[0]),
    Effect.withSpan("replicacheRepo.getClientGroupById"),
  );

export const getClientByClientId = (clientId: Branded.ReplicacheClientId) =>
  pipe(
    Database,
    dbTry((db) =>
      db.select().from(lofiClient).where(eq(lofiClient.clientId, clientId)),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message:
            "We could not find any client associated with given client id",
        }),
    ),
    Effect.andThen((result) => result[0]),
    Effect.withSpan("replicacheRepo.getClientByClientId"),
  );

export const upsertClientGroup = (clientGroup: ClientGroupInsert) =>
  pipe(
    Database,
    dbTry((db) =>
      db
        .insert(lofiClientGroup)
        .values({ ...clientGroup })
        .onConflictDoUpdate({
          target: lofiClientGroup.clientGroupId,
          set: clientGroup,
        })
        .returning(),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message:
            "We could not find any client group associated with given client id",
        }),
    ),
    Effect.andThen((result) => result[0]),
    Effect.withSpan("replicacheRepo.upsertClientGroup"),
  );

export const upsertClient = (client: ClientInsert) =>
  pipe(
    Database,
    dbTry((db) =>
      db
        .insert(lofiClient)
        .values({ ...client })
        .onConflictDoUpdate({
          target: lofiClient.clientId,
          set: client,
        })
        .returning(),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message:
            "We could not find any client associated with given client id",
        }),
    ),
    Effect.andThen((result) => result[0]),
    Effect.withSpan("replicacheRepo.upsertClient"),
  );

export const getAllClientsForGroup = (
  clientGroupId: Branded.ReplicacheClientGroupId,
) =>
  pipe(
    Database,
    dbTry((db) =>
      db
        .select()
        .from(lofiClient)
        .where(eq(lofiClient.clientGroupId, clientGroupId)),
    ),
    Effect.withSpan("replicacheRepo.getAllClientsForGroup"),
  );

export const searchNotebookList = (userId: Branded.UserId) =>
  pipe(
    userId,
    Branded.UserId,
    workspaceRepo.getWorkspacesByUserId,
    Effect.andThen(Array.map((workspace) => workspace.id)),
    Effect.andThen(Array.map(Branded.WorkspaceId)),
    Effect.andThen(notebookRepo.getNotebooksForWorkspaces),
    Effect.withSpan("replicacheRepo.searchNotebookList"),
  );
