import { Duration, Effect, Either, Redacted } from "effect";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { Branded } from "@/types/*";
import { sha256 } from "@oslojs/crypto/sha2";
import { Session, SessionInsert, UserAgent } from "@/db/schema/*";
import {
  AUTH_COOKIE_NAME,
  sessionDuration,
  sessionReValidationDuration,
} from "./db.const";
import { sessionRepo } from "@/repositories/*";
import { SessionWithUser } from "@/repositories/session.repo";
import { cookie } from "./*";

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
          expiresAt: Duration.toMillis(
            Duration.sum(
              Duration.toMillis(sessionDuration),
              Duration.millis(Date.now()),
            ),
          ),
          sessionId,
          userAgent: ua,
        }) as SessionInsert,
    ),
    Effect.andThen(sessionRepo.createSession),
  );

export const readSessionFromCookieAndValidate = () =>
  cookie.getCookie(AUTH_COOKIE_NAME).pipe(
    Effect.andThen((v) => Redacted.make(v ?? "")),
    Effect.andThen(validateSessionToken),
  );

export const validateSessionToken = (token: Redacted.Redacted<string>) =>
  Effect.sync(() =>
    encodeHexLowerCase(sha256(new TextEncoder().encode(Redacted.value(token)))),
  ).pipe(
    Effect.andThen(Branded.SessionId),
    Effect.andThen(sessionRepo.getSessionBySessionIdWithUser),
    Effect.andThen(validateSession),
  );

export const validateSession = (sessionWithUser: SessionWithUser | undefined) =>
  Effect.gen(function* () {
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
