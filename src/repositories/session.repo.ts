// create session

import Database from "@/db/*";
import {
  Authenticator,
  Session,
  SessionInsert,
  sessions,
  User,
} from "@/db/schema/*";
import { Branded, NonEmptyArray } from "@/types/*";
import { getErrorMessage, httpError } from "@/utils/*";
import { eq } from "drizzle-orm";
import { Duration, Effect } from "effect";

// This will create the session
export const createSession = (session: SessionInsert) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) => db.insert(sessions).values(session).returning(),
      catch: (error) =>
        new httpError.InternalServerError({ message: getErrorMessage(error) }),
    }),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<Session> => result.length > 0,
      () =>
        new httpError.NotFoundError({
          message: "no rows returned",
        }),
    ),
    Effect.andThen((result) => result[0]),
  );

// This will get the session by the session id
export const getSessionBySessionId = (sessionId: Branded.SessionId) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) =>
        db.select().from(sessions).where(eq(sessions.sessionId, sessionId)),
      catch: (error) =>
        new httpError.InternalServerError({ message: getErrorMessage(error) }),
    }),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<Session> => result.length > 0,
      () =>
        new httpError.NotFoundError({
          message: "could not find the session with the session id",
        }),
    ),
    Effect.andThen((result) => result[0]),
  );

export type SessionWithUser = Session & {
  user: User & {
    authenticators: Array<{
      id: Authenticator["id"];
    }>;
  };
};

// This will get the session by the session id with the user
export const getSessionBySessionIdWithUser = (sessionId: Branded.SessionId) =>
  Database.pipe(
    Effect.tryMapPromise({
      catch: (error) =>
        new httpError.InternalServerError({ message: getErrorMessage(error) }),
      try: (db) =>
        db.query.sessions.findFirst({
          where: (table, { eq }) => eq(table.sessionId, sessionId),
          with: {
            user: {
              with: {
                authenticators: {
                  columns: {
                    id: true,
                  },
                },
              },
            },
          },
        }),
    }),
  );

// This will delete the session
export const deleteSession = (sessionId: Branded.SessionId) =>
  Database.pipe(
    Effect.tryMapPromise({
      catch: (error) =>
        new httpError.InternalServerError({ message: getErrorMessage(error) }),
      try: (db) =>
        db
          .delete(sessions)
          .where(eq(sessions.sessionId, sessionId))
          .returning(),
    }),
    Effect.filterOrFail(
      (result) => result.length > 0,
      () =>
        new httpError.InternalServerError({
          message: "something went wrong while deleting the session",
        }),
    ),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<Session> => result.length > 0,
      () =>
        new httpError.NotFoundError({
          message: "Something went wrong while deleting the session",
        }),
    ),
    Effect.andThen((res) => res[0]),
  );

// This will update the session expiry
export const updateSessionExpiry = (
  sessionId: Branded.SessionId,
  time: Duration.Duration,
) =>
  Database.pipe(
    Effect.tryMapPromise({
      catch: (error) =>
        new httpError.InternalServerError({ message: getErrorMessage(error) }),
      try: (db) =>
        db
          .update(sessions)
          .set({
            expiresAt: Duration.toMillis(
              Duration.sum(Duration.millis(Date.now()), time),
            ),
            updatedAt: Duration.toMillis(Date.now()),
          })
          .where(eq(sessions.sessionId, sessionId))
          .returning(),
    }),
    Effect.filterOrFail(
      (result): result is NonEmptyArray<Session> => result.length > 0,
      () =>
        new httpError.NotFoundError({
          message: "Something went wrong while updating the session expiry",
        }),
    ),
    Effect.map((res) => res[0]),
    Effect.catchAllDefect(
      (error) =>
        new httpError.InternalServerError({ message: getErrorMessage(error) }),
    ),
  );

export const setSessionTFStatus =
  (sessionId: Branded.SessionId) => (value: boolean) =>
    Database.pipe(
      Effect.tryMapPromise({
        try: (db) =>
          db
            .update(sessions)
            .set({
              tfVerified: value,
            })
            .where(eq(sessions.sessionId, sessionId))
            .returning(),
        catch: (error) =>
          new httpError.InternalServerError({
            message: getErrorMessage(error),
          }),
      }),

      Effect.filterOrFail(
        (result): result is NonEmptyArray<Session> => result.length > 0,
        () =>
          new httpError.NotFoundError({
            message:
              "Something went wrong while setting up the two factor status for the session",
          }),
      ),
      Effect.map((res) => res[0]),
      Effect.catchAllDefect(
        (error) =>
          new httpError.InternalServerError({
            message: getErrorMessage(error),
          }),
      ),
    );
