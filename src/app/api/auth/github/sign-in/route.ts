import { cookie, GithubOAuth } from "@/auth/*";
import { Duration, Effect } from "effect";
import { generateState } from "arctic";
import { getErrorMessage } from "@/utils/errors";

export const GET = async (request: Request) => {
  return Effect.gen(function* () {
    const github = yield* GithubOAuth;
    const reqUrl = new URL(request.url);
    const redirectUrl = reqUrl.searchParams.get("redirectUrl");

    const state = generateState();

    const url = github.createAuthorizationURL(state, ["read:email"]);

    yield* cookie.setCookie("github_oauth_state")(state)(Duration.minutes(1));

    if (redirectUrl) {
      yield* cookie.setCookie("github_oauth_redirect_url")(redirectUrl)(
        Duration.minutes(1),
      );
    }

    return Response.redirect(url);
  }).pipe(
    Effect.catchAllDefect((err) =>
      Effect.succeed(
        Response.json(
          {
            error: getErrorMessage(err),
          },
          {
            status: 500,
          },
        ),
      ),
    ),
    Effect.catchAll((err) =>
      Effect.succeed(
        Response.json(
          {
            error: err.message,
          },
          {
            status: 500,
          },
        ),
      ),
    ),
    Effect.provide(GithubOAuth.Default),
    Effect.runPromise,
  );
};
