import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let NextAuth handle all auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth", "/browse", "/join"];
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get the user's session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Protected routes - require authentication
  const protectedRoutes = ["/client", "/talent", "/agency", "/dashboard", "/profile-setup", "/onboarding"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    // Redirect to auth page if not authenticated
    const url = new URL("/auth", request.url);
    return NextResponse.redirect(url);
  }

  // Role-based route protection
  if (token) {
    // Get user role from token (set during session callback)
    const userRole = token.role as string | null;

    // Protect client routes
    if (pathname.startsWith("/client") && userRole !== "client") {
      const url = new URL(
        userRole === "talent" ? "/talent" : userRole === "agency" ? "/agency" : "/dashboard",
        request.url
      );
      return NextResponse.redirect(url);
    }

    // Protect talent routes
    if (pathname.startsWith("/talent") && userRole !== "talent") {
      const url = new URL(
        userRole === "client" ? "/client/dashboard" : userRole === "agency" ? "/agency" : "/dashboard",
        request.url
      );
      return NextResponse.redirect(url);
    }

    // Protect agency routes
    if (pathname.startsWith("/agency") && userRole !== "agency") {
      const url = new URL(
        userRole === "client" ? "/client/dashboard" : userRole === "talent" ? "/talent" : "/dashboard",
        request.url
      );
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
