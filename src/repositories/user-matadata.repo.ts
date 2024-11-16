import { tf } from "@/auth/*";
import { decryptToString, encryptString } from "@/auth/two-factor/recovery";
import Database from "@/db/*";
import { UserMetadata, userMetadata, UserMetadataInsert } from "@/db/schema/*";
import { Branded, NonEmptyArray } from "@/types/*";
import { getErrorMessage, httpError } from "@/utils/*";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { encodeBase64, decodeBase64 } from "@oslojs/encoding";
import { authenticatorRepo } from "./*";

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
      catch: (error) =>
        new httpError.InternalServerError({ message: getErrorMessage(error) }),
    }),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<UserMetadata> => result.length > 0,
      () =>
        new httpError.NotFoundError({
          message: "No User metadata was returned by the db",
        }),
    ),
    Effect.andThen((res) => res[0]),
  );

// This will get the user metadata by the user id
export const getUserMetaRecoveryCode = (userId: Branded.UserId) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) =>
        db.select().from(userMetadata).where(eq(userMetadata.userId, userId)),
      catch: (error) =>
        new httpError.InternalServerError({ message: getErrorMessage(error) }),
    }),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<UserMetadata> => result.length > 0,
      () =>
        new httpError.NotFoundError({
          message: "No User metadata was returned by the db",
        }),
    ),
    Effect.andThen((result) => result[0]),
    Effect.map((result) => result.recoveryCode),
    Effect.map(decodeBase64),
    Effect.andThen(decryptToString),
  );

export const updateUserMetaRecoveryCode =
  (userId: Branded.UserId) => (newRecoveryCode: Uint8Array) =>
    Database.pipe(
      Effect.tryMapPromise({
        catch: (error) =>
          new httpError.InternalServerError({
            message: getErrorMessage(error),
          }),
        try: (db) =>
          db
            .update(userMetadata)
            .set({
              recoveryCode: encodeBase64(newRecoveryCode),
            })
            .where(eq(userMetadata.userId, userId))
            .returning(),
      }),
      Effect.filterOrFail(
        (result): result is NonEmptyArray<UserMetadata> => result.length > 0,
        () =>
          new httpError.NotFoundError({ message: "No user metadata found" }),
      ),
      Effect.andThen((result) => result[0]),
    );

export const resetUserMetaRecoveryCode =
  (userId: Branded.UserId) => (newRecoveryCode: Uint8Array) =>
    Effect.all([
      updateUserMetaRecoveryCode(userId)(newRecoveryCode),
      authenticatorRepo.deleteAuthenticators(userId),
    ]).pipe(Effect.andThen(() => true));
