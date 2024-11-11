import { object, string } from "zod";
import createRoute, { EmptyRouteParams } from "../../../../route.config";

const TwoFactorPageRoute = createRoute({
  name: "/two-factor",
  paramsSchema: EmptyRouteParams,
  fn: () => "/two-factor",
  searchParamsSchema: object({
    redirectUrl: string().url().optional(),
  }),
});

export default TwoFactorPageRoute;
