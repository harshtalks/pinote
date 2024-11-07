// uint8Array to Buffer
export const uint8ArrayToBuffer = (uint8Array: Uint8Array) => {
  return Buffer.from(uint8Array);
};

// Buffer to uint8Array
export const bufferToUint8Array = (buffer: Buffer) => {
  return new Uint8Array(buffer);
};
