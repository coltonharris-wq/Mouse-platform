export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateOutreach } from "@/lib/lead-finder/templates";
import type { TemplateType, TemplateTone } from "@/lib/lead-finder/templates";

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

export async function POST(request: NextRequest) {
  try {
    const auth = await getResellerId(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { resellerId } = auth;

    const body = await request.json();
    const businessIds = body?.business_ids as string[] | undefined;
    const template = (body?.template ?? "pain_point") as TemplateType;
    const tone = (body?.tone ?? "professional") as TemplateTone;
    const vertical = (body?.vertical ?? "business") as string;

    if (!businessIds?.length) {
      return NextResponse.json(
        { error: "business_ids required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: businesses, error } = await supabase
      .from("lead_businesses")
      .select("*")
      .in("id", businessIds)
      .eq("reseller_id", resellerId);

    if (error || !businesses?.length) {
      return NextResponse.json(
        { error: "No businesses found" },
        { status: 404 }
      );
    }

    const messages = businesses.map((b) => {
      const { subject, body } = generateOutreach(
        { ...b, pain_signals: b.pain_signals ?? [], vertical },
        template,
        tone
      );
      return {
        business_id: b.id,
        business_name: b.name,
        subject,
        body,
        channel: "email",
      };
    });

    return NextResponse.json({ messages });
  } catch (error: unknown) {
    console.error("Generate outreach error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
