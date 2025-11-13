import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS,PATCH",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Allow-Credentials": "true",
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
    if (origin) {
      headers.set("Access-Control-Allow-Origin", origin);
    } else {
      headers.set("Access-Control-Allow-Origin", "*");
    }
    // Echo requested headers for preflight robustness
    if (requestedHeaders) {
      headers.set("Access-Control-Allow-Headers", requestedHeaders);
    }
    // Helpful for reducing preflight frequency
    headers.set("Access-Control-Max-Age", "86400");

    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers,
      });
    }

    const response = NextResponse.next();
    headers.forEach((value, key) => {
      if (key === "Access-Control-Allow-Origin" && !value) return;
      response.headers.set(key, value);
    });
    if (origin) {
      response.headers.set("Vary", "Origin");
    }
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

