// Auth interceptor

import SigninPageRoute from "@/app/(pages)/sign-in/route.info";
import { Effect, Either, Match, Option, Redacted } from "effect";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { AUTH_COOKIE_NAME, cookie } from "./*";
import { redirect } from "next/navigation";
import { validateSessionToken } from "./auth.handlers";
import { provideDB } from "@/db/*";
import TwoFactorPageRoute from "@/app/(pages)/two-factor/route.info";
import TwoFactorVerificationPageRoute from "@/app/(pages)/two-factor/verification/route.info";
import { SessionWithUser } from "@/repositories/session.repo";
import WorkspacesPageRoute from "@/app/(pages)/(workspaces)/workspaces/route.info";
import { asEither } from "@/trpc/utils.trpc";

export class AuthInterceptor {
  // Path -> take the path of the current page. route directory
  #path: string | null;
  // Base -> base url, should be set right after the interceptor is created
  #base: string | null;
  // After auth -> function to be called after the user has been authenticated
  #afterAuth?: (sessionWithUser: SessionWithUser) => PromiseLike<void>;
  // Redirect url -> url to redirect the user in case of no authentication
  #redirectUrl: string | null;
  // Provide headers -> function to provide headers
  #headers?: ReadonlyHeaders;
  // Next route -> route to redirect the user to after authentication
  #nextRoute: string;

  constructor() {
    this.#base = null;
    this.#path = null;
    this.#redirectUrl = null;
    this.#nextRoute = WorkspacesPageRoute.navigate();
  }

  setHeaders(headers: ReadonlyHeaders) {
    this.#headers = headers;
    return this;
  }

  setPath(path: string) {
    this.#path = path;
    return this;
  }

  // Set the base url
  setBase() {
    if (!this.#headers) {
      throw new Error(
        "Headers must be set before setting the base url for auth.",
      );
    }

    const protocol = this.#headers.get("x-forwarded-proto");
    const host = this.#headers.get("host");
    this.#base = new URL(`${protocol}://${host}`).toString();

    return this;
  }

  // Once set, if the user is not authenticated, they will be redirected from there.
  // You do not want to set this for the sign in or the web auth routes
  withRedirect() {
    if (!this.#headers) {
      throw new Error(
        "Headers must be set before setting the redirect for auth.",
      );
    }

    const redirectUrl = this.#headers.get("x-pinote-url");

    if (!redirectUrl) {
      throw new Error(
        "Redirect url must be set in the headers. We could not find any.",
      );
    }

    this.#redirectUrl = redirectUrl;

    return this;
  }

  // Private method -> Find the route to redirect the user to
  #redirectRoutes(to: "sign-in" | "tf" | "tf-reg") {
    switch (to) {
      case "sign-in":
        return SigninPageRoute;
      case "tf":
        return TwoFactorPageRoute;
      case "tf-reg":
        return TwoFactorVerificationPageRoute;
    }
  }

  // Redirect the user to the sign in page
  #redirectOrDoNothing(to: "sign-in" | "tf" | "tf-reg") {
    if (!this.#path) {
      throw new Error("Path must be set before executing the interceptor.");
    }

    const RouteInfo = this.#redirectRoutes(to);

    if (this.#path === RouteInfo.navigate()) {
      return;
    } else {
      if (this.#redirectUrl) {
        redirect(
          RouteInfo.navigate(
            {},
            { searchParams: { redirectUrl: this.#redirectUrl } },
          ),
        );
      } else {
        redirect(RouteInfo.navigate());
      }
    }
  }

  #successRedirect({ isFullUrl, url }: { isFullUrl: boolean; url: string }) {
    if (!this.#path) {
      throw new Error("Path must be set before executing the interceptor.");
    }

    const moveFromPages = [
      SigninPageRoute.navigate(),
      TwoFactorPageRoute.navigate(),
      TwoFactorVerificationPageRoute.navigate(),
    ];

    return Match.value(isFullUrl).pipe(
      Match.when(true, () => {
        const path = new URL(url).pathname;
        if (moveFromPages.includes(path)) {
          return redirect(this.#nextRoute);
        }
        if (this.#path === path) {
          return;
        }
        redirect(url);
      }),
      Match.orElse(() => {
        if (moveFromPages.includes(url)) {
          return redirect(this.#nextRoute);
        }
        if (this.#path === url) {
          return;
        }
        redirect(url);
      }),
    );
  }

  // Executing the interceptor
  async execute() {
    if (!this.#path || !this.#base || !this.#headers) {
      throw new Error(
        "Path, base and headers must be set before executing the interceptor.",
      );
    }

    const token = await cookie
      .getCookie(AUTH_COOKIE_NAME)
      .pipe(Effect.runPromise);

    // if the token is not found in the cookie, redirect the user to the sign in page
    if (!token) {
      // if the redirect url is set, we will redirect the user to the sign in page with the redirect url
      return this.#redirectOrDoNothing("sign-in");
    }

    const sessionWithUser = Either.getOrNull(
      await validateSessionToken(Redacted.make(token)).pipe(
        provideDB,
        Effect.runPromise,
      ),
    );

    // The user is authenticated here. We will see the logic for two-factor from here.
    // return Either.getRight(sessionWithUser).pipe(
    //   // Condition Matching
    //   Option.match({
    //     onSome: ({ user, session }) =>
    //       // Check if user has skipped the two-factor step
    //       Match.value(user.skippedTfStep).pipe(
    //         // When true -> send to the success redirect
    //         Match.when(true, () =>
    //           this.#successRedirect({
    //             isFullUrl: this.#redirectUrl !== null,
    //             url: this.#redirectUrl ?? this.#nextRoute,
    //           }),
    //         ),
    //         // When false -> check if the user has two-factor auth enabled
    //         Match.orElse(() =>
    //           Match.value(user.twoFactorAuth).pipe(
    //             // When true -> check if the user has verified the two-factor auth
    //             Match.when(true, () =>
    //               Match.value(session.tfVerified).pipe(
    //                 // When true -> send to the success redirect
    //                 Match.when(true, () =>
    //                   this.#successRedirect({
    //                     isFullUrl: this.#redirectUrl !== null,
    //                     url: this.#redirectUrl ?? this.#nextRoute,
    //                   }),
    //                 ),
    //                 Match.orElse(() =>
    //                   Match.value(user.authenticators.length > 0).pipe(
    //                     // When true -> send to the two-factor page
    //                     Match.when(true, () => this.#redirectOrDoNothing("tf")),
    //                     // When false -> send to the two-factor registration page
    //                     Match.orElse(() => this.#redirectOrDoNothing("tf-reg")),
    //                   ),
    //                 ),
    //               ),
    //             ),
    //             Match.orElse(() =>
    //               this.#redirectOrDoNothing(
    //                 user.authenticators.length ? "tf" : "tf-reg",
    //               ),
    //             ),
    //           ),
    //         ),
    //       ),
    //     onNone: () => this.#redirectOrDoNothing("sign-in"),
    //   }),
    // );

    if (!sessionWithUser) {
      return this.#redirectOrDoNothing("sign-in");
    }

    const { user, session } = sessionWithUser;

    if (this.#path === SigninPageRoute.navigate()) {
      if (user.skippedTfStep || (user.twoFactorAuth && session.tfVerified)) {
        return this.#successRedirect({
          isFullUrl: this.#redirectUrl !== null,
          url: this.#redirectUrl ?? this.#nextRoute,
        });
      }
    }

    if (
      [
        TwoFactorPageRoute.navigate(),
        TwoFactorVerificationPageRoute.navigate(),
      ].includes(this.#path)
    ) {
      if (user.skippedTfStep || (user.twoFactorAuth && session.tfVerified)) {
        return this.#successRedirect({
          isFullUrl: this.#redirectUrl !== null,
          url: this.#redirectUrl ?? this.#nextRoute,
        });
      }
    }

    if (user.skippedTfStep) {
      return this.#successRedirect({
        isFullUrl: this.#redirectUrl !== null,
        url: this.#redirectUrl ?? this.#nextRoute,
      });
    }

    if (user.twoFactorAuth) {
      // check if the user has verified the two-factor auth
      if (session.tfVerified) {
        return this.#successRedirect({
          isFullUrl: this.#redirectUrl !== null,
          url: this.#redirectUrl ?? this.#nextRoute,
        });
      } else {
        if (user.authenticators.length > 0) {
          return this.#redirectOrDoNothing("tf");
        } else {
          return this.#redirectOrDoNothing("tf-reg");
        }
      }
    }
  }
}
