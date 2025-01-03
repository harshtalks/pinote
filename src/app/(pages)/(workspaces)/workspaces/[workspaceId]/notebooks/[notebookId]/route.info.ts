import * as z from "zod";
import createRoute from "../../../../../../../../route.config";

const NotebookIdPageRoute = createRoute({
  name: "workspaces/${workspaceId}/notebooks/${notebookId}",
  paramsSchema: z.object({
    workspaceId: z.string(),
    notebookId: z.string(),
  }),
  fn: ({ workspaceId, notebookId }) =>
    `/workspaces/${workspaceId}/notebooks/${notebookId}`,
});

export default NotebookIdPageRoute;
