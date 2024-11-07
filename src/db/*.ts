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
    casing: "snake_case",
    schema: schema,
  }),
);

export class Database extends Effect.Service<Database>()("DB/Sqlite", {
  effect: makeDb,
}) {}

export default Database;
