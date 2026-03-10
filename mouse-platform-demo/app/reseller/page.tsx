'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Calculator, ArrowRight, Check, Users, Zap, Shield, TrendingUp, DollarSign } from 'lucide-react';

// Reseller pricing config
const MOUSE_BASE_RATE = 4.98; // What Mouse charges reseller
const MOUSE_MAX_RATE = 8.98;  // Max reseller can charge

export default function ResellerLandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="text-mouse-teal">Loading...</div></div>}>
      <ResellerLandingContent />
    </Suspense>
  );
}

function ResellerLandingContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');
  
  // Calculator state
  const [hourlyRate, setHourlyRate] = useState(6.98);
  const [hoursPerMonth, setHoursPerMonth] = useState(500);
  const [numClients, setNumClients] = useState(5);

  // Calculate margins
  const marginPerHour = hourlyRate - MOUSE_BASE_RATE;
  const marginPercent = ((marginPerHour / hourlyRate) * 100).toFixed(1);
  const monthlyRevenuePerClient = hourlyRate * hoursPerMonth;
  const monthlyCostPerClient = MOUSE_BASE_RATE * hoursPerMonth;
  const monthlyProfitPerClient = marginPerHour * hoursPerMonth;
  const totalMonthlyProfit = monthlyProfitPerClient * numClients;
  const totalYearlyProfit = totalMonthlyProfit * 12;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f]">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🐭</span>
              <span className="text-white font-bold text-xl">Mouse</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#calculator" className="text-gray-400 hover:text-white text-sm">Calculator</a>
              <a href="#how-it-works" className="text-gray-400 hover:text-white text-sm">How It Works</a>
              <a href="#pricing" className="text-gray-400 hover:text-white text-sm">Pricing</a>
              <Link 
                href={refCode ? `/signup/reseller-customer?ref=${refCode}` : "/signup"}
                className="bg-mouse-teal text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-mouse-teal/10 border border-mouse-teal/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-mouse-teal rounded-full animate-pulse"></span>
            <span className="text-mouse-teal text-sm font-medium">Reseller Program — Set Your Price</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Sell AI Employees.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-mouse-teal to-blue-500">
              Keep the Margin.
            </span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Buy AI employees at <strong className="text-white">$4.98/hr</strong>. 
            Resell at up to <strong className="text-white">$8.98/hr</strong>. 
            Keep the difference. We handle the VMs, Mouse, and support.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href={refCode ? `/signup/reseller-customer?ref=${refCode}` : "/signup"}
              className="bg-mouse-teal text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 flex items-center justify-center gap-2"
            >
              Start Reselling
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#calculator"
              className="bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-700 flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Calculate Earnings
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-mouse-teal">You Set Price</div>
              <div className="text-gray-500 text-sm mt-1">Max Margin</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">$4.98</div>
              <div className="text-gray-500 text-sm mt-1">Your Cost / hr</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">$8.98</div>
              <div className="text-gray-500 text-sm mt-1">Max Sell / hr</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-400">Instant</div>
              <div className="text-gray-500 text-sm mt-1">VM Provisioning</div>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Calculator */}
      <section id="calculator" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Commission Calculator
            </h2>
            <p className="text-gray-400">
              Set your price. See your profit. We handle the rest.
            </p>
          </div>

          <div className="bg-[#1a1a2e] border border-gray-800 rounded-2xl p-6 md:p-8">
            {/* Rate Slider */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="text-gray-300 font-medium">Your Hourly Rate</label>
                <div className="text-2xl font-bold text-white">${hourlyRate.toFixed(2)}/hr</div>
              </div>
              <input
                type="range"
                min={MOUSE_BASE_RATE}
                max={MOUSE_MAX_RATE}
                step={0.10}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-mouse-teal"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Min: ${MOUSE_BASE_RATE}</span>
                <span className="text-mouse-teal">Margin: ${marginPerHour.toFixed(2)}/hr ({marginPercent}%)</span>
                <span>Max: ${MOUSE_MAX_RATE}</span>
              </div>
            </div>

            {/* Hours Slider */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="text-gray-300 font-medium">Hours per Client / Month</label>
                <div className="text-2xl font-bold text-white">{hoursPerMonth} hrs</div>
              </div>
              <input
                type="range"
                min={20}
                max={1000}
                step={10}
                value={hoursPerMonth}
                onChange={(e) => setHoursPerMonth(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-mouse-teal"
              />
            </div>

            {/* Clients Slider */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="text-gray-300 font-medium">Number of Clients</label>
                <div className="text-2xl font-bold text-white">{numClients}</div>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={numClients}
                onChange={(e) => setNumClients(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-mouse-teal"
              />
            </div>

            {/* Results */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="bg-[#0a0a0f] rounded-xl p-6 text-center">
                <div className="text-gray-500 text-sm mb-2">Monthly Profit</div>
                <div className="text-3xl font-bold text-green-400">
                  ${totalMonthlyProfit.toLocaleString()}
                </div>
                <div className="text-gray-600 text-xs mt-1">${monthlyProfitPerClient.toFixed(0)} × {numClients} clients</div>
              </div>
              
              <div className="bg-[#0a0a0f] rounded-xl p-6 text-center">
                <div className="text-gray-500 text-sm mb-2">Yearly Profit</div>
                <div className="text-3xl font-bold text-mouse-teal">
                  ${totalYearlyProfit.toLocaleString()}
                </div>
                <div className="text-gray-600 text-xs mt-1">Recurring revenue</div>
              </div>

              <div className="bg-[#0a0a0f] rounded-xl p-6 text-center">
                <div className="text-gray-500 text-sm mb-2">Your Margin</div>
                <div className="text-3xl font-bold text-white">
                  {marginPercent}%
                </div>
                <div className="text-gray-600 text-xs mt-1">${marginPerHour.toFixed(2)}/hr profit</div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="mt-8 p-4 bg-gray-800/50 rounded-xl">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Client pays you:</span>
                <span className="text-white font-medium">${monthlyRevenuePerClient.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-400">You pay Mouse:</span>
                <span className="text-red-400 font-medium">-${monthlyCostPerClient.toLocaleString()}/mo</span>
              </div>
              <div className="border-t border-gray-700 my-2"></div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Your profit per client:</span>
                <span className="text-green-400 font-bold">${monthlyProfitPerClient.toLocaleString()}/mo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How Reselling Works
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We handle the tech. You handle the sale. Keep the margin.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                title: "1. Sign Up",
                desc: "Get approved as a reseller. Access your dashboard and custom invite link."
              },
              {
                icon: <DollarSign className="w-8 h-8" />,
                title: "2. Set Your Price",
                desc: "Choose your hourly rate between $4.98-$8.98. Higher margin = more profit."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "3. Auto-Provision",
                desc: "Customer signs up → VM spins up → Mouse installs → King Mouse ready."
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "4. Collect Margin",
                desc: "Customer pays your rate. We bill you $4.98/hr. You keep the difference."
              }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-mouse-teal/10 rounded-2xl flex items-center justify-center text-mouse-teal mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#1a1a2e] border border-gray-800 rounded-2xl p-6">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">We Handle Everything</h3>
              <p className="text-gray-400 text-sm">
                VM provisioning, Mouse installation, SSL, updates, monitoring.
                You just sell.
              </p>
            </div>

            <div className="bg-[#1a1a2e] border border-gray-800 rounded-2xl p-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-4">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Instant Setup</h3>
              <p className="text-gray-400 text-sm">
                Customer completes signup → King Mouse deployed in under 2 minutes. 
                Fully automated.
              </p>
            </div>

            <div className="bg-[#1a1a2e] border border-gray-800 rounded-2xl p-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Recurring Revenue</h3>
              <p className="text-gray-400 text-sm">
                Monthly billing. Customers stay for years. Build a book of business 
                that pays you forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to start reselling?
          </h2>
          <p className="text-gray-400 mb-8">
            Get your custom invite link. Set your price, keep the margin.
          </p>
          <Link 
            href={refCode ? `/signup/reseller-customer?ref=${refCode}` : "/signup"}
            className="inline-flex items-center gap-2 bg-mouse-teal text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90"
          >
            Become a Reseller
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐭</span>
            <span className="text-white font-bold">Mouse</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 Mouse AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
