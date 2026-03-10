"use client";

import { useState, useEffect } from "react";
import { Upload, Globe, Building2, CheckCircle, Loader2, Link2, Copy } from "lucide-react";
import { getAuthHeaders } from "@/lib/admin-auth";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("Automio");
  const [domain, setDomain] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string>("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [stripeConnected, setStripeConnected] = useState<boolean | null>(null);
  const [stripeStatus, setStripeStatus] = useState<string>("");
  const [stripeAccountId, setStripeAccountId] = useState<string>("");
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeLinking, setStripeLinking] = useState(false);
  const [stripeSuccessMessage, setStripeSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchWithAuth("/api/reseller/invite-link")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setInviteUrl(data.inviteUrl);
          setInviteCode(data.inviteCode);
          setInviteMessage(data.message || "");
          if (data.companyName) setCompanyName(data.companyName);
        }
      })
      .catch(() => {});
  }, []);

  const refetchStripeStatus = () => {
    const session = typeof window !== "undefined" ? localStorage.getItem("mouse_session") : null;
    if (!session) return;
    try {
      const parsed = JSON.parse(session);
      const resellerId = parsed.resellerId;
      if (!resellerId) return;
      setStripeLoading(true);
      fetchWithAuth(`/api/reseller/stripe/connect?resellerId=${resellerId}`)
        .then((r) => r.json())
        .then((data) => {
          setStripeConnected(data.connected ?? false);
          setStripeStatus(data.status || "not_started");
          setStripeAccountId(data.accountId ? `${data.accountId.slice(0, 12)}****${data.accountId.slice(-4)}` : "");
        })
        .catch(() => setStripeConnected(false))
        .finally(() => setStripeLoading(false));
    } catch {
      setStripeLoading(false);
    }
  };

  useEffect(() => {
    const session = typeof window !== "undefined" ? localStorage.getItem("mouse_session") : null;
    if (!session) return;
    try {
      const parsed = JSON.parse(session);
      const resellerId = parsed.resellerId;
      if (!resellerId) return;
      setStripeLoading(true);
      fetchWithAuth(`/api/reseller/stripe/connect?resellerId=${resellerId}`)
        .then((r) => r.json())
        .then((data) => {
          setStripeConnected(data.connected ?? false);
          setStripeStatus(data.status || "not_started");
          setStripeAccountId(data.accountId ? `${data.accountId.slice(0, 12)}****${data.accountId.slice(-4)}` : "");
        })
        .catch(() => setStripeConnected(false))
        .finally(() => setStripeLoading(false));
    } catch {
      setStripeLoading(false);
    }
  }, []);

  // Handle return from Stripe OAuth (success or refresh)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const stripeParam = params.get("stripe");
    if (stripeParam === "success" || stripeParam === "refresh") {
      params.delete("stripe");
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : "");
      window.history.replaceState({}, "", newUrl);
      refetchStripeStatus();
      if (stripeParam === "success") {
        setStripeSuccessMessage("Stripe connected! Your bank account is linked and you're ready to receive payouts.");
        setTimeout(() => setStripeSuccessMessage(null), 5000);
      }
    }
  }, []);

  const handleStripeConnect = async () => {
    const session = typeof window !== "undefined" ? localStorage.getItem("mouse_session") : null;
    if (!session) return;
    try {
      const parsed = JSON.parse(session);
      const resellerId = parsed.resellerId;
      const email = parsed.email;
      if (!resellerId || !email) {
        alert("Session missing reseller or email");
        return;
      }
      setStripeLinking(true);
      const res = await fetchWithAuth("/api/reseller/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resellerId, email, businessName: companyName }),
      });
      const data = await res.json();
      if (data.success && data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      } else if (data.alreadyConnected) {
        setStripeConnected(true);
        setStripeStatus("active");
      } else {
        alert(data.error || "Failed to start Stripe Connect");
      }
    } catch (err) {
      alert("Failed to connect Stripe");
    } finally {
      setStripeLinking(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to storage service
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-mouse-navy mb-6">Settings</h1>

      <div className="space-y-6 max-w-2xl">
        {/* Branding */}
        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-mouse-slate/20">
            <h2 className="text-base font-semibold text-mouse-charcoal">Branding</h2>
            <p className="text-sm text-mouse-slate mt-0.5">
              Customize how your platform appears to customers.
            </p>
          </div>
          <div className="px-6 py-6 space-y-5">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
                <Building2 className="w-4 h-4 inline mr-1" />
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
              />
              <p className="text-xs text-mouse-slate mt-1">
                This will appear in the header and emails to your customers.
              </p>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
                <Upload className="w-4 h-4 inline mr-1" />
                Logo
              </label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <div className="w-16 h-16 rounded-lg border border-mouse-slate/20 overflow-hidden bg-white">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <label className="inline-flex items-center px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal hover:bg-mouse-offwhite transition-colors cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                    <input
                      type="file"
                      accept="image/png,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-mouse-slate mt-1.5">
                    PNG or SVG, max 2MB. Recommended: 200x50px
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                onClick={handleSaveBranding}
                disabled={isSaving}
                className="bg-mouse-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  "Save Branding"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Your Invite Link */}
        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-mouse-slate/20">
            <h2 className="text-base font-semibold text-mouse-charcoal">
              <Link2 className="w-4 h-4 inline mr-1" />
              Your Invite Link
            </h2>
            <p className="text-sm text-mouse-slate mt-0.5">
              Share this link with customers to sign up under your reseller account.
            </p>
          </div>
          <div className="px-6 py-6">
            {inviteUrl ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={inviteUrl}
                    className="flex-1 px-3 py-2 text-sm border border-mouse-slate/30 rounded-lg bg-mouse-offwhite text-mouse-charcoal"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteUrl);
                      setInviteCopied(true);
                      setTimeout(() => setInviteCopied(false), 2000);
                    }}
                    className="px-4 py-2 bg-mouse-teal text-white rounded-lg text-sm font-medium hover:bg-mouse-teal/90 flex items-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" />
                    {inviteCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
                {inviteCode && (
                  <p className="text-xs text-mouse-slate">Invite code: {inviteCode}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-mouse-slate">
                {inviteMessage || "Ask an admin to generate an invite code for you."}
              </p>
            )}
          </div>
        </div>

        {/* Stripe Connect */}
        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-mouse-slate/20">
            <h2 className="text-base font-semibold text-mouse-charcoal">
              Stripe Connect
            </h2>
            <p className="text-sm text-mouse-slate mt-0.5">
              Connect your Stripe account to receive payouts. OAuth flow and bank account linking are handled by Stripe.
            </p>
          </div>
          <div className="px-6 py-6">
            {stripeSuccessMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                {stripeSuccessMessage}
              </div>
            )}
            {stripeLoading ? (
              <div className="flex items-center gap-2 text-mouse-slate">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Checking status...</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-mouse-charcoal">
                      Stripe Account
                    </p>
                    <p className="text-xs text-mouse-slate mt-0.5">
                      {stripeAccountId || "Not connected"}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    stripeConnected ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      stripeConnected ? "bg-green-500" : "bg-yellow-500"
                    }`} />
                    {stripeConnected ? "Connected" : stripeStatus === "pending" ? "Pending" : "Not connected"}
                  </span>
                </div>
                <button
                  onClick={handleStripeConnect}
                  disabled={stripeLinking || stripeConnected}
                  className="bg-mouse-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {stripeLinking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {stripeConnected ? "Connected" : stripeStatus === "pending" ? "Complete Onboarding" : "Connect Stripe"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Domain */}
        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-mouse-slate/20">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-mouse-charcoal">
                <Globe className="w-4 h-4 inline mr-1" />
                Custom Domain
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-mouse-slate mt-0.5">
              Use a custom domain for your customer portal.
            </p>
          </div>
          <div className="px-6 py-6">
            <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
              Domain
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="portal.yourcompany.com"
              disabled
              className="w-full px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-slate bg-mouse-offwhite cursor-not-allowed"
            />
            <p className="text-xs text-mouse-slate mt-1.5">
              Custom domains are not yet available. Check back soon.
            </p>
          </div>
        </div>

        {/* Note about Mouse Branding */}
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <p className="text-sm text-blue-700">
            <strong>Mouse Branding:</strong> Your reseller portal uses consistent Mouse platform colors to maintain a cohesive experience. You can customize your company name, logo, and domain (when available) to match your brand.
          </p>
        </div>
      </div>
    </div>
  );
}
