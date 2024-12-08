import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { workspaces } from "./workspaces.table";
import * as z from "zod";

export const addnewWorkspaceSchema = createInsertSchema(workspaces).merge(
  z.object({
    isPrivate: z.enum(["true", "false"]),
  }),
);
export const selectWorkspaceSchema = createSelectSchema(workspaces);

export type AddNewWorkspaceSchema = z.infer<typeof addnewWorkspaceSchema>;
export type SelectWorkspaceSchema = z.infer<typeof selectWorkspaceSchema>;
