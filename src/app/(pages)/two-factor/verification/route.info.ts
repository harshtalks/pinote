import createRoute, { EmptyRouteParams } from "../../../../../route.config";

const TwoFactorVerificationPageRoute = createRoute({
  name: "/two-factor/verification",
  paramsSchema: EmptyRouteParams,
  fn: () => "/two-factor/verification",
});

export default TwoFactorVerificationPageRoute;
