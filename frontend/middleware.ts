import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard") || 
                           request.nextUrl.pathname.startsWith("/carbon") ||
                           request.nextUrl.pathname.startsWith("/ai-coach");
  const isProtectedApiRoute = request.nextUrl.pathname.startsWith("/api/carbon") ||
                              request.nextUrl.pathname.startsWith("/api/ai-coach");

  let payload = null;

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || "fallback_secret";
      const { payload: jwtPayload } = await jwtVerify(token, new TextEncoder().encode(secret));
      payload = jwtPayload;
    } catch (err) {
      // Token is invalid or expired
    }
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'");

  // Route protection
  if ((isProtectedRoute || isProtectedApiRoute) && !payload) {
    if (isProtectedApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (isAuthRoute && payload) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Pass payload to API routes if needed (custom header)
  if (payload && isProtectedApiRoute) {
    const newHeaders = new Headers(request.headers);
    newHeaders.set("x-user-id", payload.userId as string);
    return NextResponse.next({
      request: {
        headers: newHeaders,
      },
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
