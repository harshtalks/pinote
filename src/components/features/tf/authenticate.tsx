"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import {
  getErrorMessage,
  Notify,
  provideNotify,
  Result,
  UncaughtError,
} from "@/utils/*";
import { decodeBase64, encodeBase64 } from "@oslojs/encoding";
import { Effect } from "effect";
import { useRouter } from "next/navigation";

export const Authenticate = () => {
  const challengeMutation = api.twoFactor.createChallenge.useMutation();
  const { data: user } = api.user.me.useQuery();
  const changeUserTwoFactorStatus = api.twoFactor.updateTfStatus.useMutation();
  const verification = api.twoFactor.tfVerify.useMutation();
  const router = useRouter();

  const authenticateTwoFactor = () =>
    Effect.gen(function* () {
      // toast ref
      const notify = yield* Notify;

      // show toast
      yield* notify.createToast("loading")(
        "Creating authentication challenge...",
      );

      const challenge = yield* Effect.promise(() =>
        challengeMutation.mutateAsync(),
      );

      if (Result.isErr(challenge)) {
        yield* notify.createToast("error")(challenge.error.message, true);
        return;
      } else {
        return yield* Result.getOk(challenge).pipe(
          Effect.andThen(decodeBase64),
          Effect.andThen(authenticateUser),
          Effect.andThen(verifyCredential),
        );
      }
    }).pipe(
      Effect.catchAll((e) =>
        Notify.pipe(
          Effect.andThen((notify) =>
            notify.createToast("error")(getErrorMessage(e), true),
          ),
        ),
      ),
      Effect.catchAllDefect((e) =>
        Notify.pipe(
          Effect.andThen((notify) =>
            notify.createToast("error")(getErrorMessage(e), true),
          ),
        ),
      ),
      provideNotify,
      Effect.runPromise,
    );

  const authenticateUser = (challengeToken: Uint8Array) =>
    Effect.gen(function* () {
      const notify = yield* Notify;

      if (!user) {
        yield* notify.createToast("error")("User not found", true);
        return;
      }

      if (!user.twoFactorAuth) {
        yield* notify.createToast("loading")(
          "Enabling two factor authentication for user",
        );

        const response = yield* Effect.promise(() =>
          changeUserTwoFactorStatus.mutateAsync({
            status: true,
          }),
        );

        if (Result.isErr(response)) {
          yield* notify.createToast("error")(response.error.message, true);
          return;
        }
      }

      yield* notify.createToast("loading")("Creating credentials");

      const credential = yield* Effect.promise(() =>
        navigator.credentials.get({
          publicKey: {
            challenge: challengeToken,
            userVerification: "discouraged",
            allowCredentials: user.authenticators.map((el) => ({
              id: decodeBase64(el),
              type: "public-key",
            })),
          },
        }),
      );

      yield* notify.createToast("success")("Credentials created successfully");

      return credential;
    });

  const verifyCredential = (credential: Credential | null | undefined) =>
    Effect.gen(function* () {
      const notify = yield* Notify;

      if (!(credential instanceof PublicKeyCredential)) {
        return yield* Effect.fail(
          new UncaughtError({
            message: "Failed to create public key",
          }),
        );
      }
      if (!(credential.response instanceof AuthenticatorAssertionResponse)) {
        return yield* Effect.fail(
          new UncaughtError({
            message: "Unexpected error",
          }),
        );
      }

      yield* notify.createToast("loading")(
        "Registering credential with server",
      );

      const authenticatorData = encodeBase64(
        new Uint8Array(credential.response.authenticatorData),
      );
      const clientDataJSON = encodeBase64(
        new Uint8Array(credential.response.clientDataJSON),
      );
      const credentialId = encodeBase64(new Uint8Array(credential.rawId));
      const signature = encodeBase64(
        new Uint8Array(credential.response.signature),
      );

      const response = yield* Effect.promise(() =>
        verification.mutateAsync({
          clientDataJSON,
          authenticatorData,
          credentialId,
          signature,
        }),
      );

      if (Result.isOk(response)) {
        router.refresh();
        yield* notify.createToast("success")(
          "Credential verified and authenticated successfully. You will be redirected shortly.",
          true,
        );
      } else {
        yield* notify.createToast("error")(response.error.message, true);
      }
    });

  return (
    <Button
      onClick={authenticateTwoFactor}
      size="sm"
      variant="shine"
      className="w-full tracking-normal font-cal group"
    >
      Authenticate
    </Button>
  );
};
