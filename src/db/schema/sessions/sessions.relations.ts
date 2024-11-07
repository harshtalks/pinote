import { relations } from "drizzle-orm";
import { sessions } from "./sessions.table";
import { users } from "../*";

// Session relations
export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
