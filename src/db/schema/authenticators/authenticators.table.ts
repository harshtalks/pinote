import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { users } from "../users/*";
import { createdAtSchema, updatedAtSchema } from "../schema.common";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const authenticators = sqliteTable("authenticators", {
  id: t
    .blob({
      mode: "buffer",
    })
    .primaryKey()
    .notNull(),
  userId: t
    .text()
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  name: t.text().notNull(),
  createdAt: createdAtSchema,
  updatedAt: updatedAtSchema,
  credentialPublicKey: t
    .blob({
      mode: "buffer",
    })
    .notNull(),
  algorithm: t
    .integer({
      mode: "number",
    })
    .notNull(),
});

export type Authenticator = InferSelectModel<typeof authenticators>;
export type AuthenticatorInsert = InferInsertModel<typeof authenticators>;
