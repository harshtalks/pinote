import { tf } from "@/auth/*";
import { decryptToString, encryptString } from "@/auth/two-factor/recovery";
import Database from "@/db/*";
import {
  authenticators,
  UserMetadata,
  userMetadata,
  UserMetadataInsert,
  users,
} from "@/db/schema/*";
import { Branded } from "@/types/*";
import { bufferToUint8Array, uint8ArrayToBuffer } from "@/utils/casting";
import { DBError, getErrorMessage, NoRowsReturnedError } from "@/utils/errors";
import { eq } from "drizzle-orm";
import { Effect, Redacted } from "effect";

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
            recoveryCode: uint8ArrayToBuffer(token),
          })
          .returning(),
      catch: (error) => new DBError({ message: getErrorMessage(error) }),
    }),
    Effect.andThen((result) => result[0]),
    Effect.filterOrFail(
      (result): result is UserMetadata => !!result,
      () =>
        new NoRowsReturnedError({
          message: "No User metadata was returned by the db",
        }),
    ),
  );

// This will get the user metadata by the user id
export const getUserMetaRecoveryCode = (userId: Branded.UserId) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) =>
        db.select().from(userMetadata).where(eq(userMetadata.userId, userId)),
      catch: (error) => new DBError({ message: getErrorMessage(error) }),
    }),
    Effect.andThen((result) => result[0]),
    Effect.filterOrFail(
      (result): result is UserMetadata => !!result,
      () =>
        new NoRowsReturnedError({
          message: "No User metadata was returned by the db",
        }),
    ),
    Effect.map((result) => result.recoveryCode),
    Effect.map(bufferToUint8Array),
    Effect.andThen(decryptToString),
    Effect.andThen(Redacted.make),
  );

// This will reset the recovery code for the user metadata
export const resetUserMetaRecoveryCode =
  (userId: Branded.UserId) => (newRecoveryCode: Uint8Array) =>
    Database.pipe(
      Effect.tryMapPromise({
        try: (db) =>
          db.transaction(async (tx) => {
            // update the user metadata
            const updatedUserMeta = await tx
              .update(userMetadata)
              .set({
                recoveryCode: uint8ArrayToBuffer(newRecoveryCode),
              })
              .where(eq(userMetadata.userId, userId));

            if (!updatedUserMeta.rowsAffected) {
              tx.rollback();
            }

            // delete all the authenticators
            await tx
              .delete(authenticators)
              .where(eq(authenticators.userId, userId));

            // reset the two factor auth
            await db
              .update(users)
              .set({
                twoFactorAuth: false,
              })
              .where(eq(users.id, userId));
          }),
        catch: (error) =>
          new DBError({
            message: getErrorMessage(error),
          }),
      }),
    );
