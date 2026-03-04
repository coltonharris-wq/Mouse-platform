export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import {
  FraudAlert,
  ResellerRiskProfile,
  mockFraudAlerts,
  mockResellerRiskProfiles,
  generateAlertEmail,
} from "@/lib/fraud-detection";

/**
 * GET /api/security/alerts
 * Get all fraud alerts with optional filtering
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Filter parameters
  const status = searchParams.get("status");
  const riskLevel = searchParams.get("riskLevel");
  const resellerId = searchParams.get("resellerId");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    // In production, fetch from Supabase/database
    // For demo, use mock data with filtering
    let alerts = [...mockFraudAlerts];

    // Apply filters
    if (status) {
      alerts = alerts.filter((a) => a.status === status);
    }
    if (riskLevel) {
      alerts = alerts.filter((a) => a.riskLevel === riskLevel);
    }
    if (resellerId) {
      alerts = alerts.filter((a) => a.resellerId === resellerId);
    }

    // Sort by detected date (newest first)
    alerts.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());

    // Paginate
    const total = alerts.length;
    const paginatedAlerts = alerts.slice(offset, offset + limit);

    // Get reseller risk profiles
    let profiles = [...mockResellerRiskProfiles];
    if (resellerId) {
      profiles = profiles.filter((p) => p.resellerId === resellerId);
    }

    // Calculate summary statistics
    const summary = {
      totalAlerts: mockFraudAlerts.length,
      openAlerts: mockFraudAlerts.filter((a) => a.status === "open").length,
      highRiskAlerts: mockFraudAlerts.filter((a) => a.riskLevel === "high").length,
      suspendedAccounts: mockResellerRiskProfiles.filter(
        (p) => p.accountStatus === "suspended" || p.accountStatus === "banned"
      ).length,
      avgRiskScore: Math.round(
        mockResellerRiskProfiles.reduce((sum, p) => sum + p.riskScore, 0) /
          mockResellerRiskProfiles.length
      ),
    };

    return NextResponse.json({
      success: true,
      data: {
        alerts: paginatedAlerts,
        profiles,
        summary,
      },
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/security/alerts
 * Create a new alert (usually called internally by scan API)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const alert: Partial<FraudAlert> = body;

    // Validate required fields
    if (!alert.resellerId || !alert.alertType || !alert.evidence) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // In production, save to database
    const newAlert: FraudAlert = {
      id: `alert-${Date.now()}`,
      resellerId: alert.resellerId,
      resellerName: alert.resellerName || "Unknown",
      customerId: alert.customerId,
      customerName: alert.customerName,
      alertType: alert.alertType,
      riskScore: alert.riskScore || 50,
      riskLevel: alert.riskLevel || "medium",
      evidence: alert.evidence,
      detectedAt: new Date().toISOString(),
      status: "open",
      keywords: alert.keywords || [],
      recommendedAction: alert.recommendedAction || "Review and investigate",
    };

    // Send email notification for medium/high risk
    if (newAlert.riskLevel === "medium" || newAlert.riskLevel === "high") {
      const email = generateAlertEmail(newAlert);
      console.log(`[EMAIL SENT] To: colton.harris@automioapp.com | Subject: ${email.subject}`);
    }

    return NextResponse.json({
      success: true,
      alert: newAlert,
    });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/security/alerts/:id
 * Update alert status (resolve, mark as false positive, etc.)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, status, notes } = body;

    if (!alertId || !status) {
      return NextResponse.json(
        { error: "Missing alertId or status" },
        { status: 400 }
      );
    }

    // In production, update in database
    console.log(`[ALERT UPDATED] ${alertId} -> ${status}${notes ? ` | Notes: ${notes}` : ""}`);

    return NextResponse.json({
      success: true,
      message: `Alert ${alertId} updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    );
  }
}
