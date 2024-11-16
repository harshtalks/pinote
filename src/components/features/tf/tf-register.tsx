"use client";
import { useState } from "react";
import { RegisterTwoFactor } from "./register";
import { Redacted } from "effect";
import { Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkipStatus } from "./skip-status";
import { VerificationToken } from "./verification-token";
import { ResetUser } from "./reset-user";
import { useRouter } from "next/navigation";

export const TwoFactorRegistration = () => {
  const [verificationCode, setVerificationCode] =
    useState<Redacted.Redacted<string>>();
  const router = useRouter();

  return (
    <div className="flex space-y-4 max-w-[60%] w-full flex-col justify-center">
      <div className="border p-2 w-fit rounded-md">
        <Fingerprint className="shrink-0 size-6" />
      </div>
      <h1 className="font-cal text-3xl ">
        Two Factor <br /> Passkey Registration
      </h1>
      <p className="text-muted-foreground text-xs leading-relaxed">
        Pinote uses state of the art two factor authentication using webauthn
        passkeys to secure your account.
      </p>
      {verificationCode ? (
        <>
          <VerificationToken token={verificationCode} />
          <Button
            onClick={() => {
              router.refresh();
            }}
          >
            Continue
          </Button>
        </>
      ) : (
        <RegisterTwoFactor
          setVerificationCode={(token) => {
            setVerificationCode(token);
          }}
        >
          <Button
            size="sm"
            variant="shine"
            className="w-full tracking-normal font-cal group"
          >
            Register with Webauthn
          </Button>
        </RegisterTwoFactor>
      )}
      <hr />
      <div className="flex items-center gap-1">
        {verificationCode ? (
          <p className="text-muted-foreground leading-relaxed text-xs">
            Do not reload or close the page until you have verified and copied
            the token. In case you lose the token, you will need to reset your
            account.
          </p>
        ) : (
          <p className="text-muted-foreground leading-relaxed text-xs">
            Do not want to use two factor? <SkipStatus />
            <br />
            <span className="leading-relaxed">
              You can always enable it later from settings. Implementing two
              factor authentication is an expensive choice for us and we may
              monetize it in the future.
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
