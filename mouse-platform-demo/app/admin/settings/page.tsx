"use client";

import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/lib/admin-auth";
import {
  Settings,
  Mail,
  Bell,
  Link,
  Shield,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Globe,
  CreditCard,
  Users,
  FileText,
  LogOut,
} from "lucide-react";

type SettingsTab = "platform" | "email" | "integrations" | "notifications";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("platform");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Platform Configuration State
  const [platformConfig, setPlatformConfig] = useState({
    platformName: "Mouse",
    supportEmail: "support@mouseplatform.com",
    defaultTimezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    maintenanceMode: false,
    allowSignups: true,
    requireEmailVerification: true,
  });

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.sendgrid.net",
    smtpPort: "587",
    smtpUser: "apikey",
    senderName: "Mouse Platform",
    senderEmail: "noreply@mouseplatform.com",
    enableEmailNotifications: true,
    welcomeEmail: true,
    paymentReceipts: true,
    securityAlerts: true,
  });

  // Integration Settings State
  const [integrationSettings, setIntegrationSettings] = useState({
    stripeConnected: true,
    stripeAccountId: "acct_1234****5678",
    stripeWebhookUrl: "https://api.mouseplatform.com/webhooks/stripe",
    openaiApiKey: "sk-****abcd1234",
    slackWebhook: "",
    zapierEnabled: false,
  });

  // Notification Preferences State
  const [notificationSettings, setNotificationSettings] = useState({
    adminEmail: "admin@mouseplatform.com",
    newResellerAlert: true,
    highRiskAlert: true,
    paymentFailure: true,
    systemErrors: true,
    dailyDigest: false,
    weeklyReport: true,
    fraudDetection: true,
  });

  // Load settings from Supabase on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings", { headers: getAuthHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        const s = data.settings || {};
        if (s.platform) setPlatformConfig((prev) => ({ ...prev, ...s.platform }));
        if (s.email) setEmailSettings((prev) => ({ ...prev, ...s.email }));
        if (s.integrations) setIntegrationSettings((prev) => ({ ...prev, ...s.integrations }));
        if (s.notifications) setNotificationSettings((prev) => ({ ...prev, ...s.notifications }));
      } catch {
        // Silent fail — use defaults
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          settings: {
            platform: platformConfig,
            email: emailSettings,
            integrations: integrationSettings,
            notifications: notificationSettings,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      alert("Failed to save settings: " + err.message);
    }
    setIsSaving(false);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mouse_session");
      localStorage.removeItem("mouse_token");
      window.location.href = "/login";
    }
  };

  const TabButton = ({
    tab,
    icon: Icon,
    label,
  }: {
    tab: SettingsTab;
    icon: React.ElementType;
    label: string;
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        activeTab === tab
          ? "bg-mouse-teal/10 text-mouse-teal"
          : "text-mouse-slate hover:bg-gray-50 hover:text-mouse-charcoal"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-mouse-navy">Settings</h1>
          <p className="text-sm text-mouse-slate mt-1">
            Configure platform settings and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle size={18} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-2 space-y-1">
            <TabButton tab="platform" icon={Settings} label="Platform" />
            <TabButton tab="email" icon={Mail} label="Email" />
            <TabButton tab="integrations" icon={Link} label="Integrations" />
            <TabButton tab="notifications" icon={Bell} label="Notifications" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Platform Configuration */}
          {activeTab === "platform" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-mouse-slate/20">
                  <h2 className="text-base font-semibold text-mouse-charcoal flex items-center gap-2">
                    <Globe size={18} className="text-mouse-teal" />
                    General Configuration
                  </h2>
                </div>
                <div className="px-6 py-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
                        Platform Name
                      </label>
                      <input
                        type="text"
                        value={platformConfig.platformName}
                        onChange={(e) =>
                          setPlatformConfig({
                            ...platformConfig,
                            platformName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
                        Support Email
                      </label>
                      <input
                        type="email"
                        value={platformConfig.supportEmail}
                        onChange={(e) =>
                          setPlatformConfig({
                            ...platformConfig,
                            supportEmail: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
                        Default Timezone
                      </label>
                      <select
                        value={platformConfig.defaultTimezone}
                        onChange={(e) =>
                          setPlatformConfig({
                            ...platformConfig,
                            defaultTimezone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
                        Date Format
                      </label>
                      <select
                        value={platformConfig.dateFormat}
                        onChange={(e) =>
                          setPlatformConfig({
                            ...platformConfig,
                            dateFormat: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-mouse-slate/20">
                  <h2 className="text-base font-semibold text-mouse-charcoal flex items-center gap-2">
                    <Shield size={18} className="text-mouse-teal" />
                    Access Control
                  </h2>
                </div>
                <div className="px-6 py-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-mouse-charcoal">Maintenance Mode</p>
                      <p className="text-sm text-mouse-slate">Temporarily disable access for all users except admins</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={platformConfig.maintenanceMode}
                        onChange={(e) =>
                          setPlatformConfig({
                            ...platformConfig,
                            maintenanceMode: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mouse-teal/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mouse-teal"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-mouse-charcoal">Allow New Signups</p>
                      <p className="text-sm text-mouse-slate">Enable or disable new reseller registrations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={platformConfig.allowSignups}
                        onChange={(e) =>
                          setPlatformConfig({
                            ...platformConfig,
                            allowSignups: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mouse-teal/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mouse-teal"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-mouse-charcoal">Require Email Verification</p>
                      <p className="text-sm text-mouse-slate">New accounts must verify email before accessing platform</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={platformConfig.requireEmailVerification}
                        onChange={(e) =>
                          setPlatformConfig({
                            ...platformConfig,
                            requireEmailVerification: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mouse-teal/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mouse-teal"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === "email" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-mouse-slate/20">
                  <h2 className="text-base font-semibold text-mouse-charcoal flex items-center gap-2">
                    <Mail size={18} className="text-mouse-teal" />
                    SMTP Configuration
                  </h2>
                </div>
                <div className="px-6 py-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">SMTP Host</label>
                      <input
                        type="text"
                        value={emailSettings.smtpHost}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, smtpHost: e.target.value })
                        }
                        className="w-full px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">SMTP Port</label>
                      <input
                        type="text"
                        value={emailSettings.smtpPort}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, smtpPort: e.target.value })
                        }
                        className="w-full px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">SMTP Username</label>
                      <input
                        type="text"
                        value={emailSettings.smtpUser}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, smtpUser: e.target.value })
                        }
                        className="w-full px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">SMTP Password</label>
                      <input
                        type="password"
                        value="••••••••••••"
                        disabled
                        className="w-full px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-slate bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">Sender Name</label>
                      <input
                        type="text"
                        value={emailSettings.senderName}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, senderName: e.target.value })
                        }
                        className="w-full px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">Sender Email</label>
                      <input
                        type="email"
                        value={emailSettings.senderEmail}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, senderEmail: e.target.value })
                        }
                        className="w-full px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integration Settings */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-mouse-slate/20">
                  <h2 className="text-base font-semibold text-mouse-charcoal flex items-center gap-2">
                    <CreditCard size={18} className="text-mouse-teal" />
                    Stripe Connect
                  </h2>
                </div>
                <div className="px-6 py-6 space-y-5">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <CreditCard size={20} className="text-mouse-teal" />
                      </div>
                      <div>
                        <p className="font-medium text-mouse-charcoal">Stripe Account</p>
                        <p className="text-sm text-mouse-slate">{integrationSettings.stripeAccountId}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle size={12} />
                      Connected
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">Webhook URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={integrationSettings.stripeWebhookUrl}
                        readOnly
                        className="flex-1 px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-slate bg-gray-50"
                      />
                      <button className="px-4 py-2.5 text-sm font-medium text-mouse-charcoal border border-mouse-slate/30 rounded-lg hover:bg-gray-50 transition-colors">
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-mouse-slate/20">
                  <h2 className="text-base font-semibold text-mouse-charcoal flex items-center gap-2">
                    <FileText size={18} className="text-mouse-teal" />
                    OpenAI API
                  </h2>
                </div>
                <div className="px-6 py-6">
                  <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">API Key</label>
                  <input
                    type="password"
                    value={integrationSettings.openaiApiKey}
                    onChange={(e) =>
                      setIntegrationSettings({ ...integrationSettings, openaiApiKey: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notification Preferences */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-mouse-slate/20">
                  <h2 className="text-base font-semibold text-mouse-charcoal flex items-center gap-2">
                    <Bell size={18} className="text-mouse-teal" />
                    Admin Notifications
                  </h2>
                </div>
                <div className="px-6 py-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">Admin Email Address</label>
                    <input
                      type="email"
                      value={notificationSettings.adminEmail}
                      onChange={(e) =>
                        setNotificationSettings({ ...notificationSettings, adminEmail: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
                    />
                  </div>

                  <div className="border-t border-mouse-slate/20 pt-5 space-y-4">
                    {[
                      { key: "newResellerAlert", label: "New Reseller Alerts", desc: "Notify when a new reseller signs up" },
                      { key: "highRiskAlert", label: "High Risk Alerts", desc: "Notify for high-risk fraud detection events", alert: true },
                      { key: "paymentFailure", label: "Payment Failures", desc: "Notify when customer payments fail" },
                      { key: "systemErrors", label: "System Errors", desc: "Notify for critical system errors" },
                      { key: "dailyDigest", label: "Daily Digest", desc: "Receive daily summary of platform activity" },
                      { key: "weeklyReport", label: "Weekly Report", desc: "Receive weekly analytics report" },
                    ].map((item: any) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-mouse-charcoal flex items-center gap-2">
                            {item.label}
                            {item.alert && <AlertTriangle size={14} className="text-red-500" />}
                          </p>
                          <p className="text-sm text-mouse-slate">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(notificationSettings as any)[item.key]}
                            onChange={(e) =>
                              setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked } as any)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mouse-teal/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mouse-teal"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-mouse-charcoal">Sign Out</h3>
              <p className="text-sm text-mouse-slate mt-0.5">Log out of your account on this device</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
