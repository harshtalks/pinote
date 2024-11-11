import createRoute, { EmptyRouteParams } from "../../../../../route.config";

const TrpcV1Route = createRoute({
  name: "v1-route",
  fn: () => "/api/v1",
  paramsSchema: EmptyRouteParams,
});

export default TrpcV1Route;
