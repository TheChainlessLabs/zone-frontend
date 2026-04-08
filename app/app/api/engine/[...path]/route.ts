import { NextRequest, NextResponse } from "next/server";

const ENGINE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3000"
).replace(/\/+$/, "");

async function proxy(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = (await params).path.join("/");
  const url = `${ENGINE_URL}/${path}`;

  const headers: HeadersInit = {};
  const contentType = req.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;

  const res = await fetch(url, {
    method: req.method,
    headers,
    body:
      req.method !== "GET" && req.method !== "HEAD"
        ? await req.text()
        : undefined,
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
