import { api } from "@/trpc/server";
import { RoundedHoverBtn } from "../global/buttons/rouded-hover";
import { ClerkBadge } from "./clerkBadge";
import SigninPageRoute from "@/app/(pages)/sign-in/route.info";

export const Hero = async () => {
  const x = await api.health();

  return (
    <section className="p-24 pt-[200px]">
      {JSON.stringify(x)}
      <div className="max-w-xl">
        <p className="text-muted-foreground opacity-80 text-xs tracking-[0.3rem] uppercase"></p>
        <ClerkBadge>Open Source Substack Alternative</ClerkBadge>
        <h1 className="text-6xl py-6 font-cal font-semibold">
          For Those Who Want To Own Their Audience.
        </h1>
        <h4 className="font-normal text-muted-foreground tracking-wide">
          Pinote is a free and open-source Substack alternative that allows you
          to own your audience and content. Notion style editor, custom domain,
        </h4>
        <SigninPageRoute.Link params={undefined}>
          <RoundedHoverBtn className="mt-6">Get Started</RoundedHoverBtn>
        </SigninPageRoute.Link>
      </div>
    </section>
  );
};
