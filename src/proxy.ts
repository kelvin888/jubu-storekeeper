import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";

  if (!isLoggedIn && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(
      new URL(isSuperAdmin ? "/admin" : "/inventory", req.url)
    );
  }

  // SUPER_ADMIN blocked from terminal-staff pages
  if (
    isSuperAdmin &&
    (pathname.startsWith("/inventory") ||
      pathname.startsWith("/checkin") ||
      pathname.startsWith("/pickup"))
  ) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Non-admin blocked from /admin
  if (!isSuperAdmin && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/inventory", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
