import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { PrefixedIDs } from "../schema.helper";
import {
  createdAtSchema,
  lastModifiedSchema,
  updatedAtSchema,
} from "../schema.common";
import { members, workspaces } from "../*";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const notebooks = sqliteTable("notebooks", {
  id: t.text().primaryKey().$defaultFn(PrefixedIDs.notebook),
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
  lastModifiedAt: lastModifiedSchema,
});

export type Notebook = InferSelectModel<typeof notebooks>;
export type NotebookInsert = InferInsertModel<typeof notebooks>;
