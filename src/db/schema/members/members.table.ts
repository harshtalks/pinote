import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { prefixedId } from "../schema.helper";
import { createdAtSchema, updatedAtSchema } from "../schema.common";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { users, workspaces } from "../*";
import { permissions, roles } from "../schema.enums";

export const members = sqliteTable(
  "members",
  {
    id: t.text().primaryKey().$defaultFn(prefixedId("member")),
    userId: t
      .text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: t
      .text()
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    createdAtSchema,
    updatedAtSchema,
    permission: t
      .text("permission", {
        enum: permissions,
      })
      .notNull(),
    role: t
      .text("role", {
        enum: roles,
      })
      .notNull(),
  },
  (table) => ({
    uniqueMember: t
      .uniqueIndex("unique_member")
      .on(table.userId, table.workspaceId),
  }),
);

export type Member = InferSelectModel<typeof members>;
export type MemberInsert = InferInsertModel<typeof members>;
