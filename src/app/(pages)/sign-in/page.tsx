import GithubSigninApiRoute from "@/app/api/auth/github/sign-in/route.info";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

const SignInPage = () => {
  return (
    <>
      <section>
        <div className="flex mt-20 flex-col space-y-8 h-full items-center justify-center">
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
              Icon={Github}
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
    </>
  );
};

export default SignInPage;
