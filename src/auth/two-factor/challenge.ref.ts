// Ref to hold the challenge through the webauthn process

import { encodeHexLowerCase } from "@oslojs/encoding";
import { Effect, SynchronizedRef } from "effect";

export class TfChallenges extends Effect.Service<TfChallenges>()(
  "TfChallenges",
  {
    // The challenge is a random string that is generated when the user logs in
    effect: SynchronizedRef.make<Set<string>>(new Set()),
  },
) {
  createChallenge() {
    return TfChallenges.pipe(
      Effect.andThen((challengesRef) =>
        Effect.sync(() => new Uint8Array()).pipe(
          Effect.tap(crypto.getRandomValues),
          Effect.andThen(encodeHexLowerCase),
          Effect.andThen((encoded) => {
            SynchronizedRef.update(challengesRef, (challenges) =>
              challenges.add(encoded),
            );
            return encoded;
          }),
        ),
      ),
    );
  }

  validateChallenge(challenge: Uint8Array) {
    return TfChallenges.pipe(
      Effect.map((challengesRef) =>
        SynchronizedRef.update(challengesRef, (challenges) => {
          challenges.delete(encodeHexLowerCase(challenge));
          return challenges;
        }),
      ),
    );
  }
}
