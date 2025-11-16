import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = ["http://localhost:3000", "capacitor://localhost", "http://localhost","https://unicart-frontned1.vercel.app"];

// Protected routes that require authentication
const protectedRoutes = ["/account", "/checkout", "/wishlist"];

// Auth routes that should redirect to home if already authenticated
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // No Next.js API routes used; API traffic goes to Node backend directly.

  // Check if accessing protected routes (TODO: implement auth guard)
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
],
};