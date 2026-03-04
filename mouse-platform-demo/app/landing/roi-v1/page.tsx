"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  Users,
  Briefcase,
  TrendingUp,
  Shield,
  Mail,
  User,
  Building2,
  Calculator,
  Clock,
  Calendar,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const testimonials = [
  {
    quote:
      "The ROI was clear within the first month. We're saving over $3,000 monthly on admin tasks alone.",
    name: "James Hartwell",
    title: "Owner, Meridian Construction Group",
    savings: "$36,000/year",
  },
  {
    quote:
      "I was skeptical about the savings claims. Mouse delivered exactly what they promised — and then some.",
    name: "Dr. Sarah Chen",
    title: "Practice Director, Apex Dental Partners",
    savings: "$42,000/year",
  },
  {
    quote:
      "We calculated our savings at $28,400 in year one. Best investment we've made for the practice.",
    name: "Patricia Mills",
    title: "Managing Partner, Northwest Legal Group",
    savings: "$28,400/year",
  },
];

const useCases = [
  {
    icon: Users,
    title: "Hire another human employee",
    description: "Use your savings to expand your team with strategic hires",
  },
  {
    icon: Briefcase,
    title: "Take a real vacation",
    description: "Finally unplug knowing your AI employee has things covered",
  },
  {
    icon: TrendingUp,
    title: "Invest back in your business",
    description: "Put that money toward marketing, equipment, or growth initiatives",
  },
];

export default function ROILandingPageV1() {
  const [hourlyRate, setHourlyRate] = useState(35);
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [weeksPerYear, setWeeksPerYear] = useState(50);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
  });

  const calculations = useMemo(() => {
    const currentCost = hourlyRate * hoursPerWeek * weeksPerYear;
    const aiCost = 11964;
    const aiCostMonthly = aiCost / 12;
    const yearlySavings = currentCost - aiCost;
    const monthlySavings = yearlySavings / 12;
    const fiveYearSavings = yearlySavings * 5;

    return {
      currentCost,
      aiCost,
      aiCostMonthly,
      yearlySavings,
      monthlySavings,
      fiveYearSavings,
    };
  }, [hourlyRate, hoursPerWeek, weeksPerYear]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const chartData = useMemo(() => {
    const data = [];
    for (let year = 1; year <= 5; year++) {
      data.push({
        year,
        savings: calculations.yearlySavings * year,
        cumulative: calculations.yearlySavings * year,
      });
    }
    return data;
  }, [calculations.yearlySavings]);

  const maxChartValue = Math.max(...chartData.map((d) => d.cumulative));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section - Variant 1: Focus on Cost Savings */}
      <section className="bg-mouse-navy pt-16 pb-12 sm:pt-20 sm:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-mouse-teal/20 border border-mouse-teal/30 rounded-full px-4 py-2 mb-6">
            <span className="text-mouse-teal font-bold text-lg">Save 85%</span>
            <span className="text-white/80 text-sm">vs hiring employees</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            Stop Overpaying for Busywork
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-mouse-slate">
            AI employees at $4.98/hour — Same work, fraction of the cost
          </p>
        </div>
      </section>

      {/* Interactive Calculator */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-mouse-navy to-mouse-teal px-6 py-4">
              <div className="flex items-center gap-2">
                <Calculator className="text-white" size={24} />
                <h2 className="text-xl font-bold text-white">Savings Calculator</h2>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-mouse-navy font-semibold">
                      <Clock size={18} className="text-mouse-teal" />
                      What do you pay per hour?
                    </label>
                    <span className="text-2xl font-bold text-mouse-navy">
                      {formatCurrency(hourlyRate)}/hr
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="100"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-mouse-teal"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$15</span>
                    <span>$100</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-mouse-navy font-semibold">
                      <Users size={18} className="text-mouse-teal" />
                      How many hours of busywork per week?
                    </label>
                    <span className="text-2xl font-bold text-mouse-navy">
                      {hoursPerWeek} hours
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-mouse-teal"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5 hrs</span>
                    <span>60 hrs</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-mouse-navy font-semibold">
                      <Calendar size={18} className="text-mouse-teal" />
                      How many weeks per year?
                    </label>
                    <span className="text-2xl font-bold text-mouse-navy">
                      {weeksPerYear} weeks
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="52"
                    value={weeksPerYear}
                    onChange={(e) => setWeeksPerYear(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-mouse-teal"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>40 weeks</span>
                    <span>52 weeks</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-100">
                <div className="text-center mb-6">
                  <p className="text-mouse-teal font-semibold text-lg">At $4.98/hour, you save:</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Current cost</p>
                    <p className="text-2xl sm:text-3xl font-bold text-mouse-charcoal">
                      {formatCurrency(calculations.currentCost)}
                      <span className="text-sm font-normal text-gray-500">/year</span>
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">AI employee cost</p>
                    <p className="text-2xl sm:text-3xl font-bold text-mouse-teal">
                      {formatCurrency(calculations.aiCost)}
                      <span className="text-sm font-normal text-gray-500">/year</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(calculations.aiCostMonthly)}/month
                    </p>
                  </div>

                  <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-300 shadow-md">
                    <p className="text-sm text-green-700 mb-2 font-bold uppercase tracking-wide">Your Savings</p>
                    <p className="text-4xl sm:text-5xl font-bold text-mouse-green">
                      {formatCurrency(calculations.yearlySavings)}
                      <span className="text-base font-normal text-green-600">/year</span>
                    </p>
                    <p className="text-lg font-semibold text-green-700 mt-2">
                      {formatCurrency(calculations.monthlySavings)}/month
                    </p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-xl text-mouse-navy font-medium">
                    What could you do with{" "}
                    <span className="font-bold text-mouse-green">
                      ${Math.round(calculations.yearlySavings / 1000)}K
                    </span>{" "}
                    more per year?
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-mouse-navy mb-6 text-center">
                  5-Year Savings Projection
                </h3>
                <div className="relative h-48 sm:h-64">
                  <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-gray-500">
                    <span>{formatCurrency(maxChartValue)}</span>
                    <span>{formatCurrency(maxChartValue * 0.5)}</span>
                    <span>$0</span>
                  </div>

                  <div className="ml-16 h-full flex items-end justify-around gap-2 sm:gap-4 pb-8">
                    {chartData.map((data) => {
                      const heightPercent = maxChartValue > 0 
                        ? (data.cumulative / maxChartValue) * 100 
                        : 0;
                      return (
                        <div key={data.year} className="flex flex-col items-center flex-1">
                          <div className="relative w-full max-w-16">
                            <div
                              className="w-full bg-gradient-to-t from-mouse-teal to-mouse-teal/70 rounded-t-lg transition-all duration-500"
                              style={{ height: `${Math.max(heightPercent, 5)}%` }}
                            >
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-mouse-navy whitespace-nowrap">
                                {formatCurrency(data.cumulative)}
                              </div>
                            </div>
                          </div>
                          <span className="mt-2 text-xs sm:text-sm font-medium text-gray-600">
                            Year {data.year}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">
                  Total 5-year savings:{" "}
                  <span className="font-bold text-mouse-green">
                    {formatCurrency(calculations.fiveYearSavings)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Could You Do Section */}
      <section className="bg-mouse-offwhite py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-mouse-navy text-center leading-tight">
            What Could You Do With An Extra{" "}
            <span className="text-mouse-green">
              {formatCurrency(calculations.yearlySavings)}
            </span>
            ?
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((useCase) => (
              <div
                key={useCase.title}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-mouse-teal/10 rounded-xl flex items-center justify-center mb-4">
                  <useCase.icon className="text-mouse-teal" size={28} />
                </div>
                <h3 className="text-lg font-bold text-mouse-navy mb-2">
                  {useCase.title}
                </h3>
                <p className="text-mouse-charcoal text-sm leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 mb-4">
              <Sparkles className="text-mouse-green" size={18} />
              <span className="text-mouse-green font-semibold">
                The average Mouse customer saves $28,400 in year one
              </span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-mouse-navy text-center mb-12">
            What Our Customers Are Saying
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-mouse-offwhite rounded-xl p-6 border border-gray-100 flex flex-col"
              >
                <div className="mb-4">
                  <span className="inline-block bg-mouse-green/10 text-mouse-green text-xs font-bold px-3 py-1 rounded-full">
                    {t.savings}
                  </span>
                </div>
                <p className="text-mouse-charcoal text-sm leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-mouse-navy font-semibold text-sm">{t.name}</p>
                  <p className="text-mouse-charcoal text-xs mt-0.5">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-mouse-navy py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-4">
            How It Works
          </h2>
          <p className="text-mouse-slate text-center max-w-xl mx-auto mb-12">
            Get your AI employee up and running in three simple steps
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-mouse-teal rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Pick Your Employee</h3>
              <p className="text-mouse-slate text-sm">
                Choose from our marketplace of pre-trained AI employees for sales, admin, AR, and more
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-mouse-teal rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Connect Your Tools</h3>
              <p className="text-mouse-slate text-sm">
                Link Gmail, your CRM, QuickBooks, and other tools — takes just 5 minutes
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-mouse-teal rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Watch The Savings</h3>
              <p className="text-mouse-slate text-sm">
                Your AI employee starts working immediately. Track savings in real-time on your dashboard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Reversal */}
      <section className="bg-mouse-offwhite py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="text-mouse-green" size={48} />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-mouse-navy mb-4">
                  Our Ironclad Guarantee
                </h2>
                <p className="text-lg text-mouse-charcoal leading-relaxed">
                  Try for 30 days. If you don&apos;t save at least{" "}
                  <span className="font-bold text-mouse-green">$1,000</span>, we&apos;ll
                  refund you plus{" "}
                  <span className="font-bold text-mouse-green">$500</span> for wasting your
                  time.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-mouse-green" />
                    <span>30-day trial</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-mouse-green" />
                    <span>Full refund guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-mouse-green" />
                    <span>+$500 if we fail</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-mouse-navy py-16 sm:py-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Get My Free Savings Report
            </h2>
            <p className="text-mouse-slate">
              Takes 2 minutes. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-mouse-teal focus:ring-1 focus:ring-mouse-teal"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Work email"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-mouse-teal focus:ring-1 focus:ring-mouse-teal"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="sr-only">
                Company
              </label>
              <div className="relative">
                <Building2
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Company name"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-mouse-teal focus:ring-1 focus:ring-mouse-teal"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-mouse-orange text-white text-lg font-semibold px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 mt-6"
            >
              Get My Free Savings Report
              <ChevronRight size={20} />
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            By submitting, you agree to our{" "}
            <Link href="#" className="text-mouse-teal hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-mouse-teal hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
