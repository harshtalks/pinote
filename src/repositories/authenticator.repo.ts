import Database from "@/db/*";
import { Authenticator, authenticators } from "@/db/schema/*";
import { Branded } from "@/types/*";
import { uint8ArrayToBuffer } from "@/utils/casting";
import {
  DBError,
  getErrorMessage,
  NoAuthenticatorError,
  NoRowsReturnedError,
} from "@/utils/errors";
import { and, eq } from "drizzle-orm";
import { Effect } from "effect";

export const getAuthenticatorById = (credentialId: Uint8Array) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) =>
        db.query.authenticators.findFirst({
          where: (table, { eq }) =>
            eq(table.id, uint8ArrayToBuffer(credentialId)),
        }),
      catch: (error) => new DBError({ message: getErrorMessage(error) }),
    }),
    Effect.filterOrFail(
      (result): result is Authenticator => !!result,
      () => new NoAuthenticatorError(),
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
                eq(table.id, uint8ArrayToBuffer(credentialId)),
                eq(table.userId, userId),
              ),
          }),
        catch: (error) => new DBError({ message: getErrorMessage(error) }),
      }),
      Effect.filterOrFail(
        (result): result is Authenticator => !!result,
        () => new NoAuthenticatorError(),
      ),
    );

export const getUserAuthenticators = (userId: Branded.UserId) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) =>
        db.query.authenticators.findMany({
          where: (table, { eq, and }) => and(eq(table.userId, userId)),
        }),
      catch: (error) => new DBError({ message: getErrorMessage(error) }),
    }),
  );

export const createNewAuthenticator = (authenticator: Authenticator) => {
  return Database.pipe(
    Effect.tryMapPromise({
      try: (db) => db.insert(authenticators).values(authenticator).returning(),
      catch: (error) => new DBError({ message: getErrorMessage(error) }),
    }),
    Effect.andThen((result) => result[0]),
    Effect.filterOrFail(
      (result): result is Authenticator => !!result,
      () =>
        new NoRowsReturnedError({
          message: "No authenticator was created",
        }),
    ),
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
                eq(authenticators.id, uint8ArrayToBuffer(credentialId)),
              ),
            )
            .returning(),
        catch: (error) => new DBError({ message: getErrorMessage(error) }),
      }),
      Effect.andThen((result) => result[0]),
      Effect.filterOrFail(
        (result): result is Authenticator => !!result,
        () =>
          new NoRowsReturnedError({
            message: "No authenticator was deleted",
          }),
      ),
    );
  };
