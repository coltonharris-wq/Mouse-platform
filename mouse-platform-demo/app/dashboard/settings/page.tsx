"use client";

import { useState } from "react";
import { Upload, Globe, Building2, CheckCircle, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("Automio");
  const [domain, setDomain] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

        {/* Stripe Connect */}
        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-mouse-slate/20">
            <h2 className="text-base font-semibold text-mouse-charcoal">
              Stripe Connect
            </h2>
            <p className="text-sm text-mouse-slate mt-0.5">
              Connect your Stripe account to receive payouts.
            </p>
          </div>
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-mouse-charcoal">
                    Stripe Account
                  </p>
                  <p className="text-xs text-mouse-slate mt-0.5">acct_1234****5678</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Connected
                </span>
              </div>
              <button className="bg-mouse-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                Complete Stripe Onboarding
              </button>
            </div>
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
