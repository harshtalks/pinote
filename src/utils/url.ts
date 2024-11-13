import WorkspacesPageRoute from "@/app/(pages)/(workspaces)/workspaces/route.info";

export const makeURL = (path: string, requestUrl: string) =>
  new URL(path, new URL(requestUrl).origin).toString();

export const redirectUserPostSignIn = (
  requestUrl: string,
  redirectUrl?: string,
) => {
  return redirectUrl
    ? redirectUrl
    : makeURL(WorkspacesPageRoute.navigate(), new URL(requestUrl).origin);
};
