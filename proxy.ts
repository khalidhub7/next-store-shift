import { redis } from "./lib/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./features/auth/server";
import { hashSessionId } from "./features/auth/server";
import { deleteSession } from "./features/auth/db/session";
import { isSessionValid } from "./features/auth/session.helpers";

const middleware = async (request: NextRequest) => {
  const { pathname, searchParams } = request.nextUrl;
  const saferRedirects = ["/products"]; // prevent bad redirects

  const redirectTo = searchParams.get("redirect");

  if (redirectTo) {
    if (!saferRedirects.includes(redirectTo)) {
      const url = new URL(request.url);
      url.searchParams.set("redirect", "");

      return NextResponse.redirect(url);
    }
  }

  const protectedPages: Array<string> = []; // add more later

  const sessionId = request.cookies.get("sessionId")?.value;

  // not logged in → block protected routes
  if (!sessionId) {
    for (const p of protectedPages) {
      if (pathname.startsWith(p)) {
        return NextResponse.redirect(
          new URL(`/login?redirect=${pathname}`, request.url),
        );
      }
    }
  }

  // if 'sessionId' we should ensure that is not fake by lookup
  // best practice is redis (ram) lookup
  // but lets do db (disk) lookup temporarily

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
