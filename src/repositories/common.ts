import Database from "@/db/*";
import { getErrorMessage, httpError } from "@/utils/*";
import { Effect } from "effect";

export const dbError = (error: unknown) =>
  new httpError.InternalServerError({
    message: getErrorMessage(error),
  });

export const dbTry =
  <A>(tryFn: (db: Database) => Promise<A>) =>
  (db: typeof Database) => {
    return Effect.tryMapPromise(db, {
      try: (db) => tryFn(db),
      catch: dbError,
    });
  };

export const isNotUndefined = <A>(value: A | undefined): value is A => {
  return value !== undefined;
};
