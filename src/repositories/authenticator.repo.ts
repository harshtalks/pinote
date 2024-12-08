import Database from "@/db/*";
import {
  Authenticator,
  AuthenticatorInsert,
  authenticators,
} from "@/db/schema/*";
import { Branded, NonEmptyArray } from "@/types/*";
import { getErrorMessage, httpError } from "@/utils/*";
import { and, eq } from "drizzle-orm";
import { Effect } from "effect";
import { encodeBase64 } from "@oslojs/encoding";

export const getAuthenticatorById = (credentialId: Uint8Array) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) =>
        db.query.authenticators.findFirst({
          where: (table, { eq }) => eq(table.id, encodeBase64(credentialId)),
        }),
      catch: (error) =>
        new httpError.InternalServerError({ message: getErrorMessage(error) }),
    }),
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
      Effect.tryMapPromise({
        try: (db) =>
          db.query.authenticators.findFirst({
            where: (table, { eq, and }) =>
              and(
                eq(table.id, encodeBase64(credentialId)),
                eq(table.userId, userId),
              ),
          }),
        catch: (error) =>
          new httpError.InternalServerError({
            message: getErrorMessage(error),
          }),
      }),
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
    Effect.tryMapPromise({
      try: (db) =>
        db.query.authenticators.findMany({
          where: (table, { eq, and }) => and(eq(table.userId, userId)),
        }),
      catch: (error) =>
        new httpError.InternalServerError({ message: getErrorMessage(error) }),
    }),
    Effect.filterOrFail(
      (result): result is Authenticator[] => !!result.length,
      () =>
        new httpError.NotFoundError({
          message: "No authenticators were found for the user",
        }),
    ),
  );

export const createNewAuthenticator = (authenticator: AuthenticatorInsert) => {
  return Database.pipe(
    Effect.tryMapPromise({
      try: (db) => db.insert(authenticators).values(authenticator).returning(),
      catch: (error) =>
        new httpError.InternalServerError({ message: getErrorMessage(error) }),
    }),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<Authenticator> => result.length > 0,
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
      Effect.tryMapPromise({
        try: (db) =>
          db
            .delete(authenticators)
            .where(
              and(
                eq(authenticators.userId, userId),
                eq(authenticators.id, encodeBase64(credentialId)),
              ),
            )
            .returning(),
        catch: (error) =>
          new httpError.InternalServerError({
            message: getErrorMessage(error),
          }),
      }),
      Effect.filterOrFail(
        (result): result is NonEmptyArray<Authenticator> => result.length > 0,
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
    Effect.tryMapPromise({
      try: (db) =>
        db
          .delete(authenticators)
          .where(and(eq(authenticators.userId, userId)))
          .returning(),
      catch: (error) =>
        new httpError.InternalServerError({
          message: getErrorMessage(error),
        }),
    }),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<Authenticator> => result.length > 0,
      () =>
        new httpError.NotFoundError({
          message: "No authenticator was deleted",
        }),
    ),
  );
