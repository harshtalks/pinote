import { relations } from "drizzle-orm";
import { members } from "./members.table";
import { users } from "../users/users.table";
import { workspaces } from "../workspaces/workspaces.table";
import { notebooks } from "../notebooks/notebooks.table";

export const memberRelations = relations(members, ({ one, many }) => ({
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [members.workspaceId],
    references: [workspaces.id],
  }),
  notebooks: many(notebooks),
}));
