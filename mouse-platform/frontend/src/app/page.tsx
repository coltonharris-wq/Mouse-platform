'use client';

import Link from 'next/link';
import { ArrowRight, Check, Clock, Shield, Zap, Users } from 'lucide-react';
import ProGrid from '@/components/marketplace/ProGrid';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐭</span>
            <span className="text-xl font-bold text-gray-900">KingMouse</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/marketplace" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:inline">Marketplace</Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:inline">Pricing</Link>
            <Link href="/onboarding" className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Stop Hiring.<br />Start Deploying.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            KingMouse handles operations, scheduling, inventory, and customer communication — so you don&apos;t have to.
          </p>
          <p className="text-3xl font-bold text-teal-600 mb-8">
            AI Employees at $4.98/hr
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Hire Your AI Employee
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 px-8 py-4 rounded-xl text-lg font-medium hover:text-gray-900"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-12 px-4">
        <div className="max-w-md mx-auto bg-gray-900 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-10">
            <div>
              <p className="text-gray-400 text-sm mb-1">Human Employee</p>
              <p className="text-3xl font-bold text-red-400 line-through">$35/hr</p>
            </div>
            <div className="text-gray-500 text-3xl font-light">vs</div>
            <div>
              <p className="text-teal-400 text-sm mb-1">KingMouse AI</p>
              <p className="text-3xl font-bold text-teal-400">$4.98/hr</p>
            </div>
          </div>
          <p className="text-gray-400 mt-4 text-sm">Same work. Fraction of the cost. 24/7 availability.</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: Users, title: 'Pick Your Pro', desc: 'Choose an AI employee specialized for your industry' },
              { step: '2', icon: Check, title: 'Answer Questions', desc: 'Tell us about your business in a few simple steps' },
              { step: '3', icon: Zap, title: 'Subscribe', desc: 'Choose a plan starting at $97/month' },
              { step: '4', icon: Clock, title: 'AI Starts Working', desc: 'Your AI employee begins in under 2 minutes' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-700 font-bold text-xl">{item.step}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">AI Employee Marketplace</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Each Pro is specialized for your industry. Pick one and it starts working immediately.
          </p>
          <ProGrid />
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What KingMouse Does</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: 'Works 24/7', desc: 'Never sleeps, never calls in sick. Your AI employee works around the clock.' },
              { icon: Shield, title: 'Sandboxed & Secure', desc: 'Each customer gets their own VM. Your data never touches other environments.' },
              { icon: Zap, title: 'Autonomous', desc: 'Handles scheduling, inventory, ordering, and customer comms. Only asks you for big decisions.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="p-3 bg-teal-100 rounded-lg w-fit mb-4">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof Placeholder */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Small Businesses</h2>
          <p className="text-gray-500 mb-8">Join businesses saving thousands per month with AI employees.</p>
          <div className="grid grid-cols-3 gap-8">
            {[
              { stat: '85%', label: 'Time Saved' },
              { stat: '$4.98', label: 'Per Hour' },
              { stat: '24/7', label: 'Availability' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-4xl font-bold text-teal-600">{item.stat}</p>
                <p className="text-sm text-gray-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to deploy your AI employee?</h2>
          <p className="text-gray-400 mb-8">First 2 hours free. No credit card required to browse.</p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 bg-teal-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-teal-400 transition-colors"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">FAQ</h2>
          <div className="space-y-6">
            {[
              { q: 'What is KingMouse?', a: 'KingMouse is an AI employee platform. You pick a Pro specialized for your industry, and it autonomously handles operations, scheduling, inventory, and customer communication.' },
              { q: 'Is this a chatbot?', a: 'No. KingMouse is an autonomous AI operations manager. It doesn\'t just answer questions — it takes action. It schedules appointments, orders supplies, follows up with customers, and only asks you to approve big decisions.' },
              { q: 'How much does it cost?', a: 'Plans start at $97/month for 20 hours. That\'s $4.98/hour — compared to $35/hour for a human employee.' },
              { q: 'Is my data secure?', a: 'Every customer gets their own sandboxed virtual machine. Your data never touches other customers\' environments.' },
              { q: 'How long to set up?', a: 'About 2 minutes. Answer a few questions, pick a plan, and your AI employee starts working immediately.' },
            ].map((faq, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐭</span>
            <span className="font-bold text-gray-900">KingMouse</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
            <Link href="/marketplace" className="hover:text-gray-900">Marketplace</Link>
            <Link href="/onboarding" className="hover:text-gray-900">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
