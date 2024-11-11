// Auth interceptor

import SigninPageRoute from "@/app/(pages)/sign-in/route.info";
import { Effect, Either, Match, Option, Redacted } from "effect";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { AUTH_COOKIE_NAME, cookie } from "./*";
import { redirect } from "next/navigation";
import { validateSessionToken } from "./auth.handlers";
import Database from "@/db/*";
import TwoFactorPageRoute from "@/app/(pages)/two-factor/route.info";
import TwoFactorVerificationPageRoute from "@/app/(pages)/two-factor/verification/route.info";
import { SessionWithUser } from "@/repositories/session.repo";
import WorkspacesPageRoute from "@/app/(pages)/(workspaces)/workspaces/route.info";

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

    const sessionWithUser = await validateSessionToken(
      Redacted.make(token),
    ).pipe(Effect.provide(Database.Default), Effect.runPromise);

    // The user is authenticated here. We will see the logic for two-factor from here.
    return Either.getRight(sessionWithUser).pipe(
      Option.match({
        onSome: ({ user, session }) =>
          Match.value(user.twoFactorAuth).pipe(
            Match.when(true, () =>
              Match.value(session.tfVerified).pipe(
                Match.when(true, () =>
                  redirect(this.#redirectUrl ?? this.#nextRoute),
                ),
                Match.orElse(() =>
                  Match.value(user.authenticators.length > 0).pipe(
                    Match.when(true, () => this.#redirectOrDoNothing("tf")),
                    Match.orElse(() => this.#redirectOrDoNothing("tf-reg")),
                  ),
                ),
              ),
            ),
            Match.orElse(() => redirect(this.#redirectUrl ?? this.#nextRoute)),
          ),
        onNone: () => this.#redirectOrDoNothing("sign-in"),
      }),
    );
  }
}
