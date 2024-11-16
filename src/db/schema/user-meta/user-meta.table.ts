import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { prefixedId } from "../schema.helper";
import { createdAtSchema, updatedAtSchema } from "../schema.common";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { users } from "../*";

export const userMetadata = sqliteTable("usersMetadata", {
  id: t.text().primaryKey().$defaultFn(prefixedId("user_metadata")),
  createdAt: createdAtSchema,
  updatedAt: updatedAtSchema,
  userId: t
    .text()
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  recoveryCode: t.text().notNull(),
});

export type UserMetadata = InferSelectModel<typeof userMetadata>;
export type UserMetadataInsert = InferInsertModel<typeof userMetadata>;
