export const makeURL = (path: string, requestUrl: string) =>
  new URL(path, new URL(requestUrl).origin).toString();
