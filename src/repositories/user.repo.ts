import Database from "@/db/*";
import { UserInsert, users } from "@/db/schema/*";
import { Branded } from "@/types/*";
import { httpError } from "@/utils/*";
import { eq } from "drizzle-orm";
import { Array, Effect } from "effect";
import { authenticatorRepo, sessionRepo, userMetaRepo } from "./*";
import { encryptString } from "@/auth/two-factor/recovery";
import { tf } from "@/auth/*";
import { dbTry } from "./common";

export const getUserById = (userId: Branded.UserId) =>
  Database.pipe(
    dbTry((db) => db.select().from(users).where(eq(users.id, userId))),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "We could not find user associated with given user id",
        }),
    ),
    Effect.withSpan("userRepo.getUserById"),
  );

export const getUserByGithubId = (githubId: Branded.GithubId) =>
  Database.pipe(
    dbTry((db) => db.select().from(users).where(eq(users.githubId, githubId))),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message:
            "We could not find user associated with given github login id",
        }),
    ),
    Effect.andThen((users) => users[0]),
    Effect.withSpan("userRepo.getUserByGithubId"),
  );

export const createNewUser = (user: UserInsert) => {
  return Database.pipe(
    dbTry((db) => db.insert(users).values(user).returning()),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "DB did not return any user",
        }),
    ),
    Effect.andThen((users) => users[0]),
    Effect.withSpan("userRepo.createNewUser"),
  );
};

export const updateTfSkipStatus = (userId: Branded.UserId) => (skip: boolean) =>
  Database.pipe(
    dbTry((db) =>
      db
        .update(users)
        .set({
          skippedTfStep: skip,
        })
        .where(eq(users.id, userId))
        .returning(),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message:
            "We could not find user associated with given github login id",
        }),
    ),
    Effect.andThen((users) => users[0]),
    Effect.withSpan("userRepo.updateTfSkipStatus"),
  );

export const updateTFStatus = (userId: Branded.UserId) => (status: boolean) =>
  Database.pipe(
    dbTry((db) =>
      db
        .update(users)
        .set({ twoFactorAuth: status })
        .where(eq(users.id, userId))
        .returning(),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message:
            "We could not find user associated with given github login id",
        }),
    ),
    Effect.andThen((users) => users[0]),
    Effect.withSpan("userRepo.updateTfSkipStatus"),
  );

export const resetUserTf = (userId: Branded.UserId) =>
  Database.pipe(
    dbTry((db) =>
      db
        .update(users)
        .set({
          twoFactorAuth: false,
          skippedTfStep: false,
        })
        .where(eq(users.id, userId))
        .returning(),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message:
            "We could not find user associated with given github login id",
        }),
    ),
    Effect.andThen((users) => users[0]),
    Effect.withSpan("userRepo.resetUserTf"),
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
  ]).pipe(
    Effect.andThen(() => true),
    Effect.withSpan("userRepo.resetUser"),
  );
