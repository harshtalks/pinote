import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { prefixedId } from "../schema.helper";
import { createdAtSchema, updatedAtSchema } from "../schema.common";
import { members, workspaces } from "../*";

export const notebooks = sqliteTable("notebooks", {
  id: t.text().primaryKey().$defaultFn(prefixedId("notebook")),
  title: t.text().notNull(),
  kvs: t
    .text({
      mode: "json",
    })
    .$type<Record<string, string>>()
    .notNull(),
  createdAt: createdAtSchema,
  updatedAt: updatedAtSchema,
  workspaceId: t
    .text()
    .notNull()
    .references(() => workspaces.id, {
      onDelete: "cascade",
    }),
  creatorId: t
    .text()
    .notNull()
    .references(() => members.id, {
      onDelete: "no action",
    }),
  nodes: t.text().notNull(),
});
