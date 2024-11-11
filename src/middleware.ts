import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CsrfError, createCsrfProtect } from "@edge-csrf/nextjs";
import env from "../env";

// initalize csrf protection method
const csrfProtect = createCsrfProtect({
  cookie: {
    secure: env.NODE_ENV === "production",
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const requestHeaders = request.headers;
  requestHeaders.set("x-pinote-url", request.nextUrl.toString());
  const response = NextResponse.next({ headers: requestHeaders });

  try {
    await csrfProtect(request, response);
  } catch (err) {
    if (err instanceof CsrfError)
      return new NextResponse("invalid csrf token", { status: 403 });
    throw err;
  }

  return response;
}
