import createRoute, { EmptyRouteParams } from "../../../../route.config";

const TwoFactorPageRoute = createRoute({
  name: "/two-factor",
  paramsSchema: EmptyRouteParams,
  fn: () => "/two-factor",
});

export default TwoFactorPageRoute;
