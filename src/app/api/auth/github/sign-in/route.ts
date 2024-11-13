import ErrorPageRoute from "@/app/(pages)/error/route.info";
import SigninPageRoute from "@/app/(pages)/sign-in/route.info";
import { cookie, GithubOAuth, provideGithubOAuth } from "@/auth/*";
import { getErrorMessage } from "@/utils/errors";
import { makeURL } from "@/utils/url";
import { generateState } from "arctic";
import { Duration, Effect } from "effect";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  return Effect.gen(function* () {
    const github = yield* GithubOAuth;
    const reqUrl = new URL(request.url);
    const redirectUrl = reqUrl.searchParams.get("redirectUrl");

    const state = generateState();

    const url = github.createAuthorizationURL(state, ["user:email"]);

    yield* cookie.setCookie("github_oauth_state")(state)(Duration.minutes(1));

    if (redirectUrl) {
      yield* cookie.setCookie("github_oauth_redirect_url")(redirectUrl)(
        Duration.minutes(1),
      );
    }

    // Redirect to the github oauth url
    return NextResponse.redirect(url);
  }).pipe(
    Effect.catchAllDefect((err) =>
      Effect.succeed(
        NextResponse.redirect(
          makeURL(
            ErrorPageRoute.navigate(
              {},
              {
                searchParams: {
                  message: getErrorMessage(err),
                  code: StatusCodes.INTERNAL_SERVER_ERROR.toString(),
                  goBackTo: makeURL(SigninPageRoute.navigate(), request.url),
                },
              },
            ),
            request.url,
          ),
        ),
      ),
    ),
    Effect.catchAll((err) =>
      Effect.succeed(
        NextResponse.redirect(
          makeURL(
            ErrorPageRoute.navigate(
              {},
              {
                searchParams: {
                  message: err.message,
                  code: StatusCodes.INTERNAL_SERVER_ERROR.toString(),
                  goBackTo: makeURL(SigninPageRoute.navigate(), request.url),
                },
              },
            ),
            request.url,
          ),
        ),
      ),
    ),
    provideGithubOAuth,
    Effect.runPromise,
  );
};
