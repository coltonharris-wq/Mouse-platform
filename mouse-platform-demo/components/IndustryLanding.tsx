"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, DollarSign, Users, Zap, Phone, Star } from "lucide-react";

interface IndustryLandingProps {
  industry: string;
  headline: string;
  subheadline: string;
  painPoints: string[];
  solutions: {
    title: string;
    description: string;
  }[];
  testimonial: {
    quote: string;
    name: string;
    business: string;
  };
  stats: {
    hoursSaved: string;
    costReduction: string;
    responseTime: string;
  };
  ctaText?: string;
}

export default function IndustryLanding({
  industry,
  headline,
  subheadline,
  painPoints,
  solutions,
  testimonial,
  stats,
  ctaText = "Start Your Free Month",
}: IndustryLandingProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="bg-[#0B1F3B] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-xl">Mouse</Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-gray-300 hover:text-white text-base font-medium">Sign In</Link>
            <Link
              href="/signup"
              className="bg-[#F97316] text-white px-5 py-2.5 rounded-lg text-base font-semibold hover:bg-orange-600 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#0B1F3B] pt-16 pb-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block bg-white/10 text-[#0F6B6E] px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            Built for {industry}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {headline}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            {subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-[#F97316] text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-orange-600 transition-colors inline-flex items-center justify-center gap-2"
            >
              {ctaText}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="border-2 border-white/30 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white/5 transition-colors inline-flex items-center justify-center"
            >
              See How It Works
            </Link>
          </div>
          <p className="text-gray-400 text-base mt-4">
            Use code <span className="text-[#0F6B6E] font-bold">FOUNDERS100</span> — first month free
          </p>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3B] text-center mb-4">
            Sound familiar?
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            These problems cost {industry.toLowerCase()} businesses thousands every month.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {painPoints.map((point, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-gray-200 flex items-start gap-4"
              >
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-lg font-bold">✕</span>
                </div>
                <p className="text-lg text-gray-800 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3B] text-center mb-4">
            Mouse fixes all of it
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            AI employees that work 24/7 for $4.98/hour. No training. No sick days. No drama.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((sol, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-[#0F6B6E]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-[#0F6B6E]" />
                </div>
                <h3 className="text-xl font-bold text-[#0B1F3B] mb-3">{sol.title}</h3>
                <p className="text-base text-gray-600 leading-relaxed">{sol.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[#0B1F3B]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-6 h-6 text-[#0F6B6E]" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white">{stats.hoursSaved}</p>
              <p className="text-gray-400 text-base mt-1">Hours Saved / Month</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-6 h-6 text-[#0F6B6E]" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white">{stats.costReduction}</p>
              <p className="text-gray-400 text-base mt-1">Cost Reduction</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-[#0F6B6E]" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white">{stats.responseTime}</p>
              <p className="text-gray-400 text-base mt-1">Response Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3B] text-center mb-4">
            Set up in 5 minutes. Seriously.
          </h2>
          <p className="text-xl text-gray-600 text-center mb-14 max-w-2xl mx-auto">
            No coding. No consultants. King Mouse handles everything.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: "1", title: "Sign up", desc: "Create your account. Takes 30 seconds." },
              { step: "2", title: "Tell King Mouse about your business", desc: "He asks 5 simple questions. Your industry, team size, biggest headaches." },
              { step: "3", title: "Your AI team starts working", desc: "King Mouse auto-configures your employees. They start handling calls, emails, and tasks immediately." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-[#F97316] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-[#0B1F3B] mb-2">{item.title}</h3>
                <p className="text-base text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
          <blockquote className="text-2xl text-[#0B1F3B] font-medium leading-relaxed mb-6">
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>
          <p className="text-lg text-gray-600">
            <span className="font-semibold text-[#0B1F3B]">{testimonial.name}</span>
            {" · "}{testimonial.business}
          </p>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 bg-[#0B1F3B]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your business, running itself
          </h2>
          <p className="text-xl text-gray-300 mb-4">
            Starting at <span className="text-white font-bold">$97/month</span> for 20 work hours
          </p>
          <p className="text-lg text-gray-400 mb-8">
            That&apos;s $4.98/hour vs $35/hour for a human. Same output. Zero drama.
          </p>
          <Link
            href="/signup"
            className="bg-[#F97316] text-white px-10 py-4 rounded-lg text-xl font-bold hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-gray-400 text-base mt-4">
            Code <span className="text-[#0F6B6E] font-bold">FOUNDERS100</span> = first month free
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#051020] py-10 text-center">
        <p className="text-gray-500 text-base">© 2026 Mouse · AI Workforce Operating System</p>
      </footer>
    </div>
  );
}
