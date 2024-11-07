import { Branded } from "@/types/*";
import { getErrorMessage, UncaughtError } from "@/utils/errors";
import { Duration, Effect } from "effect";
import { cookies } from "next/headers";
import env from "../../env";

export const setCookie =
  (cookieName: string) =>
  (token: Branded.SessionId) =>
  (expiresAt: Duration.Duration) =>
    Effect.tryPromise({
      try: () => cookies(),
      catch: (error) => new UncaughtError({ message: getErrorMessage(error) }),
    }).pipe(
      Effect.map((cookieStore) =>
        cookieStore.set(cookieName, token, {
          expires: Duration.toMillis(expiresAt),
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: env.NODE_ENV === "production",
        }),
      ),
    );

export const deleteCookie = (cookieName: string) =>
  Effect.tryPromise({
    try: () => cookies(),
    catch: (error) => new UncaughtError({ message: getErrorMessage(error) }),
  }).pipe(
    Effect.map((cookieStore) =>
      cookieStore.set(cookieName, "", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
        maxAge: 0,
      }),
    ),
  );
