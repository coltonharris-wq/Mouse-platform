import Link from "next/link";
import { Check, ArrowRight, Mail, Database, Users, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import KingMouseAvatar from "@/app/components/KingMouseAvatar";

const testimonials = [
  {
    quote:
      "We were drowning in follow-up tasks — emails, pipeline updates, SMS reminders. Mouse handles all of it now. Revenue is up and my sales team is focused on closing, not data entry.",
    name: "James Hartwell",
    title: "Owner, Meridian Construction Group",
  },
  {
    quote:
      "Our front desk was spending three hours a day on administrative work. Mouse's AI employee handles appointment confirmations, insurance follow-ups, and patient emails. We reclaimed those hours completely.",
    name: "Dr. Sarah Chen",
    title: "Practice Director, Apex Dental Partners",
  },
  {
    quote:
      "Billing follow-up used to fall through the cracks. Since deploying Mouse, our accounts receivable cycle has shortened by nearly two weeks. The ROI was visible within the first month.",
    name: "Patricia Mills",
    title: "Managing Partner, Northwest Legal Group",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    features: [
      "1 AI Employee",
      "50 messages per month",
      "Basic chat responses",
      "Email support",
      "$2 pro feature allowance",
    ],
    featured: false,
    cta: "Start Free",
  },
  {
    name: "Starter",
    price: "$97",
    period: "/mo",
    features: [
      "1 AI Employee",
      "160 hours per month",
      "Email + CRM automation",
      "ROI dashboard",
      "Standard support",
    ],
    featured: false,
    cta: "Get Started",
  },
  {
    name: "Growth",
    price: "$297",
    period: "/mo",
    features: [
      "3 AI Employees",
      "500 hours per month",
      "Sales + Ops + AR automation",
      "Priority compute",
      "Monthly strategy call",
      "ROI dashboard",
    ],
    featured: true,
    cta: "Get Started",
  },
  {
    name: "Enterprise",
    price: "$497",
    period: "/mo",
    features: [
      "10+ AI Employees",
      "Unlimited scaling",
      "Custom AI builds",
      "Dedicated onboarding",
      "Service level agreement",
      "Priority support",
    ],
    featured: false,
    cta: "Contact Sales",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-mouse-navy to-mouse-teal py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            AI Employees for Your Business
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-mouse-slate max-w-2xl mx-auto leading-relaxed">
            Deploy digital workers that operate your existing software. No integrations. No dev team.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-mouse-orange text-white text-base font-semibold px-8 py-3 rounded hover:bg-orange-600 transition-colors w-full sm:w-auto text-center"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="border border-white text-white text-base font-semibold px-8 py-3 rounded hover:bg-white/10 transition-colors w-full sm:w-auto text-center"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="bg-mouse-offwhite py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-mouse-navy text-center leading-tight">
            Still Paying People to Do What Software Should Handle?
          </h2>
          <p className="mt-4 text-mouse-charcoal text-center text-base sm:text-lg max-w-2xl mx-auto">
            Most businesses are spending time and money on work that should be automated. Sound familiar?
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <p className="text-mouse-charcoal text-sm leading-relaxed">
                Your team is{" "}
                <span className="text-mouse-red font-semibold">wasting time</span>{" "}
                manually entering data into your CRM, accounting software, and client portals — tasks that should never touch a human hand.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <p className="text-mouse-charcoal text-sm leading-relaxed">
                Every day you rely on{" "}
                <span className="text-mouse-red font-semibold">manual processes</span>{" "}
                for sales follow-up, invoice chasing, and appointment reminders — leaving revenue on the table and deals to go cold.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <p className="text-mouse-charcoal text-sm leading-relaxed">
                Operational{" "}
                <span className="text-mouse-red font-semibold">bottlenecks</span>{" "}
                build up because your highest-value people are buried in low-value admin work that keeps the business from scaling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution / Use Cases */}
      <section id="features" className="py-16 sm:py-20" style={{ backgroundColor: "#E6F4F4" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-mouse-navy text-center leading-tight">
            AI Employees That Get Real Work Done
          </h2>
          <p className="mt-4 text-mouse-charcoal text-center text-base sm:text-lg max-w-2xl mx-auto">
            Each AI employee logs in, navigates your software, and completes tasks exactly like a human worker would — without the overhead.
          </p>
          <div id="use-cases" className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Sales Follow-Up */}
            <div className="bg-white rounded-lg p-6 border border-mouse-teal/20 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-mouse-teal/10 p-2 rounded">
                  <Users size={20} className="text-mouse-teal" />
                </div>
                <h3 className="text-mouse-navy font-semibold text-base">Sales Follow-Up</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-mouse-charcoal">
                  <Check size={15} className="text-mouse-teal mt-0.5 flex-shrink-0" />
                  Logs into your CRM and identifies leads requiring follow-up
                </li>
                <li className="flex items-start gap-2 text-sm text-mouse-charcoal">
                  <Check size={15} className="text-mouse-teal mt-0.5 flex-shrink-0" />
                  Drafts personalized emails and sends SMS reminders
                </li>
                <li className="flex items-start gap-2 text-sm text-mouse-charcoal">
                  <Check size={15} className="text-mouse-teal mt-0.5 flex-shrink-0" />
                  Updates pipeline stages and contact records automatically
                </li>
              </ul>
            </div>

            {/* Accounts Receivable */}
            <div className="bg-white rounded-lg p-6 border border-mouse-teal/20 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-mouse-teal/10 p-2 rounded">
                  <FileText size={20} className="text-mouse-teal" />
                </div>
                <h3 className="text-mouse-navy font-semibold text-base">Accounts Receivable</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-mouse-charcoal">
                  <Check size={15} className="text-mouse-teal mt-0.5 flex-shrink-0" />
                  Logs into QuickBooks and identifies overdue invoices
                </li>
                <li className="flex items-start gap-2 text-sm text-mouse-charcoal">
                  <Check size={15} className="text-mouse-teal mt-0.5 flex-shrink-0" />
                  Sends professional payment reminders via email
                </li>
                <li className="flex items-start gap-2 text-sm text-mouse-charcoal">
                  <Check size={15} className="text-mouse-teal mt-0.5 flex-shrink-0" />
                  Updates invoice statuses and escalates as needed
                </li>
              </ul>
            </div>

            {/* Data Entry */}
            <div className="bg-white rounded-lg p-6 border border-mouse-teal/20 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-mouse-teal/10 p-2 rounded">
                  <Database size={20} className="text-mouse-teal" />
                </div>
                <h3 className="text-mouse-navy font-semibold text-base">Data Entry</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-mouse-charcoal">
                  <Check size={15} className="text-mouse-teal mt-0.5 flex-shrink-0" />
                  Opens emails and extracts structured data automatically
                </li>
                <li className="flex items-start gap-2 text-sm text-mouse-charcoal">
                  <Check size={15} className="text-mouse-teal mt-0.5 flex-shrink-0" />
                  Inputs information directly into client and vendor portals
                </li>
                <li className="flex items-start gap-2 text-sm text-mouse-charcoal">
                  <Check size={15} className="text-mouse-teal mt-0.5 flex-shrink-0" />
                  Validates entries and flags exceptions for human review
                </li>
              </ul>
            </div>

            {/* Executive Assistant */}
            <div className="bg-white rounded-lg p-6 border border-mouse-teal/20 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-mouse-teal/10 p-2 rounded">
                  <Mail size={20} className="text-mouse-teal" />
                </div>
                <h3 className="text-mouse-navy font-semibold text-base">Executive Assistant</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-mouse-charcoal">
                  <Check size={15} className="text-mouse-teal mt-0.5 flex-shrink-0" />
                  Reads Gmail and drafts context-aware replies for your review
                </li>
                <li className="flex items-start gap-2 text-sm text-mouse-charcoal">
                  <Check size={15} className="text-mouse-teal mt-0.5 flex-shrink-0" />
                  Manages task lists and schedules follow-up actions
                </li>
                <li className="flex items-start gap-2 text-sm text-mouse-charcoal">
                  <Check size={15} className="text-mouse-teal mt-0.5 flex-shrink-0" />
                  Surfaces priority items and daily briefings
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ROI section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-mouse-navy leading-tight">
            Measurable Results. Real ROI.
          </h2>
          <p className="mt-4 text-mouse-charcoal text-base sm:text-lg max-w-2xl mx-auto">
            Our customers see the numbers move within the first 30 days of deployment.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold text-mouse-green">+38%</span>
              <span className="mt-2 text-mouse-navy font-semibold text-lg">Revenue Growth</span>
              <span className="mt-1 text-mouse-charcoal text-sm">Average across Growth plan customers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold text-mouse-green">22</span>
              <span className="mt-2 text-mouse-navy font-semibold text-lg">Hours Saved Weekly</span>
              <span className="mt-1 text-mouse-charcoal text-sm">Per AI employee deployed</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold text-mouse-green">1.4</span>
              <span className="mt-2 text-mouse-navy font-semibold text-lg">FTE Equivalent</span>
              <span className="mt-1 text-mouse-charcoal text-sm">Replaced per AI employee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 sm:py-20" style={{ backgroundColor: "#F1F5F9" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-mouse-navy text-center leading-tight">
            What Business Owners Are Saying
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm flex flex-col"
              >
                <p className="text-mouse-charcoal text-sm leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-mouse-navy font-semibold text-sm">{t.name}</p>
                  <p className="text-mouse-charcoal text-xs mt-0.5">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section id="pricing" className="bg-mouse-offwhite py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-mouse-navy text-center leading-tight">
            Plans for Every Stage of Growth
          </h2>
          <p className="mt-4 text-mouse-charcoal text-center text-base sm:text-lg max-w-xl mx-auto">
            Start with one AI employee and scale to a full digital workforce as your needs grow.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg p-6 border flex flex-col ${
                  plan.featured
                    ? "bg-[#E6F4F4] border-mouse-teal shadow-md"
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                {plan.featured && (
                  <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded mb-4 self-start">
                    Most Popular
                  </span>
                )}
                <h3 className="text-mouse-navy font-bold text-lg">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-0.5">
                  <span className="text-3xl font-bold text-mouse-green">{plan.price}</span>
                  <span className="text-mouse-charcoal text-sm">{plan.period}</span>
                </div>
                <ul className="mt-5 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-mouse-charcoal">
                      <Check size={15} className="text-mouse-teal mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className="mt-6 block bg-mouse-orange text-white text-sm font-semibold px-4 py-2.5 rounded text-center hover:bg-orange-600 transition-colors"
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="text-mouse-teal text-sm font-medium hover:text-mouse-navy transition-colors inline-flex items-center gap-1"
            >
              View all plans and features
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="get-started" className="bg-mouse-navy py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Ready to Deploy Your First AI Employee?
          </h2>
          <p className="mt-4 text-mouse-slate text-base sm:text-lg max-w-xl mx-auto">
            Get started today and see measurable results within 30 days or we will work with you until you do.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-mouse-orange text-white text-base font-semibold px-8 py-3 rounded hover:bg-orange-600 transition-colors w-full sm:w-auto text-center"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="border border-mouse-slate text-mouse-slate text-base font-semibold px-8 py-3 rounded hover:border-white hover:text-white transition-colors w-full sm:w-auto text-center"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* King Mouse Avatar - Floating */}
      <KingMouseAvatar />
    </div>
  );
}
