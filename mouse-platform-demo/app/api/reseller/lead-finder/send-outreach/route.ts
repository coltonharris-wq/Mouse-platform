export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getResellerId(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return { error: "Unauthorized", status: 401 as const };

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);
  if (userError || !user) return { error: "Invalid token", status: 401 as const };

  const { data: reseller } = await supabase
    .from("resellers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!reseller) return { error: "Reseller account required", status: 403 as const };
  return { resellerId: reseller.id };
}

/**
 * Record outreach message (copy/send) for tracking.
 * Does not actually send email — reseller copies or sends manually.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getResellerId(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { resellerId } = auth;

    const body = await request.json();
    const businessId = body?.business_id as string | undefined;
    const subject = body?.subject as string | undefined;
    const bodyText = body?.body as string | undefined;
    const channel = (body?.channel ?? "email") as string;
    const sentAt = body?.sent_at as string | undefined;

    if (!businessId || !subject || !bodyText) {
      return NextResponse.json(
        { error: "business_id, subject, and body required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: business } = await supabase
      .from("lead_businesses")
      .select("id")
      .eq("id", businessId)
      .eq("reseller_id", resellerId)
      .single();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const { data: msg, error } = await supabase
      .from("outreach_messages")
      .insert({
        reseller_id: resellerId,
        business_id: businessId,
        template_type: body.template_type ?? "pain_point",
        tone: body.tone ?? "professional",
        subject,
        body: bodyText,
        channel,
        sent_at: sentAt ?? new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to record outreach" },
        { status: 500 }
      );
    }

    const { data: current } = await supabase
      .from("lead_businesses")
      .select("outreach_count")
      .eq("id", businessId)
      .single();

    await supabase
      .from("lead_businesses")
      .update({
        last_outreach_at: new Date().toISOString(),
        outreach_count: (current?.outreach_count ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", businessId);

    return NextResponse.json({ message: msg });
  } catch (error: unknown) {
    console.error("Send outreach error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
