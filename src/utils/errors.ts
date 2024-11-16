import { Data } from "effect";

export const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : "Something went wrong...";
};

export class UncaughtError extends Data.TaggedError("UncaughtError")<{
  message: string;
}> {}
