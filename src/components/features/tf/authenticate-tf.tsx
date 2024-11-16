"use client";

import { Button } from "@/components/ui/button";
import { Fingerprint } from "lucide-react";
import { useState } from "react";
import { Recover } from "./recover";
import { Authenticate } from "./authenticate";

export const AuthenticateTF = () => {
  const [recover, setRecover] = useState(false);
  return (
    <div className="flex space-y-4 max-w-[60%] w-full flex-col justify-center">
      <div className="border p-2 w-fit rounded-md">
        <Fingerprint className="shrink-0 size-6" />
      </div>
      <h1 className="font-cal text-3xl ">
        Two Factor <br /> Authentication
      </h1>
      <p className="text-muted-foreground text-xs leading-relaxed">
        Pinote uses state of the art two factor authentication using webauthn
        passkeys to secure your account.
      </p>
      {recover ? <Recover /> : <Authenticate />}
      <hr />
      {recover ? (
        <div className="flex items-center gap-1">
          <p className="text-muted-foreground text-xs">
            Use registered authenticator to login?
          </p>
          <Button
            onClick={() => setRecover(false)}
            size="sm"
            className="text-xs p-0"
            variant="link"
          >
            Complete 2FA
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <p className="text-muted-foreground text-xs">
            Can&apos;t access your device?
          </p>
          <Button
            onClick={() => setRecover(true)}
            size="sm"
            className="text-xs p-0"
            variant="link"
          >
            Recover account
          </Button>
        </div>
      )}
    </div>
  );
};
