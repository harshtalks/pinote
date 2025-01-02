import { relations } from "drizzle-orm";
import { notebooks } from "./notebooks.table";
import { workspaces } from "../workspaces/workspaces.table";
import { members } from "../members/members.table";

export const notebookRelations = relations(notebooks, ({ one }) => ({
  member: one(members, {
    fields: [notebooks.creatorId],
    references: [members.id],
  }),
  workspace: one(workspaces, {
    fields: [notebooks.workspaceId],
    references: [workspaces.id],
  }),
}));
