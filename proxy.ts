import { NextResponse } from "next/server";
import { getSession } from "./lib/db/session";
import type { NextRequest } from "next/server";
import { isSessionValid } from "./lib/auth/session";

const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
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
    }
  }

  const isProtected = pathname.startsWith("/checkout"); // add more if needed

  // not logged in → block protected routes
  if (!sessionId && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
};

const config = {
  matcher: ["/login"], // empty right now (handle later)
};

export { middleware, config };
