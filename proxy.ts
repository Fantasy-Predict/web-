import { NextRequest, NextResponse } from "next/server";

const TOKEN_KEY = "fp_token";
const USER_TYPE_KEY = "fp_user_type";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_KEY)?.value;
  const userType = request.cookies.get(USER_TYPE_KEY)?.value;
  const isAdmin = userType === "admin";

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url);
  };

  // Admin area requires an admin session.
  if (pathname.startsWith("/admin")) {
    if (!token || !isAdmin) return redirectTo("/login");
    return NextResponse.next();
  }
  

  // User dashboard requires a session.
  if (pathname.startsWith("/dashboard")) {
    if (!token) return redirectTo("/login");
    return NextResponse.next();
  }

  // Signed-in users skip the auth screens.
  if (token && (pathname === "/login" || pathname === "/register")) {
    return redirectTo(isAdmin ? "/admin" : "/dashboard");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
