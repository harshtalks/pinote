import { object, string } from "zod";
import createRoute, { EmptyRouteParams } from "../../../../../../route.config";

const GithubSigninPage = createRoute({
  name: "GithubSigninPage",
  paramsSchema: EmptyRouteParams,
  fn: () => "/api/auth/github/signin",
  searchParamsSchema: object({
    redirectUrl: string().optional(),
  }),
});

export default GithubSigninPage;
