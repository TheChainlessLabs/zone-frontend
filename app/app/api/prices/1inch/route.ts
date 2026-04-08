import { NextResponse } from "next/server";

const ONEINCH_API_URL = "https://api.1inch.dev/price/v1.1/1";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

export async function GET() {
  const apiKey = process.env.ONEINCH_API_KEY;

  // If no API key, return mock data for dev
  if (!apiKey) {
    return NextResponse.json({
      usdc_usd: 1.0,
      usdt_usd: 0.9998,
      usdt_usdc_rate: 0.9998,
      source: "mock",
      timestamp: Date.now(),
    });
  }

  try {
    const res = await fetch(`${ONEINCH_API_URL}/${USDC},${USDT}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "1inch API unavailable", status: res.status },
        { status: 502 },
      );
    }

    const prices = await res.json();
    // prices are in wei format (price relative to native token)
    const usdcPrice = Number(prices[USDC]) || 1;
    const usdtPrice = Number(prices[USDT]) || 1;
    const rate = usdtPrice / usdcPrice;

    return NextResponse.json(
      {
        usdc_usd: 1.0, // USDC is the reference
        usdt_usd: rate,
        usdt_usdc_rate: rate,
        source: "1inch",
        timestamp: Date.now(),
      },
      {
        headers: { "Cache-Control": "public, s-maxage=30" },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "1inch API unavailable" },
      { status: 502 },
    );
  }
}
