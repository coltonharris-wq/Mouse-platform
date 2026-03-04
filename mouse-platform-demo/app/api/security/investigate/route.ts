export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { mockResellerRiskProfiles } from "@/lib/fraud-detection";

/**
 * POST /api/security/investigate
 * Investigation tools for admin to deep-dive into reseller activity
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, resellerId, customerId, startDate, endDate } = body;

    if (!action || !resellerId) {
      return NextResponse.json(
        { error: "Missing required fields: action, resellerId" },
        { status: 400 }
      );
    }

    // Get reseller profile
    const reseller = mockResellerRiskProfiles.find((r) => r.resellerId === resellerId);

    switch (action) {
      case "get_communications":
        // Simulate fetching all communications
        return NextResponse.json({
          success: true,
          data: {
            resellerId,
            communications: generateMockCommunications(resellerId, customerId),
          },
        });

      case "get_edit_history":
        // Simulate fetching edit history
        return NextResponse.json({
          success: true,
          data: {
            resellerId,
            editHistory: generateMockEditHistory(resellerId),
          },
        });

      case "get_ip_analysis":
        // Simulate IP address analysis
        return NextResponse.json({
          success: true,
          data: {
            resellerId,
            ipAnalysis: generateMockIPAnalysis(resellerId),
          },
        });

      case "export_evidence":
        // Generate evidence export
        return NextResponse.json({
          success: true,
          data: {
            resellerId,
            exportUrl: `/api/security/export/${resellerId}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        });

      case "get_timeline":
        // Generate activity timeline
        return NextResponse.json({
          success: true,
          data: {
            resellerId,
            timeline: generateMockTimeline(resellerId, startDate, endDate),
          },
        });

      default:
        return NextResponse.json(
          { error: "Unknown investigation action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Investigation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Mock data generators for investigation
function generateMockCommunications(resellerId: string, customerId?: string) {
  const communications = [
    {
      id: "comm-001",
      channel: "chat",
      customerId: "cust-789",
      customerName: "Acme Corp",
      content: "Hey, instead of paying through the platform, you can just Venmo me directly...",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      flagged: true,
      riskScore: 85,
    },
    {
      id: "comm-002",
      channel: "email",
      customerId: "cust-790",
      customerName: "TechStart Inc",
      content: "Here's the proposal we discussed. This is my personal client...",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      flagged: true,
      riskScore: 72,
    },
    {
      id: "comm-003",
      channel: "note",
      customerId: "cust-789",
      customerName: "Acme Corp",
      content: "Follow-up call scheduled for next week",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      flagged: false,
      riskScore: 5,
    },
    {
      id: "comm-004",
      channel: "chat",
      customerId: "cust-791",
      customerName: "BuildCo LLC",
      content: "Can we schedule a demo for the new features?",
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      flagged: false,
      riskScore: 0,
    },
  ];

  if (customerId) {
    return communications.filter((c) => c.customerId === customerId);
  }

  return communications;
}

function generateMockEditHistory(resellerId: string) {
  return [
    {
      id: "edit-001",
      entityType: "customer",
      entityId: "cust-789",
      field: "email",
      oldValue: "contact@acmecorp.com",
      newValue: "acme.direct@gmail.com",
      editedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      flagged: true,
    },
    {
      id: "edit-002",
      entityType: "invoice",
      entityId: "inv-123",
      field: "notes",
      oldValue: "",
      newValue: "My personal client - handle directly",
      editedAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
      flagged: true,
    },
    {
      id: "edit-003",
      entityType: "customer",
      entityId: "cust-790",
      field: "phone",
      oldValue: "",
      newValue: "555-0199",
      editedAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
      flagged: false,
    },
  ];
}

function generateMockIPAnalysis(resellerId: string) {
  return {
    resellerId,
    primaryIP: "192.168.1.100",
    uniqueIPs: 3,
    ipList: [
      { ip: "192.168.1.100", location: "Raleigh, NC", lastUsed: new Date().toISOString(), accounts: 1 },
      { ip: "10.0.0.50", location: "Raleigh, NC", lastUsed: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), accounts: 1 },
    ],
    suspiciousActivity: [
      {
        type: "multiple_accounts_same_ip",
        description: "4 customer accounts created from same IP within 24 hours",
        detectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };
}

function generateMockTimeline(resellerId: string, startDate?: string, endDate?: string) {
  const now = Date.now();
  return [
    {
      timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      type: "alert",
      description: "High-risk communication detected",
      details: "Venmo payment request flagged",
    },
    {
      timestamp: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      type: "alert",
      description: "Customer poaching attempt detected",
      details: "Reseller claimed customer as 'personal client'",
    },
    {
      timestamp: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      type: "action",
      description: "Customer email changed",
      details: "Changed from platform domain to Gmail",
    },
    {
      timestamp: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
      type: "transaction",
      description: "Invoice generated",
      details: "Invoice #1234 for $2,997",
    },
    {
      timestamp: new Date(now - 72 * 60 * 60 * 1000).toISOString(),
      type: "account",
      description: "New customer added",
      details: "Acme Corp onboarded",
    },
  ];
}
