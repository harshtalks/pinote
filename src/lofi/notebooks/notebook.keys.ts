const mutationKeysGenerator =
  <T extends string>(prefix: T) =>
  (id: string) =>
    [prefix, id].join("/") as `${T}/${string}`;

export const notebookMutationKeys = {
  create: mutationKeysGenerator("new_notebook"),
};
