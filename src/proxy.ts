import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: redirect signed-out visitors away from signed-in
// areas before rendering anything. It reads the session cookie and never
// touches the database (Proxy runs on every matched request, including
// prefetches). Real role enforcement lives in src/lib/auth-guard.ts.

const sessionCookies = ["authjs.session-token", "__Secure-authjs.session-token"];

export function proxy(request: NextRequest) {
  const signedIn = sessionCookies.some((name) => request.cookies.has(name));
  if (signedIn) return NextResponse.next();

  const signInUrl = new URL("/signin", request.url);
  signInUrl.searchParams.set(
    "callbackUrl",
    request.nextUrl.pathname + request.nextUrl.search
  );
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/submissions/:path*", "/review/:path*", "/generator/:path*", "/admin/:path*"],
};
