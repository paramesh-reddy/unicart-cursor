import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS,PATCH",
  "Access-Control-Allow-Headers": "*",
};

// Protected routes that require authentication
const protectedRoutes = ["/account", "/checkout", "/wishlist"];

// Auth routes that should redirect to home if already authenticated
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin") || "";
  const requestedHeaders = request.headers.get("access-control-request-headers") || "";

  if (pathname.startsWith("/api/")) {
    const headers = new Headers(corsHeaders);
    // Reflect origin to support credentials and broad allow
    headers.set("Access-Control-Allow-Origin", origin || "*");
    headers.set("Vary", "Origin");
    headers.set("Access-Control-Allow-Credentials", "true");
    // Helpful for reducing preflight frequency
    headers.set("Access-Control-Max-Age", "86400");
    if (requestedHeaders) {
      headers.set("Access-Control-Allow-Headers", requestedHeaders);
    }

    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers,
      });
    }

    const response = NextResponse.next();
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Check if accessing protected routes (TODO: implement auth guard)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
],
};