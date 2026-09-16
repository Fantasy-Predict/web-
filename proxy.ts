import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_KEY = "fp_token";
const USER_TYPE_KEY = "fp_user_type";
const LOGIN_TIME_KEY = "fp_login_time";

/** 1 hour in milliseconds. */
const MAX_TOKEN_AGE_MS = 1 * 60 * 60 * 1000;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isAuth =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify-account" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  const token = request.cookies.get(TOKEN_KEY)?.value;
  const userType = request.cookies.get(USER_TYPE_KEY)?.value;
  const loginTimeCookie = request.cookies.get(LOGIN_TIME_KEY)?.value;

  // A session is only valid if BOTH the token and its recorded login time
  // exist and the token is younger than 1 hour.
  const hasToken = Boolean(token);
  const hasLoginTime = Boolean(loginTimeCookie);
  const isExpired =
    hasToken && hasLoginTime
      ? Date.now() - Number(loginTimeCookie) > MAX_TOKEN_AGE_MS
      : false;
  const isSessionValid = hasToken && !isExpired;

  const loginUrlWith = (redirectTarget: string) => {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", redirectTarget);
    return loginUrl;
  };

  // Protected routes without any session -> login (keep the ?redirect= token).
  if ((isDashboard || isAdmin) && !hasToken) {
    return NextResponse.redirect(loginUrlWith(pathname));
  }

  // Expired token on a protected route: clear all auth cookies, THEN send to
  // /login. Without this, /login sees the still-present (expired) token and
  // bounces straight back to /dashboard -> infinite redirect loop.
  if ((isDashboard || isAdmin) && hasToken && isExpired) {
    const response = NextResponse.redirect(loginUrlWith(pathname));
    response.cookies.delete(TOKEN_KEY);
    response.cookies.delete(USER_TYPE_KEY);
    response.cookies.delete(LOGIN_TIME_KEY);
    return response;
  }

  // Admin area is only reachable by admins.
  if (isAdmin && userType !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Admins don't belong on the user dashboard.
  if (isDashboard && userType === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Auth screens: only a VALID (non-expired) session may skip them.
  if (isAuth && isSessionValid) {
    const dest = userType === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Expired token hitting an auth screen: clear the stale cookies and show the
  // page instead of redirecting — this is the other half of the loop fix.
  if (isAuth && hasToken && isExpired) {
    const response = NextResponse.next();
    response.cookies.delete(TOKEN_KEY);
    response.cookies.delete(USER_TYPE_KEY);
    response.cookies.delete(LOGIN_TIME_KEY);
    return response;
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
