import { relations } from "drizzle-orm";
import { lofiClient, lofiClientGroup } from "./lofi.table";
import { users } from "../users/users.table";

export const lofiClientGroupRelations = relations(
  lofiClientGroup,
  ({ one, many }) => ({
    user: one(users, {
      fields: [lofiClientGroup.userId],
      references: [users.id],
    }),
    clients: many(lofiClient),
  }),
);

export const lofiClientRelations = relations(lofiClient, ({ one }) => ({
  clientGroup: one(lofiClientGroup, {
    fields: [lofiClient.clientGroupId],
    references: [lofiClientGroup.id],
  }),
}));
