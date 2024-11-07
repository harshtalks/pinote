import { encodeBase32UpperCaseNoPadding } from "@oslojs/encoding";
import { Effect } from "effect";

export const generateRecoveryCode = () =>
  Effect.sync(() => new Uint8Array(10)).pipe(
    Effect.tap(crypto.getRandomValues),
    Effect.andThen(encodeBase32UpperCaseNoPadding),
  );
