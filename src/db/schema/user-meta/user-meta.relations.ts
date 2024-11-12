import { relations } from "drizzle-orm";
import { users } from "../users/*";
import { userMetadata } from "./user-meta.table";

// Session relations
export const userMetadataRelations = relations(userMetadata, ({ one }) => ({
  user: one(users, {
    fields: [userMetadata.userId],
    references: [users.id],
  }),
}));
