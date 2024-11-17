import Database from "@/db/*";
import { User, UserInsert, users } from "@/db/schema/*";
import { Branded } from "@/types/*";
import { getErrorMessage, httpError } from "@/utils/*";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { NonEmptyArray } from "@/types/*";
import { authenticatorRepo, sessionRepo, userMetaRepo } from "./*";
import { encryptString } from "@/auth/two-factor/recovery";
import { tf } from "@/auth/*";

export const getUserById = (userId: Branded.UserId) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) => db.select().from(users).where(eq(users.id, userId)),
      catch: (error) =>
        new httpError.InternalServerError({
          message: getErrorMessage(error),
        }),
    }),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<User> => result.length > 0,
      () =>
        new httpError.NotFoundError({
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
        new httpError.InternalServerError({
          message: getErrorMessage(error),
        }),
    }),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<User> => result.length > 0,
      () =>
        new httpError.NotFoundError({
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
        new httpError.InternalServerError({
          message: getErrorMessage(error),
        }),
    }),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<User> => result.length > 0,
      () =>
        new httpError.NotFoundError({
          message: "DB did not return any user",
        }),
    ),
    Effect.andThen((users) => users[0]),
  );
};

export const updateTfSkipStatus = (userId: Branded.UserId) => (skip: boolean) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) =>
        db
          .update(users)
          .set({
            skippedTfStep: skip,
          })
          .where(eq(users.id, userId))
          .returning(),
      catch: (error) =>
        new httpError.InternalServerError({
          message: getErrorMessage(error),
        }),
    }),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<User> => result.length > 0,
      () =>
        new httpError.NotFoundError({
          message:
            "We could not find user associated with given github login id",
        }),
    ),
    Effect.andThen((users) => users[0]),
  );

export const updateTFStatus = (userId: Branded.UserId) => (status: boolean) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) =>
        db
          .update(users)
          .set({ twoFactorAuth: status })
          .where(eq(users.id, userId))
          .returning(),
      catch: (error) =>
        new httpError.InternalServerError({ message: getErrorMessage(error) }),
    }),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<User> => result.length > 0,
      () =>
        new httpError.NotFoundError({
          message:
            "We could not find user associated with given github login id",
        }),
    ),
    Effect.andThen((users) => users[0]),
  );

export const resetUserTf = (userId: Branded.UserId) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) =>
        db
          .update(users)
          .set({
            twoFactorAuth: false,
            skippedTfStep: false,
          })
          .where(eq(users.id, userId))
          .returning(),
      catch: (error) =>
        new httpError.InternalServerError({
          message: getErrorMessage(error),
        }),
    }),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<User> => result.length > 0,
      () =>
        new httpError.NotFoundError({
          message:
            "We could not find user associated with given github login id",
        }),
    ),
    Effect.andThen((users) => users[0]),
  );

export const resetUser = (userId: Branded.UserId) =>
  Effect.all([
    sessionRepo.deleteSessions(userId),
    authenticatorRepo.deleteAuthenticators(userId),
    resetUserTf(userId),
    tf
      .generateRecoveryCode()
      .pipe(
        Effect.andThen(encryptString),
        Effect.andThen(userMetaRepo.updateUserMetaRecoveryCode(userId)),
      ),
  ]).pipe(Effect.andThen(() => true));
