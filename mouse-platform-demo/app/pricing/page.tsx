"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const annualPrices: Record<string, { display: string; subtext: string }> = {
  starter: { display: "$58", subtext: "/mo (billed annually, 40% off)" },
  growth: { display: "$178", subtext: "/mo (billed annually, 40% off)" },
  enterprise: { display: "$298", subtext: "/mo (billed annually, 40% off)" },
};

interface Plan {
  name: string;
  slug: string;
  priceDisplay: string;
  priceSubtext: string;
  period: string;
  desc: string;
  featured: boolean;
  badge: string | null;
  features: { text: string; included: boolean }[];
  cta: string;
  ctaVariant: 'primary' | 'secondary' | 'outline';
  checkoutUrl?: string;
}

const plans: Plan[] = [
  {
    name: "Free",
    slug: "free",
    priceDisplay: "$0",
    priceSubtext: "forever",
    period: "",
    desc: "Perfect for trying out AI employees and small tasks.",
    featured: false,
    badge: null,
    features: [
      { text: "50 messages per month", included: true },
      { text: "1 AI Employee", included: true },
      { text: "Basic chat responses", included: true },
      { text: "Email support", included: true },
      { text: "$2 pro feature allowance", included: true },
      { text: "Kimi LLM", included: true },
      { text: "Advanced integrations", included: false },
      { text: "API access", included: false },
      { text: "Custom workflows", included: false },
    ],
    cta: "Get Started Free",
    ctaVariant: "outline",
    checkoutUrl: "/#get-started?plan=free",
  },
  {
    name: "Starter",
    slug: "starter",
    priceDisplay: "$97",
    priceSubtext: "",
    period: "/mo",
    desc: "Perfect for businesses ready to automate their first workflow.",
    featured: false,
    badge: null,
    features: [
      { text: "Unlimited messages", included: true },
      { text: "1 AI Employee", included: true },
      { text: "160 hours per month", included: true },
      { text: "Opus 4.6 LLM", included: true },
      { text: "Email + CRM automation", included: true },
      { text: "ROI dashboard", included: true },
      { text: "Standard compute", included: true },
      { text: "Email support", included: true },
      { text: "14-day onboarding", included: true },
    ],
    cta: "Get Started",
    ctaVariant: "secondary",
    checkoutUrl: "/checkout/starter",
  },
  {
    name: "Growth",
    slug: "growth",
    priceDisplay: "$297",
    priceSubtext: "",
    period: "/mo",
    desc: "For growing businesses automating across sales, operations, and AR.",
    featured: true,
    badge: "Most Popular",
    features: [
      { text: "Unlimited messages", included: true },
      { text: "3 AI Employees", included: true },
      { text: "500 hours per month", included: true },
      { text: "Opus 4.6 LLM", included: true },
      { text: "Sales + Ops + AR automation", included: true },
      { text: "Priority compute", included: true },
      { text: "ROI dashboard and custom reports", included: true },
      { text: "Monthly strategy call included", included: true },
      { text: "Priority support — 4-hour response", included: true },
    ],
    cta: "Get Started",
    ctaVariant: "primary",
    checkoutUrl: "/checkout/growth",
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    priceDisplay: "$497",
    priceSubtext: "",
    period: "/mo",
    desc: "For organizations that need full workforce automation at scale.",
    featured: false,
    badge: null,
    features: [
      { text: "Unlimited everything", included: true },
      { text: "10+ AI Employees", included: true },
      { text: "Unlimited scaling", included: true },
      { text: "Opus 4.6 + Custom models", included: true },
      { text: "Custom AI workflow builds", included: true },
      { text: "Dedicated infrastructure", included: true },
      { text: "Service level agreement — 99.9% uptime", included: true },
      { text: "Dedicated onboarding team", included: true },
      { text: "24/7 priority support", included: true },
    ],
    cta: "Contact Sales",
    ctaVariant: "secondary",
    checkoutUrl: "mailto:sales@mouseplatform.com",
  },
];

const comparisonFeatures = [
  { name: "Monthly messages", free: "50", starter: "Unlimited", growth: "Unlimited", enterprise: "Unlimited" },
  { name: "AI Employees", free: "1", starter: "1", growth: "3", enterprise: "10+" },
  { name: "LLM Model", free: "Kimi", starter: "Opus 4.6", growth: "Opus 4.6", enterprise: "Opus 4.6 + Custom" },
  { name: "Pro feature allowance", free: "$2/mo", starter: "Included", growth: "Included", enterprise: "Unlimited" },
  { name: "Phone/Voice calls", free: "Request in dashboard", starter: "Request in dashboard", growth: "Request in dashboard", enterprise: "Request in dashboard" },
  { name: "API access", free: "—", starter: "—", growth: "✓", enterprise: "Full access" },
  { name: "Custom workflows", free: "—", starter: "—", growth: "✓", enterprise: "✓" },
  { name: "Priority support", free: "—", starter: "—", growth: "✓", enterprise: "24/7" },
  { name: "SLA guarantee", free: "—", starter: "—", growth: "—", enterprise: "99.9%" },
];

const faqs = [
  {
    q: "What's included in the Free plan?",
    a: "The Free plan includes 50 messages per month with Kimi LLM, 1 AI Employee, and $2 of pro feature usage for trying out premium features. Request phone/voice calls anytime from your dashboard — we'll set you up within 15 minutes.",
  },
  {
    q: "What happens when I hit my Free plan limits?",
    a: "When you reach 50 messages, you'll see an upgrade prompt. For pro features, you get $2 of free usage, then a $3 grace period before requiring payment. You can upgrade anytime for unlimited usage. Pay annually to save 40%.",
  },
  {
    q: "Do I need to change my existing software?",
    a: "No. Mouse AI Employees operate your existing software just like a human would — by looking at the screen and using the keyboard and mouse. No APIs or integrations required.",
  },
  {
    q: "How long does it take to deploy?",
    a: "Most customers have their first AI Employee operational within 5 to 10 business days. Our onboarding team handles all setup and configuration.",
  },
  {
    q: "What happens if the AI makes a mistake?",
    a: "Every action is logged and auditable. You can review screen recordings of every task. Our AI flags uncertainty and escalates to humans rather than guessing.",
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Yes. You can change plans at any time. Changes take effect at the next billing cycle. There are no cancellation fees. You can also downgrade to Free if you need to pause.",
  },
  {
    q: "Is my business data secure?",
    a: "All sessions are encrypted. We never store login credentials in plain text. Data processing agreements are available for all plans.",
  },
  {
    q: "What software can AI Employees work with?",
    a: "Any software with a visual interface: CRMs, accounting software, email, spreadsheets, web portals, PDFs, ERPs — if a human can use it, our AI can too.",
  },
  {
    q: "How do I get phone or voice calls for my AI employees?",
    a: "Click 'Request Phone/Voice' in your dashboard. We'll connect ElevenLabs and Twilio to your account within 15 minutes. You can buy a phone number ($28/mo) and assign it to King Mouse or any employee — or port your existing business number for an AI receptionist.",
  },
];

function getCtaClasses(variant: Plan['ctaVariant'], featured: boolean): string {
  const base = "block text-sm font-semibold px-4 py-3 rounded text-center transition-colors";
  
  switch (variant) {
    case 'primary':
      return `${base} bg-mouse-orange text-white hover:bg-orange-600`;
    case 'secondary':
      return `${base} bg-orange-500 text-white hover:bg-teal-700`;
    case 'outline':
    default:
      return `${base} border-2 border-mouse-teal text-mouse-teal hover:bg-mouse-teal hover:text-white`;
  }
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Page header */}
      <section className="bg-mouse-navy py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-mouse-slate text-base sm:text-lg max-w-xl mx-auto">
            Start free, upgrade when you are ready. No credit card required. Save 40% when you pay annually.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="bg-mouse-offwhite py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!annual ? "bg-mouse-teal text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${annual ? "bg-mouse-teal text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
            >
              Annual <span className="text-xs">(40% off)</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg p-6 flex flex-col border ${
                  plan.featured
                    ? "bg-[#E6F4F4] border-mouse-teal shadow-lg scale-105"
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                {plan.badge && (
                  <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded mb-4 self-start">
                    {plan.badge}
                  </span>
                )}
                <div className="mb-6">
                  <h2 className="text-mouse-navy font-bold text-xl mb-2">{plan.name}</h2>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-mouse-green">
                      {annual && plan.slug !== "free" && annualPrices[plan.slug as keyof typeof annualPrices]
                        ? annualPrices[plan.slug as keyof typeof annualPrices].display
                        : plan.priceDisplay}
                    </span>
                    <span className="text-mouse-charcoal text-sm">
                      {annual && plan.slug !== "free" && annualPrices[plan.slug as keyof typeof annualPrices]
                        ? annualPrices[plan.slug as keyof typeof annualPrices].subtext
                        : plan.period}
                    </span>
                  </div>
                  {plan.priceSubtext && !annual && (
                    <p className="text-mouse-slate text-xs">{plan.priceSubtext}</p>
                  )}
                  <p className="text-mouse-charcoal text-sm leading-relaxed mt-3">{plan.desc}</p>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li 
                      key={feature.text} 
                      className={`flex items-start gap-2 text-sm ${
                        feature.included ? 'text-mouse-charcoal' : 'text-mouse-slate'
                      }`}
                    >
                      {feature.included ? (
                        <Check size={16} className="text-mouse-teal mt-0.5 flex-shrink-0" />
                      ) : (
                        <X size={16} className="text-mouse-slate mt-0.5 flex-shrink-0" />
                      )}
                      {feature.text}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.checkoutUrl || `/#get-started?plan=${plan.slug}`}
                  className={getCtaClasses(plan.ctaVariant, plan.featured)}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Free tier highlight */}
          <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-mouse-navy mb-2">
                  🎁 Free Forever Plan
                </h3>
                <p className="text-mouse-charcoal text-sm">
                  Try Mouse with 50 free messages per month. No credit card required. 
                  When you are ready for unlimited messages and premium LLMs, upgrade to Pro.
                </p>
              </div>
              <Link
                href="/#get-started?plan=free"
                className="inline-block bg-mouse-navy text-white text-sm font-semibold px-6 py-3 rounded hover:bg-mouse-teal transition-colors whitespace-nowrap"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-mouse-navy text-center mb-12">
            Compare Plans
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-mouse-navy">
                  <th className="text-left py-4 px-4 font-semibold text-mouse-navy">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-mouse-charcoal">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-mouse-charcoal">Starter</th>
                  <th className="text-center py-4 px-4 font-semibold text-mouse-teal">Growth</th>
                  <th className="text-center py-4 px-4 font-semibold text-mouse-charcoal">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, idx) => (
                  <tr 
                    key={feature.name} 
                    className={idx % 2 === 0 ? 'bg-mouse-offwhite' : 'bg-white'}
                  >
                    <td className="py-3 px-4 text-mouse-charcoal">{feature.name}</td>
                    <td className="text-center py-3 px-4 text-mouse-charcoal">{feature.free}</td>
                    <td className="text-center py-3 px-4 text-mouse-charcoal">{feature.starter}</td>
                    <td className="text-center py-3 px-4 text-mouse-teal font-medium">{feature.growth}</td>
                    <td className="text-center py-3 px-4 text-mouse-charcoal">{feature.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="bg-mouse-offwhite py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-mouse-navy text-center leading-tight">
            Frequently Asked Questions
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((item) => (
              <div key={item.q} className="border border-gray-100 rounded-lg p-6 bg-white">
                <h3 className="text-mouse-navy font-semibold text-sm mb-2">{item.q}</h3>
                <p className="text-mouse-charcoal text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-mouse-navy py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Ready to Deploy Your AI Workforce?
          </h2>
          <p className="mt-4 text-mouse-slate text-base sm:text-lg max-w-xl mx-auto">
            Start free with 50 messages. No credit card required. Upgrade anytime.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#get-started?plan=free"
              className="inline-block bg-white text-mouse-navy text-base font-semibold px-8 py-3 rounded hover:bg-gray-100 transition-colors"
            >
              Start Free
            </Link>
            <Link
              href="/checkout/growth"
              className="inline-flex items-center justify-center gap-2 bg-mouse-orange text-white text-base font-semibold px-8 py-3 rounded hover:bg-orange-600 transition-colors"
            >
              <Zap size={18} />
              Get Pro
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
