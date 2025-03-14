import { Data, Effect } from "effect";

export const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : "Something went wrong...";
};

export class UncaughtError extends Data.TaggedError("UncaughtError")<{
  message: string;
  status: 500;
}> {}

export const annonateErrorLogs = (error: Error) =>
  Effect.annotateLogs({
    name: error.name,
    message: error.message,
    stack: error.stack,
    cause: error.cause,
  });
