import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, type SessionCookie } from "@/lib/auth/types";

// Routes that require authentication
const PROTECTED_ROUTES = ["/home", "/medicine", "/memories", "/calendar", "/admin", "/photos"];
// Routes that require ADMIN role
const ADMIN_ROUTES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  // Redirect root to home
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // No cookie → redirect to login
  if (!cookieValue) {
    if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Parse session cookie
  let session: SessionCookie | null = null;
  try {
    const decoded = Buffer.from(cookieValue, "base64").toString("utf8");
    session = JSON.parse(decoded) as SessionCookie;
  } catch {
    // Invalid cookie — clear and redirect
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // ─── 10-MINUTE LOGOUT CHECK ────────────────────────────────────────────────
  if (session.expiresAt && Date.now() > session.expiresAt) {
    // Session expired — invalidate and redirect to login with query param
    const response = NextResponse.redirect(new URL("/login?expired=true", request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // ─── ADMIN ROUTE PROTECTION ────────────────────────────────────────────────
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  // All checks passed — continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
