export const mutationKeysGenerator =
  <T extends string>(prefix: T) =>
  (id: string) =>
    [prefix, id].join("/") as `${T}/${string}`;
