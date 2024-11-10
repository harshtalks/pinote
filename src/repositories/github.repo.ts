import { Effect, Redacted, Schema } from "effect";
import createRoute, { EmptyRouteParams } from "../../route.config";
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";

export const GithubUserRouteInfo = createRoute({
  name: "githubUser",
  fn: () => "/user",
  paramsSchema: EmptyRouteParams,
  baseUrl: "GITHUB_API",
});

export const GithubEmailsRouteInfo = createRoute({
  name: "githubEmails",
  fn: () => `/user/emails`,
  paramsSchema: EmptyRouteParams,
  baseUrl: "GITHUB_API",
});

export class GithubUser extends Schema.Class<GithubUser>("Github/User")({
  login: Schema.NonEmptyString,
  avatar_url: Schema.NonEmptyString,
  name: Schema.NonEmptyString,
}) {}

export class GithubEmail extends Schema.Class<GithubEmail>("Github/Email")({
  email: Schema.NonEmptyString,
  primary: Schema.Boolean,
  verified: Schema.Boolean,
  visibility: Schema.NullishOr(Schema.String),
}) {}

export const getCurrentUser = (token: Redacted.Redacted<string>) => {
  return HttpClientRequest.get(GithubUserRouteInfo.navigate()).pipe(
    HttpClientRequest.bearerToken(Redacted.value(token)),
    HttpClient.execute,
    Effect.andThen(HttpClientResponse.schemaBodyJson(GithubUser)),
  );
};

export const getCurrentUserEmails = (token: Redacted.Redacted<string>) =>
  HttpClientRequest.get(GithubEmailsRouteInfo.navigate()).pipe(
    HttpClientRequest.bearerToken(Redacted.value(token)),
    HttpClient.execute,
    Effect.andThen(
      HttpClientResponse.schemaBodyJson(Schema.NonEmptyArray(GithubEmail)),
    ),
  );
