import createRoute, { EmptyRouteParams } from "../../../../../route.config";

const WorkspacesPageRoute = createRoute({
  name: "/workspaces",
  paramsSchema: EmptyRouteParams,
  fn: () => "/workspaces",
});

export default WorkspacesPageRoute;
