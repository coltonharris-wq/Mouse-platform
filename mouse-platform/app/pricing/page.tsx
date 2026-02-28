import Link from "next/link";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Plan {
  name: string;
  priceDisplay: string;
  period: string;
  desc: string;
  featured: boolean;
  badge: string | null;
  features: string[];
  cta: string;
}

const plans: Plan[] = [
  {
    name: "Starter",
    priceDisplay: "$997",
    period: "/mo",
    desc: "Perfect for businesses ready to automate their first workflow.",
    featured: false,
    badge: null,
    features: [
      "1 AI Employee",
      "160 hours per month",
      "Email + CRM automation",
      "ROI dashboard",
      "Standard compute",
      "Email support",
      "14-day onboarding",
    ],
    cta: "Get Started",
  },
  {
    name: "Growth",
    priceDisplay: "$2,997",
    period: "/mo",
    desc: "For growing businesses automating across sales, operations, and AR.",
    featured: true,
    badge: "Most Popular",
    features: [
      "3 AI Employees",
      "500 hours per month",
      "Sales + Ops + AR automation",
      "Priority compute",
      "ROI dashboard and custom reports",
      "Monthly strategy call included",
      "Priority support — 4-hour response",
      "Dedicated onboarding manager",
    ],
    cta: "Get Started",
  },
  {
    name: "Enterprise",
    priceDisplay: "$7,500+",
    period: "/mo",
    desc: "For organizations that need full workforce automation at scale.",
    featured: false,
    badge: null,
    features: [
      "10+ AI Employees",
      "Unlimited scaling",
      "Custom AI workflow builds",
      "Dedicated infrastructure",
      "Service level agreement — 99.9% uptime",
      "Dedicated onboarding team",
      "24/7 priority support",
      "Custom reporting and integrations",
    ],
    cta: "Contact Sales",
  },
];

const faqs = [
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
    a: "Yes. You can change plans at any time. Changes take effect at the next billing cycle. There are no cancellation fees.",
  },
  {
    q: "Is my business data secure?",
    a: "All sessions are encrypted. We never store login credentials in plain text. Data processing agreements are available for all plans.",
  },
  {
    q: "What software can AI Employees work with?",
    a: "Any software with a visual interface: CRMs, accounting software, email, spreadsheets, web portals, PDFs, ERPs — if a human can use it, our AI can too.",
  },
];

export default function PricingPage() {
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
            No setup fees. No per-task charges. One flat monthly price per AI Employee.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="bg-mouse-offwhite py-16 sm:py-20 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg p-8 flex flex-col border ${
                  plan.featured
                    ? "bg-[#E6F4F4] border-mouse-teal shadow-lg"
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                {plan.badge && (
                  <span className="inline-block bg-mouse-teal text-white text-xs font-semibold px-3 py-1 rounded mb-4 self-start">
                    {plan.badge}
                  </span>
                )}
                <div className="mb-6">
                  <h2 className="text-mouse-navy font-bold text-xl mb-2">{plan.name}</h2>
                  <div className="flex items-baseline gap-0.5 mb-3">
                    <span className="text-4xl font-bold text-mouse-green">{plan.priceDisplay}</span>
                    <span className="text-mouse-charcoal text-sm">{plan.period}</span>
                  </div>
                  <p className="text-mouse-charcoal text-sm leading-relaxed">{plan.desc}</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-mouse-charcoal">
                      <Check size={16} className="text-mouse-teal mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/#get-started"
                  className="block bg-mouse-orange text-white text-sm font-semibold px-4 py-3 rounded text-center hover:bg-orange-600 transition-colors"
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Guarantee note */}
          <p className="mt-8 text-center text-mouse-charcoal text-sm">
            All plans include a 30-day results guarantee. If you do not see measurable improvement, we work with you at no additional charge until you do.
          </p>
        </div>
      </section>

      {/* FAQ section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-mouse-navy text-center leading-tight">
            Frequently Asked Questions
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((item) => (
              <div key={item.q} className="border border-gray-100 rounded-lg p-6 bg-mouse-offwhite">
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
            Tell us about your business and we will calculate your estimated ROI before you commit to anything.
          </p>
          <div className="mt-8">
            <Link
              href="/#get-started"
              className="inline-block bg-mouse-orange text-white text-base font-semibold px-8 py-3 rounded hover:bg-orange-600 transition-colors"
            >
              Get Your Free ROI Estimate
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
