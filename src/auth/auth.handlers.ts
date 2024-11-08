import { Duration, Effect, Either, Redacted } from "effect";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { Branded } from "@/types/*";
import { sha256 } from "@oslojs/crypto/sha2";
import { Session, SessionInsert, User, UserAgent } from "@/db/schema/*";
import { sessionDuration, sessionReValidationDuration } from "./db.const";
import { sessionRepo } from "@/repositories/*";

// This is a simple effect that generates a session token.
export const generateSessionToken = Effect.sync(() => new Uint8Array(20)).pipe(
  Effect.tap(crypto.getRandomValues),
  Effect.andThen(encodeBase32LowerCaseNoPadding),
);

// This is a simple effect that generates a session token.
export const createSession = (
  userId: Branded.UserId,
  token: Redacted.Redacted<string>,
  ua: UserAgent,
) =>
  Effect.sync(() =>
    encodeHexLowerCase(sha256(new TextEncoder().encode(Redacted.value(token)))),
  ).pipe(
    Effect.andThen(
      (sessionId) =>
        ({
          userId: userId,
          expiresAt: Duration.toMillis(sessionDuration),
          sessionId,
          userAgent: ua,
        }) as SessionInsert,
    ),
    Effect.andThen(sessionRepo.createSession),
  );

export const validateSessionToken = (token: Redacted.Redacted<string>) =>
  Effect.sync(() =>
    encodeHexLowerCase(sha256(new TextEncoder().encode(Redacted.value(token)))),
  ).pipe(
    Effect.andThen(Branded.SessionId),
    Effect.andThen(sessionRepo.getSessionBySessionIdWithUser),
    Effect.andThen((session) => validateSession(Effect.succeed(session))),
  );

export const validateSession = (
  session: Effect.Effect<(Session & { user: User }) | undefined>,
) =>
  Effect.gen(function* () {
    const sessionWithUser = yield* session;

    if (!sessionWithUser) {
      return Either.left({
        user: null,
        session: null,
      });
    }

    const now = Duration.millis(Date.now());
    const sessionExpiresAt = Duration.millis(sessionWithUser.expiresAt);

    if (Duration.greaterThanOrEqualTo(now, sessionExpiresAt)) {
      // If the session has expired, we will delete the session and return an error.
      yield* sessionRepo.deleteSession(
        Branded.SessionId(sessionWithUser.sessionId),
      );

      return Either.left({
        user: null,
        session: null,
      });
    }

    if (
      Duration.greaterThanOrEqualTo(
        Duration.subtract(
          sessionExpiresAt,
          Duration.toMillis(sessionReValidationDuration),
        ),
      )
    ) {
      const newSessionExpiresAt = Duration.sum(
        now,
        Duration.toMillis(sessionReValidationDuration),
      );

      const session = yield* sessionRepo.updateSessionExpiry(
        Branded.SessionId(sessionWithUser.sessionId),
        newSessionExpiresAt,
      );

      return Either.right({
        user: sessionWithUser.user,
        session,
      });
    }

    return Either.right({
      session: sessionWithUser as Session,
      user: sessionWithUser.user,
    });
  });

export const invalidateSession = (sessionId: Branded.SessionId) =>
  sessionRepo.deleteSession(sessionId);
