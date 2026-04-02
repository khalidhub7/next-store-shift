import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const middleware = (request: NextRequest) => {
  const sessionId = request.cookies.get("sessionId")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtected = pathname.startsWith("/checkout"); // add more if needed

  // not logged in → block protected routes
  if (!sessionId && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // logged in → block auth pages
  if (sessionId && isAuthPage) {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  return NextResponse.next();
};

const config = {
  matcher: ["/login"], // empty right now (handle later)
};

export { middleware, config };
