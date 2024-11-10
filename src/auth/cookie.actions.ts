import { getErrorMessage, UncaughtError } from "@/utils/errors";
import { Duration, Effect } from "effect";
import { cookies } from "next/headers";
import env from "../../env";

export const setCookie =
  (cookieName: string) => (token: string) => (expiresAt: Duration.Duration) =>
    Effect.tryPromise({
      try: () => cookies(),
      catch: (error) => new UncaughtError({ message: getErrorMessage(error) }),
    }).pipe(
      Effect.map((cookieStore) =>
        cookieStore.set(cookieName, token, {
          expires: Duration.toMillis(
            Duration.sum(Duration.millis(Date.now()), expiresAt),
          ),
          httpOnly: false,
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

export const getCookie = (cookieName: string) =>
  Effect.tryPromise({
    try: () => cookies(),
    catch: (error) => new UncaughtError({ message: getErrorMessage(error) }),
  }).pipe(Effect.map((cookieStore) => cookieStore.get(cookieName)?.value));
