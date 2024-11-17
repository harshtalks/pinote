import { AuthInterceptor } from "@/auth/interceptor";
import WorkspacesPageRoute from "./route.info";
import { headers } from "next/headers";
import { Workspace } from "@/components/features/workspaces/workspace";

const WorkspacesPage = async () => {
  await new AuthInterceptor()
    .setPath(WorkspacesPageRoute.navigate())
    .setHeaders(await headers())
    .setBase()
    .withRedirect()
    .execute();

  return (
    <main>
      <Workspace />
    </main>
  );
};

export default WorkspacesPage;
