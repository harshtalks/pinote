import { AuthInterceptor } from "@/auth/interceptor";
import {
  postHumansVectors,
  RandomVectors,
} from "@/components/features/sign-in/*";

import TwoFactorPageRoute from "./route.info";
import { headers } from "next/headers";
import { AuthenticateTF } from "@/components/features/tf/authenticate-tf";

const TwoFactorPage = async () => {
  await new AuthInterceptor()
    .setPath(TwoFactorPageRoute.navigate())
    .setHeaders(await headers())
    .setBase()
    .withRedirect()
    .execute();

  return (
    <section className="flex h-screen items-center p-4">
      <div className="max-w-[600px] w-[600px] h-full flex justify-center items-center">
        <AuthenticateTF />
      </div>
      <div className="flex-1 h-full bg-[#ebebeb] rounded-2xl flex items-center justify-center">
        <RandomVectors vectors={postHumansVectors} className="size-[400px]" />
      </div>
    </section>
  );
};

export default TwoFactorPage;
