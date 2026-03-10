export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const RESELLER_ONBOARDING_AMOUNT = 9700; // $97.00

/**
 * Create Stripe checkout for reseller onboarding.
 * Promo codes (e.g. FOUNDERS100) can be entered on the Stripe checkout page.
 */
export async function POST(request: NextRequest) {
  try {
    // Use request origin so mice.ink users return to mice.ink after Stripe
    const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/$/, '') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const APP_URL = origin.startsWith('http') ? origin : `https://${origin}`;

    const body = await request.json();
    const { pendingToken } = body;

    if (!pendingToken) {
      return NextResponse.json(
        { error: "Pending signup token required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: pending, error: pendingError } = await supabase
      .from("reseller_pending_signups")
      .select("id, email, token")
      .eq("token", pendingToken)
      .is("completed_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (pendingError || !pending) {
      return NextResponse.json(
        { error: "Invalid or expired signup session. Please start over." },
        { status: 400 }
      );
    }

    const stripe = await import("stripe").then(
      (m) => new m.default(STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" as any })
    );

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: pending.email,
      allow_promotion_codes: true,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Reseller Program — Get Started",
              description: "Join the Mouse AI Reseller Program. Includes white-label dashboard, 40% commission, and Lead Finder.",
            },
            unit_amount: RESELLER_ONBOARDING_AMOUNT,
          },
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/signup/reseller/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/signup/reseller?canceled=1`,
      metadata: {
        type: "reseller_onboarding",
        pending_token: pendingToken,
      },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: unknown) {
    console.error("Reseller signup checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
