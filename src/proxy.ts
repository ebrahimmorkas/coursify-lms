import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/tokens";

const PROTECTED_PREFIXES = ["/dashboard", "/studio", "/learn", "/checkout"];

/**
 * Optimistic route protection based on the presence of a session cookie.
 * This keeps redirects fast; pages and server actions still validate the
 * session against the database before returning any private data.
 *
 * Note: signed-in users are NOT redirected away from /login here. A cookie can be
 * stale (expired or revoked session), and redirecting on its presence alone would
 * bounce between /login and protected pages forever. The auth pages check the
 * session against the database instead.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession && PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
