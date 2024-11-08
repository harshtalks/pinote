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
