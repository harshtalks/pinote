import { object, string } from "zod";
import createRoute, { EmptyRouteParams } from "../../../../../route.config";

const TwoFactorVerificationPageRoute = createRoute({
  name: "/two-factor/verification",
  paramsSchema: EmptyRouteParams,
  fn: () => "/two-factor/verification",
  searchParamsSchema: object({
    redirectUrl: string().url().optional(),
  }),
});

export default TwoFactorVerificationPageRoute;
