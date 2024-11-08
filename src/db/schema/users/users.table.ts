import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { prefixedId } from "../schema.helper";
import { createdAtSchema, updatedAtSchema } from "../schema.common";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: t.text().primaryKey().$defaultFn(prefixedId("user")),
  username: t.text().unique().notNull(),
  githubId: t.text().unique().notNull(),
  createdAt: createdAtSchema,
  updatedAt: updatedAtSchema,
  avatar: t.text(),
  name: t.text().notNull(),
  email: t.text().notNull(),
  twoFactorAuth: t
    .integer({
      mode: "boolean",
    })
    .notNull()
    .default(false),
});

export type User = InferSelectModel<typeof users>;
export type UserInsert = InferInsertModel<typeof users>;
