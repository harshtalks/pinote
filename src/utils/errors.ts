import { Data } from "effect";

export const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : "Unknown error";
};

export class DBError extends Data.TaggedError("DBError")<{
  message: string;
}> {}

export class SessionError extends Data.TaggedError("SessionError")<{
  message: string;
}> {}

export class NoRowsReturnedError extends Data.TaggedError(
  "NoRowsReturnedError",
)<{
  message: string;
}> {}

export class DeleteEntityError extends Data.TaggedError("DeleteEntityError")<{
  message: string;
}> {}

export class UncaughtError extends Data.TaggedError("UncaughtError")<{
  message: string;
}> {}
