import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { NextResponse } from "next/server";

// Create a separate NextAuth instance for middleware using only the base config
// This avoids importing Prisma which doesn't work in Edge Runtime
const { auth } = NextAuth(authConfig);

// Routes that don't require authentication
const publicRoutes = ["/login", "/register"];

// Routes that start with these prefixes are always public
const publicPrefixes = ["/api/auth"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Check if this is a public route
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isPublicPrefix = publicPrefixes.some((prefix) =>
    nextUrl.pathname.startsWith(prefix)
  );

  // Allow public routes and prefixes
  if (isPublicRoute || isPublicPrefix) {
    // If user is logged in and trying to access login/register, redirect to campaigns
    if (isLoggedIn && isPublicRoute) {
      return NextResponse.redirect(new URL("/campaigns", nextUrl));
    }
    return NextResponse.next();
  }

  // For protected routes, redirect to login if not authenticated
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    // Store the original URL so we can redirect back after login
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
