import { Effect } from "effect";

// uint8Array to Buffer
export const uint8ArrayToBuffer = (uint8Array: Uint8Array) => {
  return Buffer.from(uint8Array);
};

// Buffer to uint8Array
export const bufferToUint8Array = (buffer: Buffer) => {
  return new Uint8Array(buffer);
};

// Normal to Effect
export const effective =
  <A = never>() =>
  <E, R>(effect: Effect.Effect<A, E, R>) =>
    effect;

// object key casting and checking
export const keyCaster = <T extends object>(object: T) => {
  type Keys = keyof T;
  const objectKeys = Object.keys(object) as Keys[];
  const isKeyInObject = (key: PropertyKey): key is Keys =>
    typeof key === "string" && objectKeys.includes(key as Keys);

  return {
    objectKeys,
    isKeyInObject,
  };
};
