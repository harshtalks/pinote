import Database from "@/db/*";
import { User, UserInsert, users } from "@/db/schema/*";
import { Branded } from "@/types/*";
import { DBError, getErrorMessage, NoRowsReturnedError } from "@/utils/errors";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { NonEmptyArray } from "@/types/*";

export const getUserById = (userId: Branded.UserId) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) => db.select().from(users).where(eq(users.id, userId)),
      catch: (error) =>
        new DBError({
          message: getErrorMessage(error),
        }),
    }),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<User> => result.length > 0,
      () =>
        new NoRowsReturnedError({
          message: "We could not find user associated with given user id",
        }),
    ),
    Effect.andThen((users) => users[0]),
  );

export const getUserByGithubId = (githubId: Branded.GithubId) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) => db.select().from(users).where(eq(users.githubId, githubId)),
      catch: (error) =>
        new DBError({
          message: getErrorMessage(error),
        }),
    }),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<User> => result.length > 0,
      () =>
        new NoRowsReturnedError({
          message:
            "We could not find user associated with given github login id",
        }),
    ),
    Effect.andThen((users) => users[0]),
  );

export const createNewUser = (user: UserInsert) => {
  return Database.pipe(
    Effect.tryMapPromise({
      try: (db) => db.insert(users).values(user).returning(),
      catch: (error) =>
        new DBError({
          message: getErrorMessage(error),
        }),
    }),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<User> => result.length > 0,
      () =>
        new NoRowsReturnedError({
          message: "DB did not return any user",
        }),
    ),
    Effect.andThen((users) => users[0]),
  );
};
