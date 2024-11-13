import { AuthInterceptor } from "@/auth/interceptor";
import {
  postHumansVectors,
  RandomVectors,
} from "@/components/features/sign-in/*";
import { Button } from "@/components/ui/button";
import { Fingerprint } from "lucide-react";
import TwoFactorVerificationPageRoute from "./route.info";
import { headers } from "next/headers";
import { SkipStatus } from "@/components/features/tf/skip-status";

const TwoFactorPage = async () => {
  await new AuthInterceptor()
    .setPath(TwoFactorVerificationPageRoute.navigate())
    .setHeaders(await headers())
    .setBase()
    .withRedirect()
    .execute();

  return (
    <section className="flex h-screen items-center p-4">
      <div className="max-w-[600px] w-[600px] h-full flex justify-center items-center">
        <div className="flex space-y-4 max-w-[60%] w-full flex-col justify-center">
          <div className="border p-2 w-fit rounded-md">
            <Fingerprint className="shrink-0 size-6" />
          </div>
          <h1 className="font-cal text-3xl ">
            Two Factor <br /> Passkey Verification
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
            Verify with Webauthn
          </Button>
          <hr />
          <div className="flex items-center gap-1">
            <p className="text-muted-foreground text-xs">
              Do not want to use two factor? <SkipStatus />
              <br />
              <span className="leading-relaxed">
                You can always enable it later from settings. Implementing two
                factor authentication is an expensive choice for us and we may
                monetize it in the future.
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 h-full bg-[#ebebeb] rounded-2xl flex items-center justify-center">
        <RandomVectors vectors={postHumansVectors} className="size-[400px]" />
      </div>
    </section>
  );
};

export default TwoFactorPage;
