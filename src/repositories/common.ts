import { getErrorMessage, httpError } from "@/utils/*";

export const dbError = (error: unknown) =>
  new httpError.InternalServerError({
    message: getErrorMessage(error),
  });
