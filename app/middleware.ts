import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to enforce HTTPS in production.
 * Redirects HTTP requests to HTTPS with a 301 permanent redirect.
 */
export function middleware(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto");

  if (
    process.env.NODE_ENV === "production" &&
    proto === "http"
  ) {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl.toString(), 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
