import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { prefixedId } from "../schema.helper";
import { createdAtSchema, updatedAtSchema } from "../schema.common";
import { users } from "../*";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const sessions = sqliteTable(
  "sessions",
  {
    id: t.text().primaryKey().$defaultFn(prefixedId("session")),
    createdAt: createdAtSchema,
    updatedAt: updatedAtSchema,
    userId: t
      .text()
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    expiresAt: t.integer().notNull(),
    details: t.text("details", { mode: "json" }).$type<{
      model?: string | undefined;
      type?: string | undefined;
      vendor?: string | undefined;
    }>(),
    userAgent: t.text(),
    // This is a session token that is used to authenticate the user.
    sessionId: t.text().notNull(),
  },
  (table) => ({
    sessionIdIndex: t.index("sessionIndex").on(table.sessionId),
  }),
);

export type Session = InferSelectModel<typeof sessions>;
export type SessionInsert = InferInsertModel<typeof sessions>;
