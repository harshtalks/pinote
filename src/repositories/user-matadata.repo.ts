import { tf } from "@/auth/*";
import { decryptToString, encryptString } from "@/auth/two-factor/recovery";
import Database from "@/db/*";
import { userMetadata, UserMetadataInsert } from "@/db/schema/*";
import { Branded } from "@/types/*";
import { httpError } from "@/utils/*";
import { eq } from "drizzle-orm";
import { Array, Effect } from "effect";
import { encodeBase64, decodeBase64 } from "@oslojs/encoding";
import { authenticatorRepo } from "./*";
import { dbError, dbTry } from "./common";

// This will create the user metadata
export const createUserMeta = (
  userMeta: Omit<UserMetadataInsert, "recoveryCode">,
) =>
  Effect.all([
    tf.generateRecoveryCode().pipe(Effect.andThen(encryptString)),
    Database,
  ]).pipe(
    Effect.tryMapPromise({
      try: ([token, db]) =>
        db
          .insert(userMetadata)
          .values({
            ...userMeta,
            recoveryCode: encodeBase64(token),
          })
          .returning(),
      catch: dbError,
    }),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "No User metadata was returned by the db",
        }),
    ),
    Effect.andThen((res) => res[0]),
    Effect.withSpan("userMetaRepo.createUserMeta"),
  );

// This will get the user metadata by the user id
export const getUserMetaRecoveryCode = (userId: Branded.UserId) =>
  Database.pipe(
    dbTry((db) =>
      db.select().from(userMetadata).where(eq(userMetadata.userId, userId)),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "No User metadata was returned by the db",
        }),
    ),
    Effect.andThen((result) => result[0]),
    Effect.map((result) => result.recoveryCode),
    Effect.map(decodeBase64),
    Effect.andThen(decryptToString),
    Effect.withSpan("userMetaRepo.getUserMetaRecoveryCode"),
  );

export const updateUserMetaRecoveryCode =
  (userId: Branded.UserId) => (newRecoveryCode: Uint8Array) =>
    Database.pipe(
      dbTry((db) =>
        db
          .update(userMetadata)
          .set({
            recoveryCode: encodeBase64(newRecoveryCode),
          })
          .where(eq(userMetadata.userId, userId))
          .returning(),
      ),
      Effect.filterOrFail(
        Array.isNonEmptyArray,
        () =>
          new httpError.NotFoundError({ message: "No user metadata found" }),
      ),
      Effect.andThen((result) => result[0]),
      Effect.withSpan("userMetaRepo.updateUserMetaRecoveryCode"),
    );

export const resetUserMetaRecoveryCode =
  (userId: Branded.UserId) => (newRecoveryCode: Uint8Array) =>
    Effect.all([
      updateUserMetaRecoveryCode(userId)(newRecoveryCode),
      authenticatorRepo.deleteAuthenticators(userId),
    ]).pipe(
      Effect.andThen(() => true),
      Effect.withSpan("userMetaRepo.resetUserMetaRecoveryCode"),
    );
