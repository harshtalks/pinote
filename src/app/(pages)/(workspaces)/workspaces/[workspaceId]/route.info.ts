import createRoute from "../../../../../../route.config";
import * as z from "zod";

const WorkspaceIdPageRoute = createRoute({
  name: "workspaces/${workspaceId}",
  paramsSchema: z.object({
    workspaceId: z.string(),
  }),
  fn: ({ workspaceId }) => `/workspaces/${workspaceId}`,
});

export default WorkspaceIdPageRoute;
