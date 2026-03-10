export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  getVerticalConfigBySlugOrName,
  VERTICAL_CONFIGS,
} from "@/lib/employee-dashboard/vertical-configs";

/**
 * GET /api/onboarding/suggestions?businessType=plumber-pro&painPoints=missed_calls,ghosting
 * Suggest employee based on business type and pain points
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessType = searchParams.get("businessType") || "";
    const painPointsParam = searchParams.get("painPoints");
    const painPoints = painPointsParam
      ? painPointsParam.split(",").map((p) => p.trim())
      : [];

    const config =
      getVerticalConfigBySlugOrName(businessType) ||
      Object.values(VERTICAL_CONFIGS)[0];

    // Pain point -> capability mapping (suggest additional employees/capabilities)
    const painToCapability: Record<string, number> = {
      missed_calls: 5,
      admin_work: 6,
      ghosting: 5,
      follow_ups: 3,
      staff_drops: 2,
    };

    const suggestedSlugs = [config.slug];
    for (const p of painPoints) {
      const cap = painToCapability[p];
      if (cap) {
        // Could suggest employees strong in that capability
        const withCap = Object.values(VERTICAL_CONFIGS).find((c) =>
          c.highlightCapabilities.includes(cap)
        );
        if (withCap && !suggestedSlugs.includes(withCap.slug)) {
          suggestedSlugs.push(withCap.slug);
        }
      }
    }

    const suggested = suggestedSlugs
      .slice(0, 3)
      .map((s) => VERTICAL_CONFIGS[s as keyof typeof VERTICAL_CONFIGS])
      .filter(Boolean);

    return NextResponse.json({ primary: config, suggested });
  } catch (e: unknown) {
    console.error("Onboarding suggestions:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
