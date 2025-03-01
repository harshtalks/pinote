import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { PrefixedIDs } from "../schema.helper";
import { createdAtSchema, updatedAtSchema } from "../schema.common";
import { members, workspaces } from "../*";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { IconName } from "@/types/icon";
import { NonEmptyArray } from "ts-essentials";

export type KeyValues = NonEmptyArray<{
  key: string;
  value: string;
  icon: IconName;
}>;

export const notebooks = sqliteTable("notebooks", {
  id: t.text().primaryKey().$defaultFn(PrefixedIDs.notebook),
  title: t.text().notNull(),
  kvs: t
    .text({
      mode: "json",
    })
    .$type<KeyValues>()
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
  version: t.int().notNull().default(0),
});

export type Notebook = InferSelectModel<typeof notebooks>;
export type NotebookInsert = InferInsertModel<typeof notebooks>;
