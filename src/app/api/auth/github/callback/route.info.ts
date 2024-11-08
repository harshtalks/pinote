import createRoute, { EmptyRouteParams } from "../../../../../../route.config";

const GithubCallbackRouteInfo = createRoute({
  name: "githubCallback",
  fn: () => "/api/auth/github/callback",
  paramsSchema: EmptyRouteParams,
});

export default GithubCallbackRouteInfo;
