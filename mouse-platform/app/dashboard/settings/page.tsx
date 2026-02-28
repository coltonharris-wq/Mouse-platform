"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("Automio");
  const [primaryColor, setPrimaryColor] = useState("#0F6B6E");
  const [domain, setDomain] = useState("");

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
            <div>
              <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
                Logo
              </label>
              <button className="px-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal hover:bg-mouse-offwhite transition-colors">
                Upload Logo
              </button>
              <p className="text-xs text-mouse-slate mt-1.5">
                PNG or SVG, max 2MB
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border border-mouse-slate/30 flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                />
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-32 px-3 py-2 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal font-mono focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
                />
              </div>
            </div>

            <div className="pt-2">
              <button className="bg-mouse-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                Save Branding
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
      </div>
    </div>
  );
}
