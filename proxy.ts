import { redis } from "./lib/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hashSessionId } from "./features/auth/server";

const middleware = async (request: NextRequest) => {
  const { pathname, searchParams } = request.nextUrl;

  // prevent bad redirects
  const saferRedirects = ["/products"];
  const redirectTo = searchParams.get("redirect");
  if (redirectTo) {
    if (!saferRedirects.includes(redirectTo)) {
      const url = new URL(request.url);
      url.searchParams.set("redirect", "");
      return NextResponse.redirect(url);
    }
  }

  const protectedPages: Array<string> = []; // add more later

  // no session cookie → user is unauthenticated → block protected routes
  const sessionId = request.cookies.get("sessionId")?.value;

  const isProtectedPage = protectedPages.some((p) => pathname.startsWith(p));
  if (!sessionId && isProtectedPage) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${pathname}`, request.url),
    );
  }

  // session cookie exists → verify it against Redis to prevent fake/expired sessions
  // best practice is redis (ram) lookup instead of (disk) lookup

  if (sessionId) {
    // if sessionId fake or session expired the redis.get return null
    const userId = await redis.get(`session:${hashSessionId(sessionId)}`);

    if (!userId) {
      const res = NextResponse.redirect(
        new URL(`/login?redirect=${pathname}`, request.url),
      );
      res.cookies.delete("sessionId");
      return res;
    }

    // boolean
    const isAuthPage =
      pathname.startsWith("/login") || pathname.startsWith("/register");

    if (isAuthPage) {
      // logged in → block auth pages → usually go home
      return NextResponse.redirect(new URL("/products", request.url));
    }
  }
  return NextResponse.next();
};

// (handle later)
export const config = { matcher: ["/login", "/register", "/products"] };

export default middleware;
