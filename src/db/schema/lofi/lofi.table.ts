// Everything related to local first
import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { PrefixedIDs } from "../schema.helper";
import {
  createdAtSchema,
  lastModifiedSchema,
  updatedAtSchema,
} from "../schema.common";
import { users } from "../*";

export const lofiMeta = sqliteTable("lofi_meta", {
  id: t.text().primaryKey().$defaultFn(PrefixedIDs.lofiMeta),
  key: t.text().notNull(),
  value: t
    .text({
      mode: "json",
    })
    .notNull(),
  createdAt: createdAtSchema,
  updatedAt: updatedAtSchema,
});

export const lofiClientGroup = sqliteTable("lofi_client_group", {
  id: t.text().primaryKey().$defaultFn(PrefixedIDs.lofiClientGroup),
  createdAt: createdAtSchema,
  updatedAt: updatedAtSchema,
  userId: t
    .text()
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  crvVersion: t.integer().notNull(),
  // better use the date type
  lastModifiedAt: lastModifiedSchema,
});

export const lofiClient = sqliteTable("lofi_client", {
  id: t.text().primaryKey().$defaultFn(PrefixedIDs.lofiClient),
  createdAt: createdAtSchema,
  updatedAt: updatedAtSchema,
  clientGroupId: t
    .text()
    .notNull()
    .references(() => lofiClientGroup.id, { onDelete: "cascade" }),
  lastModifiedAt: lastModifiedSchema,
  lastMutationId: t.integer().notNull(),
});
