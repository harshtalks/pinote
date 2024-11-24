import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { prefixedId } from "../schema.helper";
import { createdAtSchema, updatedAtSchema } from "../schema.common";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { users } from "../users/users.table";

export const workspaces = sqliteTable("workspaces", {
  id: t.text().primaryKey().$defaultFn(prefixedId("workspace")),
  name: t.text().notNull(),
  description: t.text().notNull(),
  createdAt: createdAtSchema,
  updatedAt: updatedAtSchema,
  creatorId: t
    .text()
    .notNull()
    .references(() => users.id, { onDelete: "no action" }),
  isPrivate: t
    .int({
      mode: "boolean",
    })
    .notNull()
    .default(false),
});

export type Workspace = InferSelectModel<typeof workspaces>;
export type WorkspaceInsert = InferInsertModel<typeof workspaces>;
