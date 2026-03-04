"use client";

import { useState } from "react";
import { 
  Gift, Share2, Copy, Check, Users, DollarSign, 
  TrendingUp, Award, Mail, MessageCircle, Linkedin
} from "lucide-react";
import Link from "next/link";

interface Referral {
  id: string;
  name: string;
  email: string;
  status: "pending" | "signed_up" | "converted";
  date: string;
  reward: number;
}

const mockReferrals: Referral[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah@company.com", status: "converted", date: "2026-02-20", reward: 500 },
  { id: "2", name: "Mike Chen", email: "mike@startup.io", status: "signed_up", date: "2026-02-25", reward: 0 },
  { id: "3", name: "Emma Davis", email: "emma@biz.com", status: "pending", date: "2026-02-27", reward: 0 },
];

export default function ReferralProgram() {
  const [copied, setCopied] = useState(false);
  const [referralLink] = useState("https://mouse.ai/ref/KINGMOUSE2026");
  const [activeTab, setActiveTab] = useState<"overview" | "referrals">("overview");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      signed_up: "bg-blue-100 text-blue-700",
      converted: "bg-green-100 text-green-700",
    };
    const labels = {
      pending: "Pending",
      signed_up: "Signed Up",
      converted: "Converted",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const totalEarned = mockReferrals.reduce((sum, r) => sum + r.reward, 0);
  const convertedCount = mockReferrals.filter(r => r.status === "converted").length;

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-mouse-navy to-mouse-teal rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-white/70" />
            <span className="text-white/70 text-sm">Total Earned</span>
          </div>
          <span className="text-3xl font-bold">${totalEarned.toLocaleString()}</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-mouse-teal" />
            <span className="text-mouse-slate text-sm">Total Referrals</span>
          </div>
          <span className="text-3xl font-bold text-mouse-charcoal">{mockReferrals.length}</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-mouse-orange" />
            <span className="text-mouse-slate text-sm">Converted</span>
          </div>
          <span className="text-3xl font-bold text-mouse-charcoal">{convertedCount}</span>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-mouse-teal" />
          <h3 className="font-semibold text-mouse-charcoal">Your Referral Link</h3>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-mouse-charcoal"
            />
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-mouse-navy transition-colors font-medium"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-mouse-slate">Share via:</span>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-[#1877F2]/10 rounded-lg flex items-center justify-center hover:bg-[#1877F2]/20 transition-colors">
              <Mail className="w-5 h-5 text-[#1877F2]" />
            </button>
            <button className="w-10 h-10 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center hover:bg-[#0A66C2]/20 transition-colors">
              <Linkedin className="w-5 h-5 text-[#0A66C2]" />
            </button>
            <button className="w-10 h-10 bg-[#25D366]/10 rounded-lg flex items-center justify-center hover:bg-[#25D366]/20 transition-colors">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {(["overview", "referrals"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-mouse-teal text-mouse-teal"
                  : "border-transparent text-mouse-slate hover:text-mouse-charcoal"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* How it Works */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-mouse-charcoal mb-6">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-mouse-teal/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Share2 className="w-6 h-6 text-mouse-teal" />
                </div>
                <h4 className="font-medium text-mouse-charcoal mb-2">1. Share</h4>
                <p className="text-sm text-mouse-slate">
                  Share your unique referral link with friends and colleagues
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-mouse-teal/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-mouse-teal" />
                </div>
                <h4 className="font-medium text-mouse-charcoal mb-2">2. They Sign Up</h4>
                <p className="text-sm text-mouse-slate">
                  They create an account and subscribe to any paid plan
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-mouse-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-mouse-orange" />
                </div>
                <h4 className="font-medium text-mouse-charcoal mb-2">3. You Earn</h4>
                <p className="text-sm text-mouse-slate">
                  Get $500 for each successful referral
                </p>
              </div>
            </div>
          </div>

          {/* Reward Tiers */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-mouse-charcoal mb-4">Reward Tiers</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-mouse-charcoal">Standard Referral</p>
                    <p className="text-sm text-mouse-slate">Any new customer who subscribes</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">$500</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-mouse-offwhite rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-mouse-teal/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-mouse-teal" />
                  </div>
                  <div>
                    <p className="font-medium text-mouse-charcoal">Enterprise Referral</p>
                    <p className="text-sm text-mouse-slate">$10K+ annual contract</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-mouse-teal">$2,000</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Referrals Tab */}
      {activeTab === "referrals" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-mouse-charcoal">Your Referrals</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-mouse-offwhite text-left">
                  <th className="px-6 py-3 text-mouse-slate font-medium">Name</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Email</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Status</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Date</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium text-right">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockReferrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-mouse-charcoal">{referral.name}</td>
                    <td className="px-6 py-4 text-mouse-slate">{referral.email}</td>
                    <td className="px-6 py-4">{getStatusBadge(referral.status)}</td>
                    <td className="px-6 py-4 text-mouse-slate">{referral.date}</td>
                    <td className="px-6 py-4 text-right font-medium">
                      {referral.reward > 0 ? (
                        <span className="text-green-600">+${referral.reward}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mockReferrals.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-mouse-slate">No referrals yet</p>
              <p className="text-sm text-gray-400 mt-1">Share your link to start earning!</p>
            </div>
          )}
        </div>
      )}

      {/* Terms */}
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-sm text-mouse-slate">
          Rewards are paid out 30 days after the referred customer&apos;s first successful payment. 
          <Link href="#" className="text-mouse-teal hover:underline ml-1">View full terms</Link>
        </p>
      </div>
    </div>
  );
}
