import createRoute, { EmptyRouteParams } from "../../route.config";

const AppPageRoute = createRoute({
  name: "/",
  paramsSchema: EmptyRouteParams,
  fn: () => "/",
});

export default AppPageRoute;
