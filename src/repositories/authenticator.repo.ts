import Database from "@/db/*";
import {
  Authenticator,
  AuthenticatorInsert,
  authenticators,
} from "@/db/schema/*";
import { Branded } from "@/types/*";
import { httpError } from "@/utils/*";
import { and, eq } from "drizzle-orm";
import { Array, Effect } from "effect";
import { encodeBase64 } from "@oslojs/encoding";
import { dbTry } from "./common";

export const getAuthenticatorById = (credentialId: Uint8Array) =>
  Database.pipe(
    dbTry((db) =>
      db.query.authenticators.findFirst({
        where: (table, { eq }) => eq(table.id, encodeBase64(credentialId)),
      }),
    ),
    Effect.filterOrFail(
      (result): result is Authenticator => !!result,
      () =>
        new httpError.NotFoundError({
          message: "No authenticator was found",
        }),
    ),
  );

export const getUserAuthenticator =
  (userId: Branded.UserId) => (credentialId: Uint8Array) =>
    Database.pipe(
      dbTry((db) =>
        db.query.authenticators.findFirst({
          where: (table, { eq, and }) =>
            and(
              eq(table.id, encodeBase64(credentialId)),
              eq(table.userId, userId),
            ),
        }),
      ),
      Effect.filterOrFail(
        (result): result is Authenticator => !!result,
        () =>
          new httpError.NotFoundError({
            message: "No authenticator was found for the user",
          }),
      ),
    );

export const getUserAuthenticators = (userId: Branded.UserId) =>
  Database.pipe(
    dbTry((db) =>
      db.query.authenticators.findMany({
        where: (table, { eq, and }) => and(eq(table.userId, userId)),
      }),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "No authenticators were found for the user",
        }),
    ),
  );

export const createNewAuthenticator = (authenticator: AuthenticatorInsert) => {
  return Database.pipe(
    dbTry((db) => db.insert(authenticators).values(authenticator).returning()),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "No authenticator was created",
        }),
    ),
    Effect.andThen((result) => result[0]),
  );
};

export const deleteUserAuthenticator =
  (userId: Branded.UserId) => (credentialId: Uint8Array) => {
    return Database.pipe(
      dbTry((db) =>
        db
          .delete(authenticators)
          .where(
            and(
              eq(authenticators.userId, userId),
              eq(authenticators.id, encodeBase64(credentialId)),
            ),
          )
          .returning(),
      ),
      Effect.filterOrFail(
        Array.isNonEmptyArray,
        () =>
          new httpError.NotFoundError({
            message: "No authenticator was deleted",
          }),
      ),
      Effect.andThen((result) => result[0]),
    );
  };

export const deleteAuthenticators = (userId: Branded.UserId) =>
  Database.pipe(
    dbTry((db) =>
      db
        .delete(authenticators)
        .where(and(eq(authenticators.userId, userId)))
        .returning(),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "No authenticator was deleted",
        }),
    ),
  );
