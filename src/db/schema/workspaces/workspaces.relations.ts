import { relations } from "drizzle-orm";
import { members } from "../members/members.table";
import { workspaces } from "./workspaces.table";
import { users } from "../users/users.table";
import { notebooks } from "../notebooks/notebooks.table";

export const workspaceRelations = relations(workspaces, ({ many, one }) => ({
  members: many(members),
  creator: one(users, {
    fields: [workspaces.creatorId],
    references: [users.id],
  }),
  notebooks: many(notebooks),
}));
