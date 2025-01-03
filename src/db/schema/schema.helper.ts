import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
);

const prefixedId =
  <T extends string>(prefix: T, size = 16) =>
  () => {
    return [prefix, nanoid(size)].join("_") as `${T}_${string}`;
  };

export const PrefixedIDs = {
  user: prefixedId("user"),
  workspace: prefixedId("workspace"),
  session: prefixedId("session"),
  member: prefixedId("member"),
  notebook: prefixedId("notebook"),
  file: prefixedId("file"),
  userMetadata: prefixedId("user_metadata"),
  lofiMeta: prefixedId("lofi_metadata"),
  lofiClientGroup: prefixedId("lofi_client_group"),
  lofiClient: prefixedId("lofi_client"),
};
