// Here we will reset the two factor auth when provided with the correct token.

import { userMetaRepo } from "@/repositories/*";
import { Branded } from "@/types/*";
import { Effect, Equivalence, Redacted } from "effect";
import { encryptString, generateRecoveryCode } from "./recovery";
import { httpError } from "@/utils/*";

// token will come from user.
export const resetTwoFactor =
  (userId: Branded.UserId) => (token: Redacted.Redacted<string>) =>
    Effect.gen(function* () {
      const tokenFromDB = yield* userMetaRepo
        .getUserMetaRecoveryCode(userId)
        .pipe(Effect.andThen(Redacted.make));
      const isEquals = Redacted.getEquivalence(Equivalence.string);
      if (isEquals(tokenFromDB, token)) {
        const newRecoveryCode = yield* generateRecoveryCode().pipe(
          Effect.andThen(encryptString),
        );
        return yield* userMetaRepo.resetUserMetaRecoveryCode(userId)(
          newRecoveryCode,
        );
      } else {
        return yield* new httpError.BadRequestError({
          message:
            "The token provided is incorrect. Please provide the correct token to reset the two factor authentication.",
        });
      }
    });
