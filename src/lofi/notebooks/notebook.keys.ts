import { Branded } from "@/types/*";
import { Array, pipe } from "effect";

export const notebookMutationKeys = {
  create: (workspaceId: Branded.WorkspaceId, notebookId: Branded.NotebookId) =>
    pipe(
      ["notebook"],
      Array.append(workspaceId),
      Array.append(notebookId),
      Array.join("/"),
    ),
  all: (workspaceId: Branded.WorkspaceId) =>
    pipe(["notebook"], Array.append(workspaceId), Array.join("/")),
};
