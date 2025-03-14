import { AuthInterceptor } from "@/auth/interceptor";
import { Editor } from "@/components/features/workspaces/editor";
import { headers } from "next/headers";
import NotebookIdPageRoute from "./route.info";
import { RouteProps, withTypedParams } from "@/hoc/with-typed-params.hoc";

const NotebookPage = async (routeProps: RouteProps) => {
  return (
    await withTypedParams(NotebookIdPageRoute)(routeProps)(
      async ({ parsedParams }) => {
        await new AuthInterceptor()
          .setPath(NotebookIdPageRoute.navigate(parsedParams))
          .setHeaders(await headers())
          .setBase()
          .withRedirect()
          .execute();

        return <Editor />;
      },
    )
  )({});
};

export default NotebookPage;
