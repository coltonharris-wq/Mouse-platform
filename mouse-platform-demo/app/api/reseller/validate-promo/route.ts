export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

/**
 * Validate reseller signup promo code.
 * Promo codes from RESELLER_PROMO_CODES env (comma-separated, case-insensitive).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = (body?.promoCode ?? body?.code ?? "").trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ valid: false, error: "Promo code required" }, { status: 400 });
    }

    const allowed = (process.env.RESELLER_PROMO_CODES ?? "")
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    const valid = allowed.includes(code);

    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
