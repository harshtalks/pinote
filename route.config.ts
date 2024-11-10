import { routeBuilder } from "tempeh";
import { void as _void, union, object } from "zod";

const { createRoute, useTempehRouter, Navigate } = routeBuilder({
  // default base url set to "/", you not need to change it almost
  defaultBaseUrl: "/",
  // Additonal base urls
  // additionalBaseUrls: {
  //   EXAMPLE: "https://example.com",
  // },
  additionalBaseUrls: {
    GITHUB_API: "https://api.github.com",
  },
}).getInstance();

// Since all our routes accept a required `paramsSchema`, this will be a good place to define an empty schema for routes that do not require any params.
// You can later change this to a more complex schema if you need to.
// If your route has a dynamic param, cli will infer the schema for the params from the route itself. thank you zod.
const EmptyRouteParams = union([_void(), object({})]);

export { useTempehRouter, Navigate, EmptyRouteParams };

export default createRoute;
