// Errors from Http

import { Data } from "effect";
import { StatusCodes } from "http-status-codes";

const makeHttpError = <T extends string>(tag: T, status: number) =>
  class HttpError extends Data.TaggedError(tag)<{
    message: string;
  }> {
    readonly status = status;
  };

export const BadRequestError = makeHttpError(
  "BadRequestError",
  StatusCodes.BAD_REQUEST,
);

export const UnauthorizedError = makeHttpError(
  "UnauthorizedError",
  StatusCodes.UNAUTHORIZED,
);

export const ForbiddenError = makeHttpError(
  "ForbiddenError",
  StatusCodes.FORBIDDEN,
);

export const NotFoundError = makeHttpError(
  "NotFoundError",
  StatusCodes.NOT_FOUND,
);

export const MethodNotAllowedError = makeHttpError(
  "MethodNotAllowed",
  StatusCodes.METHOD_NOT_ALLOWED,
);

export const InternalServerError = makeHttpError(
  "InternalServerError",
  StatusCodes.INTERNAL_SERVER_ERROR,
);

export const NotImplemented = makeHttpError(
  "NotImplemented",
  StatusCodes.NOT_IMPLEMENTED,
);

export const UnAuthorizedError = makeHttpError(
  "UnAuthorizedError",
  StatusCodes.UNAUTHORIZED,
);
