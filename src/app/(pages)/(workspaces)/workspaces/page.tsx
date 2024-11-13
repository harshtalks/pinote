import { AuthInterceptor } from "@/auth/interceptor";
import WorkspacesPageRoute from "./route.info";
import { headers } from "next/headers";

const WorkspacesPage = async () => {
  await new AuthInterceptor()
    .setPath(WorkspacesPageRoute.navigate())
    .setHeaders(await headers())
    .setBase()
    .withRedirect()
    .execute();

  return <div>This is the Workspaces Page</div>;
};

export default WorkspacesPage;
