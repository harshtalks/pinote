import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { prefixedId } from "../schema.helper";
import { users } from "../*";
import { createdAtSchema, updatedAtSchema } from "../schema.common";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const authenticators = sqliteTable("authenticators", {
  id: t.text().primaryKey().$defaultFn(prefixedId("authenticator")),
  userId: t
    .text()
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  createdAt: createdAtSchema,
  updatedAt: updatedAtSchema,
  webAuthUserId: t.text().notNull().unique(),
  counter: t
    .integer({
      mode: "number",
    })
    .notNull(),
  backupEligible: t.integer({ mode: "number" }).notNull(),
  backupStatus: t.integer({ mode: "boolean" }).notNull(),
  credentialPublicKey: t.blob().notNull(),
  // comma seperated list
  transports: t.text().notNull(),
});

export type Authenticators = InferSelectModel<typeof authenticators>;
export type AuthenticatorsInsert = InferInsertModel<typeof authenticators>;
