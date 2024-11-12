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
      Effect.map((challengesRef) => {
        const encodedChallenge = encodeHexLowerCase(challenge);
        const exists =
          SynchronizedRef.get(challengesRef).hasOwnProperty(encodedChallenge);
        SynchronizedRef.update(challengesRef, (challenges) => {
          challenges.delete(encodedChallenge);
          return challenges;
        });
        return exists;
      }),
    );
  }
}

export const provideChallengeRef = <A, E, R>(
  self: Effect.Effect<A, E, R | TfChallenges>,
): Effect.Effect<A, E, Exclude<R, TfChallenges>> =>
  Effect.provide(self, TfChallenges.Default);
