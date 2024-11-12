import { object, string } from "zod";
import createRoute, { EmptyRouteParams } from "../../../../route.config";

const ErrorPageRoute = createRoute({
  name: "/error",
  paramsSchema: EmptyRouteParams,
  fn: () => "/error",
  searchParamsSchema: object({
    message: string().optional(),
    code: string().optional(),
    goBackTo: string().url().optional(),
  }),
});

export default ErrorPageRoute;
