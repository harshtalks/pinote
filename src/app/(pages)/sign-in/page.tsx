import GithubSigninApiRoute from "@/app/api/auth/github/sign-in/route.info";
import { Button } from "@/components/ui/button";
import { RouteProps, withTypedParams } from "@/hoc/with-typed-params.hoc";
import SigninPageRoute from "./route.info";
import { AuthInterceptor } from "@/auth/interceptor";
import { headers } from "next/headers";
import { GithubIcon } from "lucide-react";
import { RandomVectors } from "@/components/features/sign-in/*";

const SignInPage = async (routeProps: RouteProps) => {
  return (
    await withTypedParams(SigninPageRoute)(routeProps)(async () => {
      const heads = await headers();

      await new AuthInterceptor()
        .setHeaders(heads)
        .setPath(SigninPageRoute.navigate())
        .setBase()
        .withRedirect()
        .execute();

      return (
        <section>
          <div className="flex h-screen flex-col space-y-8 items-center justify-center">
            <RandomVectors />
            <h1 className="text-6xl font-semibold font-cal">
              Get Started with Github
            </h1>

            <GithubSigninApiRoute.Link
              searchParams={{
                redirectUrl: "/",
              }}
              params={undefined}
            >
              <Button
                iconPlacement="left"
                variant="ringHover"
                Icon={GithubIcon}
                iconClassName="opacity-100 w-5 mr-2"
              >
                Sign in with Github
              </Button>
            </GithubSigninApiRoute.Link>
            <p className="text-muted-foreground max-w-2xl mx-auto text-center text-xs tracking-wider leading-relaxed">
              We rely on Github OAuth services to authenticate users. We do not
              store any of your data except for your github username and one of
              the primary email addresses associated with your account.
            </p>
          </div>
        </section>
      );
    })
  )({});
};

export default SignInPage;
