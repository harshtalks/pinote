import {
  auth,
  AUTH_COOKIE_NAME,
  cookie,
  GithubOAuth,
  sessionDuration,
} from "@/auth/*";
import Database from "@/db/*";
import { githubRepo, userRepo } from "@/repositories/*";
import { Branded } from "@/types/*";
import { StringResponseType } from "@/types/hoc.types";
import { getErrorMessage } from "@/utils/errors";
import { FetchHttpClient } from "@effect/platform";
import { Effect, Option } from "effect";
import { Redacted } from "effect";
import { StatusCodes } from "http-status-codes";
import { NextResponse, userAgent } from "next/server";

export const GET = async (request: Request) => {
  return Effect.gen(function* () {
    const url = new URL(request.url);
    const redirectUrl = yield* cookie.getCookie("github_oauth_redirect_url");

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedState = yield* cookie.getCookie("github_oauth_state");

    const ua = userAgent(request);

    if (!code || !state || !storedState || state !== storedState) {
      return NextResponse.json<StringResponseType>(
        {
          error: "Invalid state",
          success: false,
        },
        {
          status: StatusCodes.TEMPORARY_REDIRECT,
          statusText: "Malformed or invalid state from github",
          headers: {
            Location: "/sign-in",
          },
        },
      );
    }

    const githubOAuth = yield* GithubOAuth;
    const token = yield* Effect.promise(() =>
      githubOAuth.validateAuthorizationCode(code),
    );

    const [githubUser, githubUserEmails] = yield* Effect.all([
      githubRepo.getCurrentUser(Redacted.make(token.accessToken())),
      githubRepo.getCurrentUserEmails(Redacted.make(token.accessToken())),
    ]);

    const user = yield* userRepo
      .getUserByGithubId(Branded.GithubId(githubUser.login))
      .pipe(
        Effect.map(Option.some),
        Effect.catchTag("NoRowsReturnedError", () => Option.none()),
      );

    if (Option.isSome(user)) {
      // get the session token
      const sessionToken = yield* auth.generateSessionToken;
      // create a brand new session
      const session = yield* auth.createSession(
        Branded.UserId(user.value.id),
        Redacted.make(sessionToken),
        ua,
      );

      yield* cookie.setCookie(AUTH_COOKIE_NAME)(session.id)(sessionDuration);

      return NextResponse.json<StringResponseType>(
        {
          result: "Successfully signed in",
          success: true,
        },
        {
          status: StatusCodes.TEMPORARY_REDIRECT,
          headers: {
            Location: "/",
          },
        },
      );
    } else {
      // create a new user
      const newUser = yield* userRepo.createNewUser({
        avatar: githubUser.avatar_url,
        name: githubUser.name,
        githubId: githubUser.login,
        email: githubUserEmails[0].email,
        username: githubUser.login,
      });

      const sessionToken = yield* auth.generateSessionToken;

      const session = yield* auth.createSession(
        Branded.UserId(newUser.id),
        Redacted.make(sessionToken),
        ua,
      );

      yield* cookie.setCookie(AUTH_COOKIE_NAME)(session.id)(sessionDuration);

      return NextResponse.json<StringResponseType>(
        {
          result: "Successfully signed in",
          success: true,
        },
        {
          status: StatusCodes.TEMPORARY_REDIRECT,
          headers: {
            Location: "/",
          },
        },
      );
    }
  }).pipe(
    Effect.catchAllDefect((err) =>
      Effect.succeed(
        NextResponse.json<StringResponseType>(
          {
            error: getErrorMessage(err),
            success: false,
          },
          {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
          },
        ),
      ),
    ),
    Effect.catchAll((err) =>
      Effect.succeed(
        NextResponse.json<StringResponseType>(
          {
            error: err.message,
            success: false,
          },
          {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
          },
        ),
      ),
    ),
    Effect.provide(GithubOAuth.Default),
    Effect.provide(FetchHttpClient.layer),
    Effect.provide(Database.Default),
    Effect.scoped,
    Effect.runPromise,
  );
};
