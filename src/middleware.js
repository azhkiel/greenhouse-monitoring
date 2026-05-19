import { NextResponse } from "next/server";

const SECURITY_HEADERS = {
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "0",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self';",
};

const API_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "0",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none';",
};

export function middleware(request) {
  const path = request.nextUrl.pathname;

  if (path.startsWith("/api/telegram")) {
    const response = NextResponse.next();
    for (const [key, value] of Object.entries(API_HEADERS)) {
      response.headers.set(key, value);
    }
    return response;
  }

  if (path.startsWith("/api/sensor/stream")) {
    const response = NextResponse.next();
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(key, value);
    }
    response.headers.set("Content-Type", "text/event-stream");
    response.headers.set("Cache-Control", "no-cache, no-transform");
    response.headers.set("Connection", "keep-alive");
    response.headers.set("X-Accel-Buffering", "no");
    response.headers.delete("Cross-Origin-Embedder-Policy");
    response.headers.delete("Cross-Origin-Resource-Policy");
    return response;
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  if (path.startsWith("/api/sensor")) {
    if (request.method === "POST") {
      const origin = request.headers.get("origin");
      const allowedOrigins = [
        `https://${process.env.DOMAIN}`,
        `http://${process.env.DOMAIN}`,
        "http://localhost:3000",
      ];

      if (origin && !allowedOrigins.includes(origin)) {
        return new NextResponse(null, {
          status: 403,
          statusText: "Forbidden - CORS",
        });
      }

      if (origin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type, x-api-key");
        response.headers.set("Access-Control-Max-Age", "86400");
      }
    }

    if (request.method === "OPTIONS") {
      const origin = request.headers.get("origin");
      const preflight = new NextResponse(null, { status: 204 });
      preflight.headers.set("Access-Control-Allow-Origin", origin || "*");
      preflight.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
      preflight.headers.set("Access-Control-Allow-Headers", "Content-Type, x-api-key");
      preflight.headers.set("Access-Control-Max-Age", "86400");
      return preflight;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons.svg).*)",
    "/api/sensor",
    "/api/telegram",
  ],
};