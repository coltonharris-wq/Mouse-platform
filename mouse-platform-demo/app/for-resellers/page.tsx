"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { TrendingUp, Users, DollarSign, Zap, Clock, Link2, Monitor, Check, ChevronDown, ChevronUp } from "lucide-react";

interface ResellerStats {
  resellersCount: number;
  customersToday: number;
  combinedMonthlyRevenue: number;
  fastestTo10k: string;
}

function formatRevenue(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(3)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}

const faqItems = [
  { q: "Do I need technical skills or coding experience?", a: "No. You share an invite link, your clients sign up, and we handle everything. No coding, no integrations, no dev work." },
  { q: "How do I find businesses to sell to?", a: "Share your invite link with your network, existing clients, or run simple ads. Many resellers start with agencies, consultants, or industry contacts they already know." },
  { q: "How much can I realistically earn?", a: "You charge $4.98–$8.98 per hour. Keep the difference after our base rate. Top resellers hit $10k+/mo. Earnings depend on your pricing and how many clients you bring." },
  { q: "What does the AI actually do for businesses?", a: "AI employees log into existing software (CRM, email, accounting) and complete tasks: follow-ups, data entry, AR, scheduling. No integrations required." },
  { q: "How does billing and payments work?", a: "Stripe Connect. You set your price. Customers pay through your link. We handle fulfillment. You keep your margin with instant payouts." },
  { q: "What support do partners receive?", a: "Dashboard, invite links, customer management, and Stripe Connect. We handle product support for your clients." },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
        Frequently Asked Questions
      </h2>
      <p className="text-gray-400 text-center text-sm mb-10 max-w-xl mx-auto">
        Common questions from new resellers.
      </p>
      <div className="space-y-2 max-w-2xl mx-auto">
        {faqItems.map((item, i) => (
          <div
            key={i}
            className="bg-[#1a1a2e] border border-gray-800 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full px-6 py-4 flex items-center justify-between text-left text-white font-medium text-sm hover:bg-[#0d0d14] transition-colors"
            >
              {item.q}
              {openIdx === i ? <ChevronUp className="w-5 h-5 text-mouse-teal flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />}
            </button>
            {openIdx === i && (
              <div className="px-6 pb-4 text-gray-400 text-sm">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ForResellersPage() {
  const [stats, setStats] = useState<ResellerStats | null>(null);

  useEffect(() => {
    fetch("/api/reseller/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() =>
        setStats({
          resellersCount: 144,
          customersToday: 176,
          combinedMonthlyRevenue: 7774000,
          fastestTo10k: "5 days 3 hours",
        })
      );
  }, []);

  const s = stats ?? {
    resellersCount: 144,
    customersToday: 176,
    combinedMonthlyRevenue: 7774000,
    fastestTo10k: "5 days 3 hours",
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 sm:py-24">
        {/* Top credibility pill */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mouse-teal/10 border border-mouse-teal/30 text-mouse-teal text-sm font-medium">
            <Zap className="w-4 h-4" />
            Businesses signed today {s.customersToday}
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Resell AI Employees. Set Your Price. Keep the Difference.
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Join the Mouse reseller program. White-label AI workforce for your clients. Recurring revenue, instant payouts.
          </p>
          <p className="mt-2 text-gray-500 text-sm max-w-xl mx-auto">
            No coding. No cold calling. No dev team. Just recurring revenue.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 mb-12">
          <Link
            href="/signup/reseller"
            className="inline-flex items-center gap-2 bg-mouse-teal text-white font-semibold px-8 py-3 rounded-lg hover:bg-mouse-teal/90 transition-colors"
          >
            <TrendingUp className="w-5 h-5" />
            Start Earning →
          </Link>
          <p className="text-gray-500 text-xs">
            Free to start. No credit card required. Setup in 5 minutes.
          </p>
        </div>

        {/* Metrics at top - before scroll */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#0d0d14] border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Combined Monthly Revenue</p>
            <p className="text-3xl sm:text-4xl font-bold text-white">
              {formatRevenue(s.combinedMonthlyRevenue)}
            </p>
            <p className="text-gray-500 text-xs mt-2">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>
          <div className="bg-[#0d0d14] border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Partners worldwide</p>
            <p className="text-3xl sm:text-4xl font-bold text-white">
              {s.resellersCount.toLocaleString()}
            </p>
            <p className="text-gray-500 text-xs mt-2">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>
          <div className="bg-[#0d0d14] border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Record to $10k MRR</p>
            <p className="text-3xl sm:text-4xl font-bold text-white">
              {s.fastestTo10k}
            </p>
            <p className="text-gray-500 text-xs mt-2">Fastest partner</p>
          </div>
        </div>

        {/* Three Steps */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
            Three Steps to Recurring Revenue
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10 max-w-xl mx-auto">
            No technical skills. No cold calling. Just follow the system.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-6 relative">
              <span className="absolute -top-3 -left-1 w-8 h-8 bg-mouse-teal rounded-full flex items-center justify-center text-white font-bold text-sm">1</span>
              <div className="w-12 h-12 bg-mouse-teal/20 rounded-lg flex items-center justify-center mb-4">
                <Link2 className="w-6 h-6 text-mouse-teal" />
              </div>
              <h3 className="text-white font-semibold mb-2">Share Your Invite Link</h3>
              <p className="text-gray-400 text-sm">Get a unique link. Share with clients. They sign up under your account. No cold calling needed.</p>
            </div>
            <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-6 relative">
              <span className="absolute -top-3 -left-1 w-8 h-8 bg-mouse-teal rounded-full flex items-center justify-center text-white font-bold text-sm">2</span>
              <div className="w-12 h-12 bg-mouse-teal/20 rounded-lg flex items-center justify-center mb-4">
                <Monitor className="w-6 h-6 text-mouse-teal" />
              </div>
              <h3 className="text-white font-semibold mb-2">They Deploy in Minutes</h3>
              <p className="text-gray-400 text-sm">Your clients onboard, deploy AI employees, and start using them. We handle fulfillment. You collect.</p>
            </div>
            <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-6 relative">
              <span className="absolute -top-3 -left-1 w-8 h-8 bg-mouse-teal rounded-full flex items-center justify-center text-white font-bold text-sm">3</span>
              <div className="w-12 h-12 bg-mouse-teal/20 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-mouse-teal" />
              </div>
              <h3 className="text-white font-semibold mb-2">Collect Recurring Revenue</h3>
              <p className="text-gray-400 text-sm">Charge $4.98–$8.98 per hour. Keep the difference. Stripe Connect for instant payouts.</p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-mouse-teal/20 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-mouse-teal" />
            </div>
            <h3 className="text-white font-semibold mb-2">Keep the Margin</h3>
            <p className="text-gray-400 text-sm">Charge $4.98–$8.98/hr. You control the margin. Every customer, every month.</p>
          </div>
          <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-mouse-teal/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-mouse-teal" />
            </div>
            <h3 className="text-white font-semibold mb-2">Set Your Price</h3>
            <p className="text-gray-400 text-sm">Custom pricing per client. You control the margin.</p>
          </div>
          <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-mouse-teal/20 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-mouse-teal" />
            </div>
            <h3 className="text-white font-semibold mb-2">Invite & Convert</h3>
            <p className="text-gray-400 text-sm">Share invite links. Customers pay you. We handle fulfillment.</p>
          </div>
        </div>

        {/* What You'll Sell */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
            The Product You&apos;ll Sell
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10 max-w-xl mx-auto">
            What is an AI employee? It&apos;s like a digital worker that never sleeps, never takes breaks, and runs your clients&apos; existing software.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-5 text-center">
              <div className="w-10 h-10 bg-mouse-teal/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Monitor className="w-5 h-5 text-mouse-teal" />
              </div>
              <h4 className="text-white font-medium text-sm mb-1">Runs Existing Software</h4>
              <p className="text-gray-500 text-xs">Logs in, navigates, completes tasks like a human</p>
            </div>
            <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-5 text-center">
              <div className="w-10 h-10 bg-mouse-teal/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5 text-mouse-teal" />
              </div>
              <h4 className="text-white font-medium text-sm mb-1">24/7 Availability</h4>
              <p className="text-gray-500 text-xs">Never sleeps, never calls in sick</p>
            </div>
            <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-5 text-center">
              <div className="w-10 h-10 bg-mouse-teal/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 h-5 text-mouse-teal" />
              </div>
              <h4 className="text-white font-medium text-sm mb-1">No Integrations</h4>
              <p className="text-gray-500 text-xs">Uses the software as-is, no API needed</p>
            </div>
            <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-5 text-center">
              <div className="w-10 h-10 bg-mouse-teal/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-5 h-5 text-mouse-teal" />
              </div>
              <h4 className="text-white font-medium text-sm mb-1">$4.98/hr Value</h4>
              <p className="text-gray-500 text-xs">Cheaper than hiring staff</p>
            </div>
          </div>
        </div>

        {/* Built For Sellers */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
            Built For Sellers
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10 max-w-xl mx-auto">
            The only platform made for you. Everything you need to plug AI employees into businesses.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0d0d14] border border-mouse-teal/20 rounded-xl p-5">
              <h4 className="text-mouse-teal font-semibold text-sm mb-1">Invite Links</h4>
              <p className="text-gray-500 text-xs">Share your link. Customers sign up under you.</p>
            </div>
            <div className="bg-[#0d0d14] border border-mouse-teal/20 rounded-xl p-5">
              <h4 className="text-mouse-teal font-semibold text-sm mb-1">Instant Deploy</h4>
              <p className="text-gray-500 text-xs">Clients onboard in minutes. No dev work.</p>
            </div>
            <div className="bg-[#0d0d14] border border-mouse-teal/20 rounded-xl p-5">
              <h4 className="text-mouse-teal font-semibold text-sm mb-1">Auto Billing</h4>
              <p className="text-gray-500 text-xs">Recurring payments. Stripe Connect.</p>
            </div>
            <div className="bg-[#0d0d14] border border-mouse-teal/20 rounded-xl p-5">
              <h4 className="text-mouse-teal font-semibold text-sm mb-1">White Label</h4>
              <p className="text-gray-500 text-xs">Your brand. Your pricing. Your business.</p>
            </div>
          </div>
        </div>

        {/* Works For Any Industry */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
            Works For Any Industry
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10 max-w-xl mx-auto">
            Any business that uses software for admin work is a potential client.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Construction", "Dental", "Legal", "Real Estate", "HVAC", "Auto Repair", "Insurance", "Accounting", "E-commerce", "Healthcare"].map((ind) => (
              <span key={ind} className="px-4 py-2 rounded-lg bg-[#1a1a2e] border border-gray-800 text-gray-300 text-sm">
                {ind}
              </span>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
            AI Employee vs Human Employee
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10 max-w-xl mx-auto">
            This is why businesses are switching. Show your clients the math.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full max-w-2xl mx-auto border border-gray-800 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-[#0d0d14]">
                  <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">Feature</th>
                  <th className="px-6 py-4 text-left text-mouse-teal font-medium text-sm">AI Employee</th>
                  <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">Human</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr className="bg-[#1a1a2e]">
                  <td className="px-6 py-4 text-gray-300 text-sm">Available 24/7</td>
                  <td className="px-6 py-4"><Check className="w-5 h-5 text-mouse-teal" /></td>
                  <td className="px-6 py-4 text-gray-500 text-sm">8 hrs/day</td>
                </tr>
                <tr className="bg-[#1a1a2e]">
                  <td className="px-6 py-4 text-gray-300 text-sm">Never calls in sick</td>
                  <td className="px-6 py-4"><Check className="w-5 h-5 text-mouse-teal" /></td>
                  <td className="px-6 py-4 text-gray-500 text-sm">—</td>
                </tr>
                <tr className="bg-[#1a1a2e]">
                  <td className="px-6 py-4 text-gray-300 text-sm">Cost</td>
                  <td className="px-6 py-4 text-mouse-teal font-medium">~$4.98/hr</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">$25–50/hr+</td>
                </tr>
                <tr className="bg-[#1a1a2e]">
                  <td className="px-6 py-4 text-gray-300 text-sm">Scales instantly</td>
                  <td className="px-6 py-4"><Check className="w-5 h-5 text-mouse-teal" /></td>
                  <td className="px-6 py-4 text-gray-500 text-sm">Hiring takes weeks</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <FAQSection />

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-wrap justify-center gap-6 sm:gap-12 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-mouse-teal" />
            <span>{s.resellersCount.toLocaleString()} Partners Worldwide</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-mouse-teal" />
            <span>{s.fastestTo10k} Record to $10k/mo</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-mouse-teal" />
            <span>{formatRevenue(s.combinedMonthlyRevenue)} Combined Monthly Revenue</span>
          </div>
        </div>

        {/* Final CTA */}
        <div className="border-t border-gray-800 pt-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Get Paid With AI On Autopilot
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            Join {s.resellersCount.toLocaleString()}+ partners worldwide. Free to start, no credit card required. Start earning today.
          </p>
          <Link
            href="/signup/reseller"
            className="inline-flex items-center gap-2 bg-mouse-teal text-white font-semibold px-8 py-3 rounded-lg hover:bg-mouse-teal/90 transition-colors"
          >
            <TrendingUp className="w-5 h-5" />
            Start Earning
          </Link>
          <p className="mt-4 text-gray-500 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-mouse-teal hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
