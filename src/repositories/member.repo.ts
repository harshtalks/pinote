import Database from "@/db/*";
import { MemberInsert, members } from "@/db/schema/*";
import { dbTry } from "./common";
import { Array, Effect } from "effect";
import { httpError } from "@/utils/*";
import { Branded } from "@/types/*";
import { and, eq } from "drizzle-orm";

export const addNewMember = (member: MemberInsert) =>
  Database.pipe(
    dbTry((db) => db.insert(members).values(member).returning()),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: `Looks like we could not create the member. Please try again.`,
        }),
    ),
    Effect.withSpan("memberRepo.addNewMember"),
    Effect.map((members) => members[0]),
  );

export const getMembersForUserId = (userId: Branded.UserId) => {
  return Database.pipe(
    dbTry((db) => db.select().from(members).where(eq(members.userId, userId))),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message:
            "We could not find any members associated with given user id",
        }),
    ),
    Effect.withSpan("memberRepo.getMembersForUserId"),
  );
};

export const getMemberForUserInWorkspace = (
  userId: Branded.UserId,
  workspaceId: Branded.WorkspaceId,
) => {
  return Database.pipe(
    dbTry((db) =>
      db
        .select()
        .from(members)
        .where(
          and(eq(members.userId, userId), eq(members.workspaceId, workspaceId)),
        ),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message:
            "We could not find any members associated with given user in the given workspace",
        }),
    ),
    Effect.map((members) => members[0]),
    Effect.withSpan("memberRepo.getMemberForUserInWorkspace"),
  );
};
