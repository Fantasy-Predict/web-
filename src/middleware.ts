import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_KEY = "fp_token";
const USER_TYPE_KEY = "fp_user_type";
const LOGIN_TIME_KEY = "fp_login_time";

/** 1 hour in milliseconds. */
const MAX_TOKEN_AGE_MS = 1 * 60 * 60 * 1000;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isAuth = pathname === "/login" || pathname === "/register" || pathname === "/verify-account" || pathname === "/forgot-password" || pathname === "/reset-password";

  const token = request.cookies.get(TOKEN_KEY)?.value;
  const userType = request.cookies.get(USER_TYPE_KEY)?.value;
  const loginTimeCookie = request.cookies.get(LOGIN_TIME_KEY)?.value;

  if ((isDashboard || isAdmin) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Reject tokens older than 1 hour (cookie-based age check).
  if ((isDashboard || isAdmin) && token && loginTimeCookie) {
    const age = Date.now() - Number(loginTimeCookie);
    if (age > MAX_TOKEN_AGE_MS) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAdmin && userType !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDashboard && userType === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isAuth && token) {
    const dest = userType === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/verify-account",
    "/forgot-password",
    "/reset-password",
  ],
};
