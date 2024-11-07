import { GitHub } from "arctic";
import env from "../../../env";
import { Effect } from "effect";

export const makeGithubService = Effect.void.pipe(
  Effect.andThen(() =>
    Effect.succeed(
      new GitHub(
        env.GITHUB_CLIENT_ID,
        env.GITHUB_CLIENT_SECRET,
        env.GITHUB_REDIRECT_URI,
      ),
    ),
  ),
);

export class GithubOAuth extends Effect.Service<GithubOAuth>()("Oauth/Github", {
  effect: makeGithubService,
}) {}
