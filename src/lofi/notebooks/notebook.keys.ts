import { mutationKeysGenerator } from "@/utils/lofi";

export const notebookMutationKeys = {
  create: mutationKeysGenerator("new_notebook"),
  all: "new_notebook",
};
