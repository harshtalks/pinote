import { relations } from "drizzle-orm";
import { users } from "./users.table";
import { sessions } from "../sessions/sessions.table";
import { authenticators } from "../authenticators/authenticators.table";
import { userMetadata } from "../user-meta/user-meta.table";
import { members } from "../members/members.table";

export const userRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  authenticators: many(authenticators),
  userMetadata: one(userMetadata),
  members: many(members),
}));
