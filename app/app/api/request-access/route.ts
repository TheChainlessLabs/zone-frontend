import { NextResponse } from "next/server";

import { captureRequestAccess } from "@/lib/landing/request-access-capture";
import { requestAccessSchema } from "@/lib/landing/request-access";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid access request." },
      { status: 400 },
    );
  }

  const parsed = requestAccessSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid access request." },
      { status: 400 },
    );
  }

  try {
    await captureRequestAccess(parsed.data);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Access request capture is not configured." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
