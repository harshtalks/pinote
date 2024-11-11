import { object, string } from "zod";
import createRoute, { EmptyRouteParams } from "../../../../route.config";

const SigninPageRoute = createRoute({
  fn: () => "/sign-in",
  name: "sign-in",
  paramsSchema: EmptyRouteParams,
  searchParamsSchema: object({
    redirectUrl: string().url().optional(),
  }),
});

export default SigninPageRoute;
