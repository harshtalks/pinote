import { drizzle } from "drizzle-orm/libsql/web";
import env from "../../env";
import * as schema from "./schema/*";
import { Effect } from "effect";
import { provideDefault } from "@/utils/*";

export const makeDb = Effect.sync(() =>
  drizzle({
    connection: {
      url: env.DATABASE_URL,
      authToken: env.DATABASE_AUTH_TOKEN,
    },
    schema: schema,
  }),
);

export class Database extends Effect.Service<Database>()("DB/Sqlite", {
  effect: makeDb,
}) {}

export const provideDB = provideDefault(Database.Default);

export default Database;
