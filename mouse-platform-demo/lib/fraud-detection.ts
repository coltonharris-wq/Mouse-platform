/**
 * Fraud Detection System for Mouse Platform
 * Monitors resellers for suspicious activity, customer poaching, and revenue diversion
 */

// High risk keywords indicating private invoice attempts
export const HIGH_RISK_KEYWORDS = [
  "pay me directly",
  "my personal invoice",
  "outside the platform",
  "avoid the fee",
  "cash deal",
  "venmo me",
  "venmo",
  "zelle",
  "zelle me",
  "skip mouse",
  "skip the platform",
  "cancel and i'll bill you",
  "cancel and ill bill you",
  "send money to my account",
  "invoice outside platform",
  "bypass the fee",
  "no platform fee",
  "cash app",
  "paypal me",
  "direct payment",
  "off the books",
  "under the table",
];

// Medium risk keywords for customer poaching signals
export const MEDIUM_RISK_KEYWORDS = [
  "contact me directly",
  "my email is",
  "call my cell",
  "call me directly",
  "personal discount",
  "my personal client",
  "my private client",
  "deal directly",
  "work directly with me",
  "reach me at",
  "text me at",
  "my number is",
  "direct line",
  "personal line",
  "outside communication",
  "bypass support",
];

// Customer poaching signal patterns
export const POACHING_PATTERNS = {
  emailDomainChange: /changed.*email.*to.*@(?!mouse\.ai|automio)/i,
  personalClientNote: /my\s+(personal|private)\s+client/i,
  contactInfoPattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phoneNumberPattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
};

// Types
export interface FraudAlert {
  id: string;
  resellerId: string;
  resellerName: string;
  customerId?: string;
  customerName?: string;
  alertType: FraudAlertType;
  riskScore: number;
  riskLevel: RiskLevel;
  evidence: string;
  detectedAt: string;
  status: AlertStatus;
  keywords?: string[];
  recommendedAction: string;
}

export type FraudAlertType =
  | "private_invoice_attempt"
  | "customer_poaching"
  | "revenue_diversion"
  | "suspicious_communication"
  | "duplicate_accounts"
  | "email_domain_change"
  | "high_cancellation_rate"
  | "platform_bypass";

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type AlertStatus = "open" | "under_review" | "resolved" | "false_positive";

export interface ResellerRiskProfile {
  resellerId: string;
  resellerName: string;
  riskScore: number;
  riskLevel: RiskLevel;
  alertCount: number;
  openAlerts: number;
  lastAlertAt?: string;
  flaggedTransactions: number;
  accountStatus: "active" | "suspended" | "banned" | "under_review";
  notes: string[];
}

export interface CommunicationScan {
  id: string;
  resellerId: string;
  customerId: string;
  messageContent: string;
  channel: "chat" | "email" | "note" | "invoice";
  scannedAt: string;
  findings: ScanFinding[];
  overallRisk: RiskLevel;
}

export interface ScanFinding {
  type: "keyword" | "pattern" | "behavior";
  severity: RiskLevel;
  description: string;
  matchedText: string;
  position: { start: number; end: number };
}

// Risk score calculation
export function calculateRiskScore(findings: ScanFinding[]): number {
  let score = 0;
  
  for (const finding of findings) {
    switch (finding.severity) {
      case "critical":
        score += 50;
        break;
      case "high":
        score += 25;
        break;
      case "medium":
        score += 10;
        break;
      case "low":
        score += 3;
        break;
    }
  }
  
  // Cap at 100
  return Math.min(score, 100);
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 71) return "high";
  if (score >= 31) return "medium";
  return "low";
}

// Keyword scanning
export function scanForKeywords(text: string): ScanFinding[] {
  const findings: ScanFinding[] = [];
  const lowerText = text.toLowerCase();
  
  // Check high risk keywords
  for (const keyword of HIGH_RISK_KEYWORDS) {
    const index = lowerText.indexOf(keyword.toLowerCase());
    if (index !== -1) {
      findings.push({
        type: "keyword",
        severity: "high",
        description: `High-risk keyword detected: "${keyword}"`,
        matchedText: text.substring(index, index + keyword.length),
        position: { start: index, end: index + keyword.length },
      });
    }
  }
  
  // Check medium risk keywords
  for (const keyword of MEDIUM_RISK_KEYWORDS) {
    const index = lowerText.indexOf(keyword.toLowerCase());
    if (index !== -1) {
      findings.push({
        type: "keyword",
        severity: "medium",
        description: `Medium-risk keyword detected: "${keyword}"`,
        matchedText: text.substring(index, index + keyword.length),
        position: { start: index, end: index + keyword.length },
      });
    }
  }
  
  return findings;
}

// Pattern-based detection
export function scanForPatterns(text: string): ScanFinding[] {
  const findings: ScanFinding[] = [];
  
  // Check for email domain changes (personal domains)
  if (POACHING_PATTERNS.emailDomainChange.test(text)) {
    findings.push({
      type: "pattern",
      severity: "high",
      description: "Email domain change to personal/external domain detected",
      matchedText: text,
      position: { start: 0, end: text.length },
    });
  }
  
  // Check for "personal client" notes
  if (POACHING_PATTERNS.personalClientNote.test(text)) {
    findings.push({
      type: "pattern",
      severity: "high",
      description: "Reseller claiming customer as 'personal client'",
      matchedText: text.match(POACHING_PATTERNS.personalClientNote)?.[0] || text,
      position: { start: 0, end: text.length },
    });
  }
  
  // Check for external contact info sharing
  const emails = text.match(POACHING_PATTERNS.contactInfoPattern);
  if (emails && emails.length > 0) {
    // Check if any emails are not platform domains
    const nonPlatformEmails = emails.filter(
      (email) => !email.includes("mouse.ai") && !email.includes("automio")
    );
    if (nonPlatformEmails.length > 0) {
      findings.push({
        type: "pattern",
        severity: "medium",
        description: `External email addresses shared: ${nonPlatformEmails.join(", ")}`,
        matchedText: nonPlatformEmails[0],
        position: { start: text.indexOf(nonPlatformEmails[0]), end: text.indexOf(nonPlatformEmails[0]) + nonPlatformEmails[0].length },
      });
    }
  }
  
  return findings;
}

// Behavior analysis
export function analyzeBehavior(
  resellerId: string,
  metrics: {
    cancellationRate: number;
    duplicateAccounts: number;
    ownershipChanges: number;
    recentInvoices: number;
  }
): ScanFinding[] {
  const findings: ScanFinding[] = [];
  
  // High cancellation rate
  if (metrics.cancellationRate > 0.3) {
    findings.push({
      type: "behavior",
      severity: metrics.cancellationRate > 0.5 ? "high" : "medium",
      description: `Abnormally high cancellation rate: ${(metrics.cancellationRate * 100).toFixed(1)}%`,
      matchedText: `${metrics.cancellationRate}`,
      position: { start: 0, end: 0 },
    });
  }
  
  // Duplicate accounts
  if (metrics.duplicateAccounts > 0) {
    findings.push({
      type: "behavior",
      severity: metrics.duplicateAccounts > 2 ? "high" : "medium",
      description: `${metrics.duplicateAccounts} duplicate account(s) detected`,
      matchedText: `${metrics.duplicateAccounts}`,
      position: { start: 0, end: 0 },
    });
  }
  
  // Frequent ownership changes
  if (metrics.ownershipChanges > 2) {
    findings.push({
      type: "behavior",
      severity: "medium",
      description: `${metrics.ownershipChanges} customer ownership changes in recent period`,
      matchedText: `${metrics.ownershipChanges}`,
      position: { start: 0, end: 0 },
    });
  }
  
  return findings;
}

// Main scanning function
export function scanCommunication(
  messageId: string,
  resellerId: string,
  customerId: string,
  content: string,
  channel: "chat" | "email" | "note" | "invoice"
): CommunicationScan {
  const keywordFindings = scanForKeywords(content);
  const patternFindings = scanForPatterns(content);
  
  const allFindings = [...keywordFindings, ...patternFindings];
  const riskScore = calculateRiskScore(allFindings);
  const overallRisk = getRiskLevel(riskScore);
  
  return {
    id: messageId,
    resellerId,
    customerId,
    messageContent: content,
    channel,
    scannedAt: new Date().toISOString(),
    findings: allFindings,
    overallRisk,
  };
}

// Generate alert from scan
export function generateAlert(
  scan: CommunicationScan,
  resellerName: string,
  customerName?: string
): FraudAlert | null {
  if (scan.overallRisk === "low" || scan.findings.length === 0) {
    return null;
  }
  
  const riskScore = calculateRiskScore(scan.findings);
  const riskLevel = getRiskLevel(riskScore);
  
  // Determine alert type
  let alertType: FraudAlertType = "suspicious_communication";
  const findingDescriptions = scan.findings.map((f) => f.description.toLowerCase()).join(" ");
  
  if (findingDescriptions.includes("invoice") || findingDescriptions.includes("payment") || findingDescriptions.includes("venmo") || findingDescriptions.includes("zelle")) {
    alertType = "private_invoice_attempt";
  } else if (findingDescriptions.includes("personal client") || findingDescriptions.includes("contact me")) {
    alertType = "customer_poaching";
  } else if (findingDescriptions.includes("cancel")) {
    alertType = "revenue_diversion";
  }
  
  // Generate recommended action
  let recommendedAction = "";
  switch (riskLevel) {
    case "high":
      recommendedAction = "Freeze reseller payouts immediately. Review all customer communications. Consider suspending account pending investigation.";
      break;
    case "medium":
      recommendedAction = "Review flagged communication. Monitor reseller activity closely. Schedule follow-up scan within 24 hours.";
      break;
    default:
      recommendedAction = "Log for pattern analysis. No immediate action required.";
  }
  
  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    resellerId: scan.resellerId,
    resellerName,
    customerId: scan.customerId,
    customerName,
    alertType,
    riskScore,
    riskLevel,
    evidence: scan.messageContent,
    detectedAt: scan.scannedAt,
    status: "open",
    keywords: scan.findings.map((f) => f.matchedText),
    recommendedAction,
  };
}

// Automated response based on risk level
export function getAutomatedResponse(riskLevel: RiskLevel): {
  action: "log" | "alert" | "freeze" | "suspend";
  notifyAdmin: boolean;
  freezePayouts: boolean;
} {
  switch (riskLevel) {
    case "high":
      return {
        action: "freeze",
        notifyAdmin: true,
        freezePayouts: true,
      };
    case "medium":
      return {
        action: "alert",
        notifyAdmin: true,
        freezePayouts: false,
      };
    default:
      return {
        action: "log",
        notifyAdmin: false,
        freezePayouts: false,
      };
  }
}

// Mock data for demo
export const mockFraudAlerts: FraudAlert[] = [
  {
    id: "alert-001",
    resellerId: "res-john-001",
    resellerName: "John Smith (AI Automation Pro)",
    customerId: "cust-789",
    customerName: "Acme Corp",
    alertType: "private_invoice_attempt",
    riskScore: 85,
    riskLevel: "high",
    evidence: "Hey, instead of paying through the platform, you can just Venmo me directly and we'll avoid the platform fee. My Venmo is @john-smith-123. This will save us both money!",
    detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: "open",
    keywords: ["venmo me directly", "avoid the platform fee"],
    recommendedAction: "Freeze reseller payouts immediately. Review all customer communications. Consider suspending account pending investigation.",
  },
  {
    id: "alert-002",
    resellerId: "res-john-001",
    resellerName: "John Smith (AI Automation Pro)",
    customerId: "cust-790",
    customerName: "TechStart Inc",
    alertType: "customer_poaching",
    riskScore: 72,
    riskLevel: "high",
    evidence: "This is my personal client. Please contact me directly at john.smith@gmail.com for any future work. We can handle this outside the platform for better rates.",
    detectedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    status: "open",
    keywords: ["my personal client", "outside the platform"],
    recommendedAction: "Freeze reseller payouts immediately. Review all customer communications. Consider suspending account pending investigation.",
  },
  {
    id: "alert-003",
    resellerId: "res-sarah-002",
    resellerName: "Sarah Johnson (Digital Solutions)",
    customerId: "cust-456",
    customerName: "BuildRight LLC",
    alertType: "suspicious_communication",
    riskScore: 45,
    riskLevel: "medium",
    evidence: "You can reach me directly at my cell 555-0123 if you have urgent questions. Also, my personal email is sarah.j@yahoo.com.",
    detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: "under_review",
    keywords: ["call my cell", "my personal email"],
    recommendedAction: "Review flagged communication. Monitor reseller activity closely. Schedule follow-up scan within 24 hours.",
  },
  {
    id: "alert-004",
    resellerId: "res-mike-003",
    resellerName: "Mike Chen (Automation Experts)",
    customerId: "cust-321",
    customerName: "GrowthCo",
    alertType: "revenue_diversion",
    riskScore: 78,
    riskLevel: "high",
    evidence: "Cancel your subscription and I'll bill you directly through my own invoice system. We can skip Mouse entirely and I'll give you a 20% discount.",
    detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    status: "open",
    keywords: ["cancel", "bill you directly", "skip Mouse"],
    recommendedAction: "Freeze reseller payouts immediately. Review all customer communications. Consider suspending account pending investigation.",
  },
  {
    id: "alert-005",
    resellerId: "res-alex-004",
    resellerName: "Alex Rivera (BizAI)",
    customerId: "cust-654",
    customerName: "Summit Services",
    alertType: "duplicate_accounts",
    riskScore: 55,
    riskLevel: "medium",
    evidence: "Multiple accounts detected from same IP address. 4 customer accounts created within 24 hours with similar contact information.",
    detectedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: "under_review",
    keywords: ["duplicate accounts"],
    recommendedAction: "Review flagged communication. Monitor reseller activity closely. Schedule follow-up scan within 24 hours.",
  },
];

export const mockResellerRiskProfiles: ResellerRiskProfile[] = [
  {
    resellerId: "res-john-001",
    resellerName: "John Smith (AI Automation Pro)",
    riskScore: 85,
    riskLevel: "high",
    alertCount: 3,
    openAlerts: 2,
    lastAlertAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    flaggedTransactions: 5,
    accountStatus: "suspended",
    notes: ["Multiple high-risk alerts for private payment requests", "Customer complaints about payment confusion"],
  },
  {
    resellerId: "res-sarah-002",
    resellerName: "Sarah Johnson (Digital Solutions)",
    riskScore: 45,
    riskLevel: "medium",
    alertCount: 1,
    openAlerts: 0,
    lastAlertAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    flaggedTransactions: 1,
    accountStatus: "active",
    notes: ["Shared personal contact info - under monitoring"],
  },
  {
    resellerId: "res-mike-003",
    resellerName: "Mike Chen (Automation Experts)",
    riskScore: 78,
    riskLevel: "high",
    alertCount: 2,
    openAlerts: 1,
    lastAlertAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    flaggedTransactions: 3,
    accountStatus: "under_review",
    notes: ["Attempted to move customer off platform"],
  },
  {
    resellerId: "res-alex-004",
    resellerName: "Alex Rivera (BizAI)",
    riskScore: 55,
    riskLevel: "medium",
    alertCount: 1,
    openAlerts: 1,
    lastAlertAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    flaggedTransactions: 2,
    accountStatus: "active",
    notes: ["Duplicate account pattern detected"],
  },
  {
    resellerId: "res-emma-005",
    resellerName: "Emma Wilson (AI Partners)",
    riskScore: 12,
    riskLevel: "low",
    alertCount: 0,
    openAlerts: 0,
    flaggedTransactions: 0,
    accountStatus: "active",
    notes: [],
  },
  {
    resellerId: "res-david-006",
    resellerName: "David Park (Tech Solutions)",
    riskScore: 8,
    riskLevel: "low",
    alertCount: 0,
    openAlerts: 0,
    flaggedTransactions: 0,
    accountStatus: "active",
    notes: [],
  },
  {
    resellerId: "res-lisa-007",
    resellerName: "Lisa Thompson (SmartBiz AI)",
    riskScore: 92,
    riskLevel: "high",
    alertCount: 5,
    openAlerts: 3,
    lastAlertAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    flaggedTransactions: 8,
    accountStatus: "banned",
    notes: ["Banned for repeated platform violations", "Multiple customers reported payment scams"],
  },
];

// Email notification template
export function generateAlertEmail(alert: FraudAlert): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `🚨 Fraud Alert: ${alert.resellerName} - Risk Score ${alert.riskScore}/100`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #DC2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .alert-box { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 15px 0; }
    .evidence { background: white; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 13px; border: 1px solid #e5e7eb; }
    .risk-high { color: #DC2626; font-weight: bold; }
    .risk-medium { color: #F97316; font-weight: bold; }
    .footer { margin-top: 20px; font-size: 12px; color: #6b7280; }
    .button { display: inline-block; background: #0B1F3B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🚨 Fraud Detection Alert</h2>
      <p>Suspicious activity detected on Mouse Platform</p>
    </div>
    
    <div class="content">
      <div class="alert-box">
        <p><strong>Reseller:</strong> ${alert.resellerName}</p>
        <p><strong>Customer:</strong> ${alert.customerName || "N/A"}</p>
        <p><strong>Alert Type:</strong> ${alert.alertType.replace(/_/g, " ").toUpperCase()}</p>
        <p><strong>Risk Score:</strong> <span class="${alert.riskLevel === "high" ? "risk-high" : "risk-medium"}">${alert.riskScore}/100 (${alert.riskLevel.toUpperCase()})</span></p>
        <p><strong>Detected:</strong> ${new Date(alert.detectedAt).toLocaleString()}</p>
      </div>
      
      <h3>Evidence</h3>
      <div class="evidence">${alert.evidence}</div>
      
      <h3>Recommended Action</h3>
      <p>${alert.recommendedAction}</p>
      
      <a href="https://mouse.ai/admin/security" class="button">View in Security Dashboard</a>
      
      <div class="footer">
        <p>This is an automated alert from Mouse Platform Fraud Detection System.</p>
        <p>Alert ID: ${alert.id}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
  
  const text = `
FRAUD DETECTION ALERT - Mouse Platform

Reseller: ${alert.resellerName}
Customer: ${alert.customerName || "N/A"}
Alert Type: ${alert.alertType.replace(/_/g, " ").toUpperCase()}
Risk Score: ${alert.riskScore}/100 (${alert.riskLevel.toUpperCase()})
Detected: ${new Date(alert.detectedAt).toLocaleString()}

EVIDENCE:
${alert.evidence}

RECOMMENDED ACTION:
${alert.recommendedAction}

View in Security Dashboard: https://mouse.ai/admin/security

Alert ID: ${alert.id}
  `;
  
  return { subject, html, text };
}

// Watermarking function for communications
export function addPlatformWatermark(content: string, platformId: string): string {
  const watermark = `[PLATFORM_ID: ${platformId} | SECURE COMMUNICATION | Mouse AI]`;
  return `${content}\n\n---\n${watermark}`;
}

// Export all for use
export const FraudDetection = {
  HIGH_RISK_KEYWORDS,
  MEDIUM_RISK_KEYWORDS,
  scanForKeywords,
  scanForPatterns,
  analyzeBehavior,
  scanCommunication,
  generateAlert,
  calculateRiskScore,
  getRiskLevel,
  getAutomatedResponse,
  generateAlertEmail,
  addPlatformWatermark,
  mockFraudAlerts,
  mockResellerRiskProfiles,
};

export default FraudDetection;
