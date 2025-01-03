import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { PrefixedIDs } from "../schema.helper";
import {
  createdAtSchema,
  lastModifiedSchema,
  updatedAtSchema,
} from "../schema.common";
import { workspaces } from "../*";

export const files = sqliteTable("files", {
  id: t.text().primaryKey().$defaultFn(PrefixedIDs.file),
  fileName: t.text().notNull(),
  createdAt: createdAtSchema,
  updatedAt: updatedAtSchema,
  notebookId: t
    .text()
    .notNull()
    .references(() => workspaces.id, {
      onDelete: "cascade",
    }),
  content: t.text().notNull(),
  lastModifiedAt: lastModifiedSchema,
});
