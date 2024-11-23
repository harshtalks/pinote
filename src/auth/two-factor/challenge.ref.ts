// Ref to hold the challenge through the webauthn process

import { provideDefault } from "@/utils/*";
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
        Effect.sync(() => new Uint8Array(20)).pipe(
          Effect.tap(crypto.getRandomValues),
          Effect.tap((challenge) =>
            SynchronizedRef.update(challengesRef, (challenges) =>
              challenges.add(encodeHexLowerCase(challenge)),
            ),
          ),
        ),
      ),
    );
  }

  validateChallenge(challenge: Uint8Array) {
    return TfChallenges.pipe(
      Effect.map((challengesRef) => {
        const encodedChallenge = encodeHexLowerCase(challenge);
        const exists = SynchronizedRef.get(challengesRef).pipe(
          Effect.andThen((set) => set.has(encodedChallenge)),
        );
        SynchronizedRef.update(challengesRef, (challenges) => {
          challenges.delete(encodedChallenge);
          return challenges;
        });
        return exists;
      }),
    );
  }
}

export const provideChallengeRef = provideDefault(TfChallenges.Default);
