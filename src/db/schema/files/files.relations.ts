import { relations } from "drizzle-orm";
import { files } from "./files.table";
import { notebooks } from "../notebooks/notebooks.table";

export const fileRelations = relations(files, ({ one }) => ({
  notebook: one(notebooks, {
    fields: [files.notebookId],
    references: [notebooks.id],
  }),
}));
