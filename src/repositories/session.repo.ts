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
import { getErrorMessage, httpError } from "@/utils/*";
import { eq } from "drizzle-orm";
import { Array, Duration, Effect } from "effect";
import { dbTry } from "./common";

// This will create the session
export const createSession = (session: SessionInsert) =>
  Database.pipe(
    dbTry((db) => db.insert(sessions).values(session).returning()),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "no rows returned",
        }),
    ),
    Effect.andThen((result) => result[0]),
    Effect.withSpan("sessionRepo.createSession"),
  );

// This will get the session by the session id
export const getSessionBySessionId = (sessionId: Branded.SessionId) =>
  Database.pipe(
    dbTry((db) =>
      db.select().from(sessions).where(eq(sessions.sessionId, sessionId)),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "could not find the session with the session id",
        }),
    ),
    Effect.andThen((result) => result[0]),
    Effect.withSpan("sessionRepo.getSessionBySessionId"),
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
    dbTry((db) =>
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
    ),
    Effect.withSpan("sessionRepo.getSessionBySessionIdWithUser"),
  );

// This will delete the session
export const deleteSession = (sessionId: Branded.SessionId) =>
  Database.pipe(
    dbTry((db) =>
      db.delete(sessions).where(eq(sessions.sessionId, sessionId)).returning(),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "Something went wrong while deleting the session",
        }),
    ),
    Effect.andThen((res) => res[0]),
    Effect.withSpan("sessionRepo.deleteSession"),
  );

// delete all sessions
export const deleteSessions = (userId: Branded.UserId) =>
  Database.pipe(
    dbTry((db) =>
      db.delete(sessions).where(eq(sessions.userId, userId)).returning(),
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
      () =>
        new httpError.NotFoundError({
          message: "Something went wrong while deleting the session",
        }),
    ),
    Effect.withSpan("sessionRepo.deleteSessions"),
  );

// This will update the session expiry
export const updateSessionExpiry = (
  sessionId: Branded.SessionId,
  time: Duration.Duration,
) =>
  Database.pipe(
    dbTry((db) =>
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
    ),
    Effect.filterOrFail(
      Array.isNonEmptyArray,
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
    Effect.withSpan("sessionRepo.updateSessionExpiry"),
  );

export const setSessionTFStatus =
  (sessionId: Branded.SessionId) => (value: boolean) =>
    Database.pipe(
      dbTry((db) =>
        db
          .update(sessions)
          .set({
            tfVerified: value,
          })
          .where(eq(sessions.sessionId, sessionId))
          .returning(),
      ),
      Effect.filterOrFail(
        Array.isNonEmptyArray,
        () =>
          new httpError.NotFoundError({
            message:
              "Something went wrong while setting up the two factor status for the session",
          }),
      ),
      Effect.map((res) => res[0]),
      Effect.withSpan("sessionRepo.setSessionTFStatus"),
      Effect.catchAllDefect(
        (error) =>
          new httpError.InternalServerError({
            message: getErrorMessage(error),
          }),
      ),
    );
