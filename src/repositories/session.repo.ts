// create session

import Database from "@/db/*";
import {
  Authenticator,
  Session,
  SessionInsert,
  sessions,
  User,
} from "@/db/schema/*";
import { Branded } from "@/types/*";
import {
  DBError,
  DeleteEntityError,
  getErrorMessage,
  NoRowsReturnedError,
  UncaughtError,
} from "@/utils/*";
import { eq } from "drizzle-orm";
import { Duration, Effect } from "effect";

// This will create the session
export const createSession = (session: SessionInsert) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) => db.insert(sessions).values(session).returning(),
      catch: (error) => new DBError({ message: getErrorMessage(error) }),
    }),
    Effect.andThen((result) => result[0]),
    Effect.filterOrFail(
      (result): result is Session => !!result,
      () =>
        new NoRowsReturnedError({
          message: "no rows returned",
        }),
    ),
  );

// This will get the session by the session id
export const getSessionBySessionId = (sessionId: Branded.SessionId) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) =>
        db.select().from(sessions).where(eq(sessions.sessionId, sessionId)),
      catch: (error) => new DBError({ message: getErrorMessage(error) }),
    }),
    Effect.andThen((result) => result[0]),
    Effect.filterOrFail(
      (result): result is Session => !!result,
      () =>
        new NoRowsReturnedError({
          message: "could not find the session with the session id",
        }),
    ),
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
      catch: (error) => new DBError({ message: getErrorMessage(error) }),
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
      catch: (error) => new DBError({ message: getErrorMessage(error) }),
      try: (db) =>
        db
          .delete(sessions)
          .where(eq(sessions.sessionId, sessionId))
          .returning(),
    }),
    Effect.filterOrFail(
      (result) => result.length > 0,
      () =>
        new DeleteEntityError({
          message: "something went wrong while deleting the session",
        }),
    ),
    Effect.andThen((res) => res[0]),
    Effect.filterOrFail(
      (result): result is Session => !!result,
      () =>
        new NoRowsReturnedError({
          message: "Something went wrong while deleting the session",
        }),
    ),
  );

// This will update the session expiry
export const updateSessionExpiry = (
  sessionId: Branded.SessionId,
  time: Duration.Duration,
) =>
  Database.pipe(
    Effect.tryMapPromise({
      catch: (error) => new DBError({ message: getErrorMessage(error) }),
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
    Effect.map((res) => res[0]),
    Effect.filterOrFail(
      (session): session is Session => !!session,
      () =>
        new NoRowsReturnedError({
          message: "Something went wrong while updating the session expiry",
        }),
    ),
    Effect.catchAllDefect(
      (error) => new UncaughtError({ message: getErrorMessage(error) }),
    ),
  );
