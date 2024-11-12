// Here we will reset the two factor auth when provided with the correct token.

import { userMetaRepo } from "@/repositories/*";
import { Branded } from "@/types/*";
import { Effect, Either, Equivalence, Redacted } from "effect";
import { encryptString, generateRecoveryCode } from "./recovery";

// token will come from user.
export const resetTwoFactor =
  (userId: Branded.UserId) => (token: Redacted.Redacted<string>) =>
    Effect.gen(function* () {
      const tokenFromDB = yield* userMetaRepo.getUserMetaRecoveryCode(userId);
      const isEquals = Redacted.getEquivalence(Equivalence.string);
      if (isEquals(tokenFromDB, token)) {
        const newRecoveryCode = yield* generateRecoveryCode().pipe(
          Effect.andThen(encryptString),
        );
        yield* userMetaRepo.resetUserMetaRecoveryCode(userId)(newRecoveryCode);
        return Either.right(true);
      } else {
        return Either.left(false);
      }
    });
