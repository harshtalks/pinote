import { relations } from "drizzle-orm";
import { users } from "./users.table";
import { sessions } from "../sessions/sessions.table";
import { authenticators } from "../authenticators/authenticators.table";

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  authenticators: many(authenticators),
}));
