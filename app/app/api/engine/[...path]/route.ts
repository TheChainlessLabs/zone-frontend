import { NextRequest, NextResponse } from "next/server";

const ENGINE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3000"
).replace(/\/+$/, "");

/* ── Path allowlist ──────────────────────────────────────────────── */

const ALLOWED_PREFIXES = ["markets", "accounts", "orders", "tokens", "admin/accounts"];

function isAllowedPath(path: string): boolean {
  // Match either the bare allowlist entry OR any sub-path under it.
  // Using startsWith(prefix + "/") alone would 404 the bare `/accounts`
  // POST that useAccountRegistration depends on.
  return ALLOWED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/* ── In-memory rate limiting (token bucket per IP) ───────────────── */

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = { maxRequests: 60, windowMs: 60_000 }; // 60 req/min
const WRITE_RATE_LIMIT = { maxRequests: 10, windowMs: 60_000 }; // 10 writes/min
const MAX_BODY_BYTES = 10 * 1024; // 10 KB

function checkRateLimit(ip: string, isWrite: boolean): boolean {
  const limit = isWrite ? WRITE_RATE_LIMIT : RATE_LIMIT;
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + limit.windowMs });
    return true;
  }

  if (entry.count >= limit.maxRequests) return false;
  entry.count++;
  return true;
}

function getRetryAfter(ip: string): number {
  const entry = rateLimitMap.get(ip);
  if (!entry) return 0;
  return Math.max(0, Math.ceil((entry.resetAt - Date.now()) / 1000));
}

/* ── Proxy handler ───────────────────────────────────────────────── */

async function proxy(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = (await params).path.join("/");

  // Path allowlist check
  if (!isAllowedPath(path)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Resolve client IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.ip ??
    "unknown";

  // Rate limit check
  const isWrite = req.method !== "GET" && req.method !== "HEAD";
  if (!checkRateLimit(ip, isWrite)) {
    const retryAfter = getRetryAfter(ip);
    return new NextResponse(
      JSON.stringify({ error: "Too many requests" }),
      {
        status: 429,
        headers: {
          "content-type": "application/json",
          "retry-after": String(retryAfter),
        },
      }
    );
  }

  // Body size check for write requests
  let bodyText: string | undefined;
  if (isWrite) {
    bodyText = await req.text();
    if (new TextEncoder().encode(bodyText).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }
  }

  const url = `${ENGINE_URL}/${path}`;

  const headers: HeadersInit = {};
  const contentType = req.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;

  const res = await fetch(url, {
    method: req.method,
    headers,
    body: isWrite ? bodyText : undefined,
  });

  const body = res.status === 204 ? null : await res.text();

  return new NextResponse(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
