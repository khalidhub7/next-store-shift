import { NextResponse } from "next/server";
import { getSession } from "./lib/db/session";
import type { NextRequest } from "next/server";
import { isSessionValid } from "./lib/auth/session";

const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const protectedPages: Array<string> = []; // add more if later
  const sessionId = request.cookies.get("sessionId")?.value;

  // not logged in → block protected routes
  if (!sessionId) {
    for (const p of protectedPages) {
      if (pathname.startsWith(p)) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  // if 'sessionId' we should ensure that is not fake by lookup
  // best practice is redis (ram) lookup
  // but lets do db (disk) lookup temporarily

  if (sessionId) {
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session) {
      const isValid = isSessionValid(session);
      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register");

      if (isValid && isAuthPage) {
        // logged in → block auth pages
        return NextResponse.redirect(new URL("/products", request.url));
      }
      // session exist but not valid → block protected routes
      for (const p of protectedPages) {
        if (!isValid && pathname.startsWith(p)) {
          return NextResponse.redirect(new URL("/login", request.url));
        }
      }
    }
  }
  return NextResponse.next();
};

const config = {
  matcher: ["/login", "/register"], // (handle later)
};

export { middleware, config };
