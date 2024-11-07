import Database from "@/db/*";
import { users } from "@/db/schema/*";
import { Branded } from "@/types/*";
import { DBError, getErrorMessage } from "@/utils/errors";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

export const getUserById = (userId: Branded.UserId) =>
  Database.pipe(
    Effect.tryMapPromise({
      try: (db) => db.select().from(users).where(eq(users.id, userId)),
      catch: (error) =>
        new DBError({
          message: getErrorMessage(error),
        }),
    }),
    Effect.andThen((result) => result[0]),
  );
