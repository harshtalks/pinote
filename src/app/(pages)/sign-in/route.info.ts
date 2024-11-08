import createRoute, { EmptyRouteParams } from "../../../../route.config";

const SigninPageRoute = createRoute({
  fn: () => "/sign-in",
  name: "sign-in",
  paramsSchema: EmptyRouteParams,
});

export default SigninPageRoute;
