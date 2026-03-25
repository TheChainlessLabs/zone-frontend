import { NextRequest, NextResponse } from "next/server";

// Approximate markup spreads for venues without public APIs
const REVOLUT_MARKUP = 0.0015; // ~0.15% for major pairs
const OFX_MARKUP = 0.005; // ~0.5% typical spread

interface WiseRateResponse {
  source: string;
  target: string;
  value: number;
  time: number;
}

export async function GET(req: NextRequest) {
  const pair = req.nextUrl.searchParams.get("pair") ?? "EUR/USD";
  const [source, target] = pair.split("/");

  if (!source || !target) {
    return NextResponse.json(
      { error: "invalid_pair", message: "Pair must be in SOURCE/TARGET format" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      `https://wise.com/rates/live?source=${encodeURIComponent(source)}&target=${encodeURIComponent(target)}`,
      { next: { revalidate: 30 } },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "upstream_unavailable", status: res.status },
        { status: 502 },
      );
    }

    const data: WiseRateResponse = await res.json();
    const wiseRate = data.value;

    return NextResponse.json(
      {
        pair,
        timestamp: data.time,
        venues: {
          wise: wiseRate,
          revolut: wiseRate * (1 + REVOLUT_MARKUP),
          ofx: wiseRate * (1 + OFX_MARKUP),
        },
      },
      {
        headers: { "Cache-Control": "public, s-maxage=30" },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "upstream_unavailable" },
      { status: 502 },
    );
  }
}
