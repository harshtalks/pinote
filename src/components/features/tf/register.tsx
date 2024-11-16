import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import { ReactNode, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserCircle, X } from "lucide-react";
import { api } from "@/trpc/client";
import { decodeBase64, encodeBase64 } from "@oslojs/encoding";
import { Effect, Redacted } from "effect";
import { getErrorMessage, UncaughtError } from "@/utils/errors";
import { Notify, provideNotify, Result } from "@/utils/*";

export const RegisterTwoFactor = ({
  children,
  setVerificationCode,
}: {
  children: ReactNode;
  setVerificationCode: (token: Redacted.Redacted<string>) => void;
}) => {
  const challengeMutation = api.twoFactor.createChallenge.useMutation();
  const registration = api.twoFactor.register.useMutation();
  const changeUserTwoFactorStatus = api.twoFactor.updateTfStatus.useMutation();
  const { data: user } = api.user.me.useQuery();
  const [name, setName] = useState("");

  const registerTwoFactorVerification = () =>
    Effect.gen(function* () {
      const notify = yield* Notify;
      yield* notify.createToast("loading")("Creating Challeneg in the backend");

      const challenge = yield* Effect.promise(() =>
        challengeMutation.mutateAsync(),
      );

      if (Result.isErr(challenge)) {
        yield* notify.createToast("error")(challenge.error.message, true);
        return;
      } else {
        return yield* Result.getOk(challenge).pipe(
          Effect.andThen(decodeBase64),
          Effect.andThen(registrateUser),
          Effect.andThen(registerCredential),
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

  const registrateUser = (challengeToken: Uint8Array) =>
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
        navigator.credentials.create({
          publicKey: {
            challenge: challengeToken,
            rp: {
              name: "Pinote",
            },
            user: {
              displayName: user.githubId,
              id: new Uint8Array(Buffer.from(user.id)),
              name: user.email,
            },
            pubKeyCredParams: [
              {
                alg: -7,
                type: "public-key",
              },
              {
                alg: -257,
                type: "public-key",
              },
            ],
            attestation: "none",
            authenticatorSelection: {
              userVerification: "required",
              residentKey: "required",
              requireResidentKey: true,
            },
            excludeCredentials: user.authenticators.map((el) => ({
              id: decodeBase64(el),
              type: "public-key",
            })),
          },
        }),
      );

      yield* notify.createToast("success")("Credentials created successfully");

      return credential;
    });

  const registerCredential = (credential: Credential | null | undefined) =>
    Effect.gen(function* () {
      const notify = yield* Notify;

      if (!(credential instanceof PublicKeyCredential)) {
        return yield* Effect.fail(
          new UncaughtError({
            message: "Failed to create public key",
          }),
        );
      }
      if (!(credential.response instanceof AuthenticatorAttestationResponse)) {
        return yield* Effect.fail(
          new UncaughtError({
            message: "Unexpected error",
          }),
        );
      }

      const attestationObject = encodeBase64(
        new Uint8Array(credential.response.attestationObject),
      );
      const clientDataJSON = encodeBase64(
        new Uint8Array(credential.response.clientDataJSON),
      );

      yield* notify.createToast("loading")(
        "Registering credential with server",
      );

      const response = yield* Effect.promise(() =>
        registration.mutateAsync({
          attestationObject,
          clientDataJSON,
          name,
        }),
      );

      if (Result.isOk(response)) {
        setVerificationCode(Redacted.make(response.value.recoveryCode));
        yield* notify.createToast("success")(
          "Credential registered successfully, Please make a note of your verification token. You will not be able to recover of your account if you lose it.",
          true,
        );
      } else {
        yield* notify.createToast("error")(response.error.message, true);
      }
    });

  return (
    <Credenza>
      <CredenzaTrigger asChild>{children}</CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle className="font-cal">
            Two Factor Registration
          </CredenzaTitle>
          <CredenzaDescription className="text-[10px] pb-4 text-muted-foreground">
            Passkey based two factor verification for maximum security. After
            the successful registration and verification, you will be prompted
            with a verification token that you can save for future use. Remember
            it will be only shown once and you will not be able to recover it.
          </CredenzaDescription>
        </CredenzaHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            registerTwoFactorVerification();
          }}
        >
          <CredenzaBody>
            <div className="group relative">
              <label
                htmlFor="input-32"
                className="origin-start absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-sm text-muted-foreground/70 transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium has-[+input:not(:placeholder-shown)]:text-foreground"
              >
                <span className="inline-flex bg-background px-2">
                  Enter Credential Name
                </span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                id="credential-name"
                placeholder=""
              />
            </div>
          </CredenzaBody>
          <CredenzaFooter className="mt-4 text-start">
            <Button
              disabled={!name}
              type="submit"
              className="group text-xs font-cal"
              variant="default"
            >
              <UserCircle
                className="-ms-1 me-2 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Register Two Factor
              <ArrowRight
                className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
            </Button>
            <CredenzaClose asChild>
              <Button type="button" className="text-xs" variant="ghost">
                <X
                  className="-ms-1 me-2 opacity-60"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Close
              </Button>
            </CredenzaClose>
          </CredenzaFooter>
        </form>
      </CredenzaContent>
    </Credenza>
  );
};

// Dependencies: pnpm install lucide-react
