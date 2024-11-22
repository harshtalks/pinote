import { relations } from "drizzle-orm";
import { members } from "./members.table";
import { users } from "../users/users.table";
import { workspaces } from "../workspaces/workspaces.table";

export const memberRelations = relations(members, ({ one }) => ({
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [members.userId],
    references: [workspaces.id],
  }),
}));
