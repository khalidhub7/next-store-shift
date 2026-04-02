import { NextResponse } from "next/server";
import { getSession } from "./lib/db/session";
import type { NextRequest } from "next/server";
import { isSessionValid } from "./lib/auth/session";
import { isValidElement } from "react";

const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const protectedPages: Array<string> = []; // add more if later
  const sessionId = request.cookies.get("sessionId")?.value;

  // to ensure 'sessionId' not fake we should do a lookup
  // best practice is redis (ram) lookup
  // but lets do db (disk) lookup temporarily

  if (sessionId) {
    const session = await getSession(sessionId);
    if (session) {
      const isValid = isSessionValid(session);
      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register");

      if (isValid && isAuthPage) {
        // logged in → block auth pages
        return NextResponse.redirect(new URL("/products", request.url));
      }
      // not logged in → block protected routes
      if (!sessionId && isValid) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      protectedPages.forEach((p) => {
        if (!isValid && pathname.startsWith(p)) {
          return NextResponse.redirect(new URL("/login", request.url));
        }
      });
    }
  }
  return NextResponse.next();
};

const config = {
  matcher: ["/login"], // empty right now (handle later)
};

export { middleware, config };
