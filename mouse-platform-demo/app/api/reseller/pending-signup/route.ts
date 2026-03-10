export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Create pending reseller signup (before $97 payment).
 * Returns token to pass to signup-checkout.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      company,
      firstName,
      lastName,
      website,
      referralSource,
    } = body;

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: row, error } = await supabase
      .from("reseller_pending_signups")
      .insert({
        email: email.trim().toLowerCase(),
        company: company?.trim() || "",
        first_name: firstName?.trim() || "",
        last_name: lastName?.trim() || "",
        website: website?.trim() || "",
        referral_source: referralSource || "",
      })
      .select("token")
      .single();

    if (error) {
      console.error("Pending signup insert error:", error);
      return NextResponse.json(
        { error: "Failed to create signup session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      pendingToken: row.token,
      expiresIn: "24 hours",
    });
  } catch (error: unknown) {
    console.error("Pending signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
