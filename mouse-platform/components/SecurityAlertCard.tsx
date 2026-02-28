"use client";

import { FraudAlert } from "@/lib/fraud-detection";
import { Shield, AlertTriangle, AlertCircle, CheckCircle, X, Eye, Ban, User } from "lucide-react";

interface SecurityAlertCardProps {
  alert: FraudAlert;
  onView?: (alert: FraudAlert) => void;
  onResolve?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
}

export default function SecurityAlertCard({
  alert,
  onView,
  onResolve,
  onDismiss,
}: SecurityAlertCardProps) {
  const getRiskStyles = (level: string) => {
    switch (level) {
      case "high":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          icon: "text-red-600",
          badge: "bg-red-100 text-red-700",
        };
      case "medium":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          icon: "text-orange-600",
          badge: "bg-orange-100 text-orange-700",
        };
      case "low":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          icon: "text-yellow-600",
          badge: "bg-yellow-100 text-yellow-700",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          icon: "text-gray-600",
          badge: "bg-gray-100 text-gray-700",
        };
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "private_invoice_attempt":
        return <Shield className="w-5 h-5" />;
      case "customer_poaching":
        return <User className="w-5 h-5" />;
      case "revenue_diversion":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const styles = getRiskStyles(alert.riskLevel);
  const timeAgo = getTimeAgo(alert.detectedAt);

  return (
    <div className={`rounded-lg border ${styles.border} ${styles.bg} p-4`}>
      <div className="flex items-start gap-3">
        <div className={`${styles.icon} mt-0.5`}>
          {getAlertIcon(alert.alertType)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-mouse-navy">
              {alert.resellerName}
            </span>
            <span className="text-mouse-slate">→</span>
            <span className="text-mouse-charcoal">{alert.customerName || "Unknown Customer"}</span>
          </div>
          
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles.badge}`}>
              {alert.riskLevel.toUpperCase()} RISK
            </span>
            <span className="text-mouse-slate text-xs">
              Score: {alert.riskScore}/100
            </span>
            <span className="text-mouse-slate text-xs">•</span>
            <span className="text-mouse-slate text-xs">
              {getAlertTypeLabel(alert.alertType)}
            </span>
          </div>

          <div className="mt-3 bg-white rounded p-3 border border-gray-100">
            <p className="text-sm text-mouse-charcoal italic">
              "{alert.evidence.substring(0, 200)}{alert.evidence.length > 200 ? "..." : ""}"
            </p>
          </div>

          {alert.keywords && alert.keywords.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              <span className="text-xs text-mouse-slate">Keywords:</span>
              {alert.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200 text-mouse-charcoal"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 text-xs text-mouse-slate">
            Detected {timeAgo}
          </div>

          {alert.recommendedAction && (
            <div className="mt-3 p-2 bg-white/50 rounded text-sm text-mouse-charcoal">
              <span className="font-medium">Recommended: </span>
              {alert.recommendedAction}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          {onView && (
            <button
              onClick={() => onView(alert)}
              className="p-1.5 text-mouse-slate hover:text-mouse-teal hover:bg-white rounded transition-colors"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {onResolve && (
            <button
              onClick={() => onResolve(alert.id)}
              className="p-1.5 text-mouse-slate hover:text-green-600 hover:bg-white rounded transition-colors"
              title="Mark as resolved"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {onDismiss && (
            <button
              onClick={() => onDismiss(alert.id)}
              className="p-1.5 text-mouse-slate hover:text-mouse-red hover:bg-white rounded transition-colors"
              title="Dismiss as false positive"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  
  return "Just now";
}
