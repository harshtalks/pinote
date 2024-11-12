import { drizzle } from "drizzle-orm/libsql/web";
import env from "../../env";
import * as schema from "./schema/*";
import { Effect } from "effect";

export const makeDb = Effect.sync(() =>
  drizzle({
    connection: {
      url: env.DATABASE_URL,
      authToken: env.DATABASE_AUTH_TOKEN,
    },
    schema: schema,
    logger: true,
  }),
);

export class Database extends Effect.Service<Database>()("DB/Sqlite", {
  effect: makeDb,
}) {}

export const provideDB = <A, E, R>(
  self: Effect.Effect<A, E, R | Database>,
): Effect.Effect<A, E, Exclude<R, Database>> =>
  Effect.provide(self, Database.Default);

export default Database;
