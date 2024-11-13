import { TRPCError } from "@trpc/server";
import { Data, Effect } from "effect";

export const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : "Something went wrong..";
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

export class NoAuthenticatorError extends Data.TaggedError(
  "NoAuthenticatorError",
)<{ message: string }> {}

export class InvalidEncryptedDataError extends Data.TaggedError(
  "InvalidEncryptedDataError",
)<{ message: string }> {}
