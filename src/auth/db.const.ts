import { Duration } from "effect";

export const sessionDuration = Duration.days(30);
export const sessionReValidationDuration = Duration.days(15);
export const AUTH_COOKIE_NAME = "oauth_session_token";
