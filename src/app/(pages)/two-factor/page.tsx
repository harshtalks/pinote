import { Button } from "@/components/ui/button";
import { Fingerprint } from "lucide-react";

const TwoFactorPage = () => {
  return (
    <section className="flex h-screen items-center p-4">
      <div className="max-w-[600px] w-[600px] h-full flex justify-center items-center">
        <div className="flex space-y-4 max-w-[60%] w-full flex-col justify-center">
          <div className="border p-2 w-fit rounded-md">
            <Fingerprint className="shrink-0 size-6" />
          </div>
          <h1 className="font-cal text-3xl ">
            Two Factor <br /> Authentication
          </h1>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Pinote uses state of the art two factor authentication using
            webauthn passkeys to secure your account.
          </p>
          <Button
            size="sm"
            variant="shine"
            className="w-full tracking-normal font-cal group"
          >
            Authenticate
          </Button>
          <hr />
          <Button
            size="sm"
            className="font-cal tracking-normal"
            variant="secondary"
          >
            Register a new device
          </Button>
          <div className="flex items-center gap-1">
            <p className="text-muted-foreground text-xs">
              Can&apos;t access your device?
            </p>
            <Button size="sm" className="text-xs p-0" variant="link">
              Recover account
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 h-full bg-gray-400 rounded-2xl"></div>
    </section>
  );
};

export default TwoFactorPage;
