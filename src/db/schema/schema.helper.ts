import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
);

export const prefixedId =
  <T extends string>(prefix: T, size = 16) =>
  () => {
    return [prefix, nanoid(size)].join("_");
  };
