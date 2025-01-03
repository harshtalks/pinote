const storeKeysGenerator =
  <T extends string>(prefix: T) =>
  (id: string) =>
    ["local", prefix, id].join("__") as `local__${T}__${string}`;

export const storeKeys = {
  notebook: storeKeysGenerator("notebooks"),
} as const;

export type StoreKeys = typeof storeKeys;
export type StoreKey = keyof StoreKeys;
