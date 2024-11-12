import { decodeBase64, encodeBase32UpperCaseNoPadding } from "@oslojs/encoding";
import { Effect } from "effect";
import { createCipheriv, createDecipheriv, getRandomValues } from "crypto";
import env from "../../../env";
import { DynamicBuffer } from "@oslojs/binary";
import { InvalidEncryptedDataError } from "@/utils/errors";

// Generate the recovery code for the user
export const generateRecoveryCode = () =>
  Effect.sync(() => new Uint8Array(10)).pipe(
    Effect.tap(crypto.getRandomValues),
    Effect.andThen(encodeBase32UpperCaseNoPadding),
  );

// Encrypt the data
export const encrypt = (plainData: Uint8Array) =>
  Effect.sync(() => new Uint8Array(16)).pipe(
    Effect.tap(getRandomValues),
    Effect.andThen((iv) => ({
      cipher: createCipheriv(
        "aes-128-gcm",
        decodeBase64(env.ENCRYPTION_KEY),
        iv,
      ),
      iv: iv,
    })),
    Effect.andThen(({ cipher, iv }) => {
      return Effect.sync(() => new DynamicBuffer(0)).pipe(
        Effect.tap((encrypt) => encrypt.write(iv)),
        Effect.tap((encrypt) => encrypt.write(cipher.update(plainData))),
        Effect.tap((encrypt) => encrypt.write(cipher.final())),
        Effect.tap((encrypt) => encrypt.write(cipher.getAuthTag())),
        Effect.andThen((encrypt) => encrypt.bytes()),
      );
    }),
  );

// Encrypt the string
export const encryptString = (plainData: string) =>
  Effect.sync(() => new TextEncoder().encode(plainData)).pipe(
    Effect.andThen(encrypt),
  );

// Decrypt the data
export const decrypt = (encrypted: Uint8Array) =>
  Effect.succeed(encrypted).pipe(
    Effect.filterOrFail(
      (encrypted) => encrypted.byteLength >= 33,
      () =>
        new InvalidEncryptedDataError({
          message: "Invalid encrypted data provided for decryption",
        }),
    ),
    Effect.andThen((encrypted) =>
      createDecipheriv(
        "aes-128-gcm",
        decodeBase64(env.ENCRYPTION_KEY),
        encrypted.slice(0, 16),
      ),
    ),
    Effect.tap((decipher) =>
      decipher.setAuthTag(encrypted.slice(encrypted.byteLength - 16)),
    ),
    Effect.andThen((decipher) => {
      return Effect.sync(() => new DynamicBuffer(0)).pipe(
        Effect.tap((decrypt) =>
          decrypt.write(
            decipher.update(encrypted.slice(16, encrypted.byteLength - 16)),
          ),
        ),
        Effect.tap((decrypt) => decrypt.write(decipher.final())),
        Effect.andThen((decrypt) => decrypt.bytes()),
      );
    }),
  );

// Decrypt the string
export const decryptToString = (encrypted: Uint8Array) =>
  decrypt(encrypted).pipe(
    Effect.andThen((decrypted) => new TextDecoder().decode(decrypted)),
  );
