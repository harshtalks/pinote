import { object, string } from "zod";
import createRoute, { EmptyRouteParams } from "../../../../../../route.config";

const GithubSigninApiRoute = createRoute({
  name: "GithubSigninApiRoute",
  paramsSchema: EmptyRouteParams,
  fn: () => "/api/auth/github/sign-in",
  searchParamsSchema: object({
    redirectUrl: string().url().optional(),
  }),
});

export default GithubSigninApiRoute;
