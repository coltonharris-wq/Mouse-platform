export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;

/**
 * Complete reseller signup after $97 payment.
 * Verifies Stripe session, creates user + reseller, sends set-password email.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    const stripe = await import("stripe").then(
      (m) => new m.default(STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" })
    );

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (session.payment_status !== "paid" || session.metadata?.type !== "reseller_onboarding") {
      return NextResponse.json(
        { error: "Payment not completed or invalid session" },
        { status: 400 }
      );
    }

    const pendingToken = session.metadata?.pending_token;
    if (!pendingToken) {
      return NextResponse.json(
        { error: "Invalid session metadata" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: pending, error: pendingError } = await supabase
      .from("reseller_pending_signups")
      .select("*")
      .eq("token", pendingToken)
      .is("completed_at", null)
      .single();

    if (pendingError || !pending) {
      return NextResponse.json(
        { error: "Signup already completed or expired" },
        { status: 400 }
      );
    }

    const tempPassword = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: pending.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: pending.first_name || "",
        last_name: pending.last_name || "",
        company_name: pending.company || "",
        account_type: "reseller",
      },
    });

    if (authError) {
      console.error("Complete signup auth error:", authError);
      return NextResponse.json(
        { error: authError.message || "Account creation failed" },
        { status: 400 }
      );
    }

    const userId = authData.user?.id;

    await supabase.from("customers").insert({
      id: `cst_${userId?.substring(0, 8)}`,
      user_id: userId,
      email: pending.email,
      company_name: pending.company || "My Business",
      status: "active",
      work_hours_balance: 2,
      work_hours_purchased: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await supabase.from("resellers").insert({
      id: crypto.randomUUID(),
      user_id: userId,
      name: pending.company || "My Agency",
      company_name: pending.company || "",
      email: pending.email,
      status: "active",
    });

    await supabase
      .from("reseller_pending_signups")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", pending.id);

    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: pending.email,
    });

    const actionLink = linkData?.properties?.action_link;
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && actionLink) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || "Mouse <onboarding@automioapp.com>",
            to: pending.email,
            subject: "Set your Mouse Reseller password",
            html: `<p>Welcome to the Mouse AI Reseller Program!</p><p><a href="${actionLink}">Click here to set your password</a> and access your dashboard.</p><p>This link expires in 24 hours.</p>`,
          }),
        });
      } catch (e) {
        console.error("Failed to send set-password email:", e);
      }
    }

    // Trigger VM provisioning for the reseller (same flow as customer checkout)
    try {
      const provisionRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://mouse.is'}/api/provision/start`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: `cst_${userId?.substring(0, 8)}`,
            employeeType: 'king-mouse',
            employeeName: 'King Mouse',
            businessName: pending.company || 'My Agency',
            accountType: 'reseller',
          }),
        }
      );
      if (!provisionRes.ok) {
        console.error('Reseller VM provision trigger failed:', await provisionRes.text());
      }
    } catch (provisionErr) {
      // Non-fatal — reseller account is created, VM can be provisioned later
      console.error('Reseller VM provision error (non-fatal):', provisionErr);
    }

    return NextResponse.json({
      success: true,
      userId,
      email: pending.email,
      setPasswordLink: actionLink,
      message: "Account created. Check your email to set your password.",
    });
  } catch (error: unknown) {
    console.error("Complete signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
