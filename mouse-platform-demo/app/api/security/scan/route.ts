export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import {
  scanCommunication,
  generateAlert,
  getAutomatedResponse,
  ScanFinding,
} from "@/lib/fraud-detection";

/**
 * POST /api/security/scan
 * Scan a communication for fraudulent activity
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messageId,
      resellerId,
      customerId,
      content,
      channel = "chat",
      resellerName,
      customerName,
    } = body;

    // Validate required fields
    if (!messageId || !resellerId || !customerId || !content) {
      return NextResponse.json(
        { error: "Missing required fields: messageId, resellerId, customerId, content" },
        { status: 400 }
      );
    }

    // Perform the scan
    const scan = scanCommunication(
      messageId,
      resellerId,
      customerId,
      content,
      channel
    );

    // Generate alert if risk detected
    let alert = null;
    let automatedAction = null;

    if (scan.overallRisk !== "low" && scan.findings.length > 0) {
      alert = generateAlert(scan, resellerName || resellerId, customerName);
      
      if (alert) {
        // Determine automated response
        automatedAction = getAutomatedResponse(alert.riskLevel);
        
        // Here you would:
        // 1. Save alert to database
        // 2. Send email notification if risk is medium/high
        // 3. Execute automated actions (freeze payouts, etc.)
        
        // Simulate email notification for high risk
        if (automatedAction.notifyAdmin) {
          console.log(`[FRAUD ALERT] Email notification sent to colton.harris@automioapp.com for reseller ${resellerId}`);
        }
        
        // Simulate payout freeze for high risk
        if (automatedAction.freezePayouts) {
          console.log(`[FRAUD ALERT] Payouts frozen for reseller ${resellerId}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      scan: {
        id: scan.id,
        overallRisk: scan.overallRisk,
        findingsCount: scan.findings.length,
        scannedAt: scan.scannedAt,
      },
      alert,
      automatedAction,
      findings: scan.findings,
    });
  } catch (error) {
    console.error("Security scan error:", error);
    return NextResponse.json(
      { error: "Internal server error during security scan" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/security/scan
 * Get scan history or statistics
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resellerId = searchParams.get("resellerId");
  const customerId = searchParams.get("customerId");

  try {
    // In production, fetch from database
    // For demo, return mock statistics
    const stats = {
      totalScans: 1247,
      scansToday: 43,
      alertsGenerated: 23,
      highRiskDetections: 8,
      mediumRiskDetections: 15,
      lowRiskDetections: 1224,
    };

    return NextResponse.json({
      success: true,
      stats,
      filters: {
        resellerId,
        customerId,
      },
    });
  } catch (error) {
    console.error("Error fetching scan stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch scan statistics" },
      { status: 500 }
    );
  }
}
