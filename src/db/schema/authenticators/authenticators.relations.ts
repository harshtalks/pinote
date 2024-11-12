import { relations } from "drizzle-orm";
import { authenticators } from "./authenticators.table";
import { users } from "../users/*";

export const authenticatorRelations = relations(authenticators, ({ one }) => ({
  user: one(users, {
    fields: [authenticators.userId],
    references: [users.id],
  }),
}));
