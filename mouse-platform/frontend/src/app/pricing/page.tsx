'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WORK_HOURS_PACKAGES, WORK_HOURS_COSTS, formatPrice, formatWorkHours } from '@/lib/stripe';
import { 
  Check, 
  Clock, 
  MessageSquare, 
  Bot, 
  Mail, 
  Zap, 
  AlertCircle,
  Sparkles,
  TrendingUp,
  Shield,
  ArrowRight,
  Loader2
} from 'lucide-react';

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId') || undefined;
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageSlug: string) => {
    if (!customerId) {
      router.push('/login');
      return;
    }

    setLoading(packageSlug);
    try {
      const response = await fetch('/api/tokens/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId,
          packageSlug,
          successUrl: `${window.location.origin}/dashboard?purchase=success`,
          cancelUrl: `${window.location.origin}/pricing?purchase=cancelled`
        })
      });

      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const packages = Object.values(WORK_HOURS_PACKAGES);

  const getPackageColor = (slug: string) => {
    switch (slug) {
      case 'starter':
        return {
          border: 'border-gray-600',
          accent: 'text-gray-400',
          bg: 'bg-gray-500/10',
          button: 'bg-gray-700 hover:bg-gray-600'
        };
      case 'growth':
        return {
          border: 'border-mouse-teal',
          accent: 'text-mouse-teal',
          bg: 'bg-mouse-teal/10',
          button: 'bg-gradient-to-r from-mouse-teal to-mouse-teal-dark hover:from-mouse-teal-light hover:to-mouse-teal'
        };
      case 'pro':
        return {
          border: 'border-accent-purple',
          accent: 'text-accent-purple',
          bg: 'bg-accent-purple/10',
          button: 'bg-gradient-to-r from-accent-purple to-accent-purple/80 hover:from-accent-purple-light hover:to-accent-purple'
        };
      default:
        return {
          border: 'border-gray-600',
          accent: 'text-gray-400',
          bg: 'bg-gray-500/10',
          button: 'bg-gray-700 hover:bg-gray-600'
        };
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-mouse-teal/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-accent-purple/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-cyan/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-mouse-teal/10 border border-mouse-teal/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-mouse-teal" />
            <span className="text-sm font-medium text-mouse-teal">Simple, Transparent Pricing</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            AI Work Hours Pricing
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Pay only for what you use. Purchase AI Work Hours and spend them on AI employees, 
            VM runtime, and more.
          </p>
        </div>

        {/* Work Hours Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg) => {
            const colors = getPackageColor(pkg.slug);
            return (
              <div
                key={pkg.slug}
                className={`relative rounded-2xl bg-dark-surface border-2 ${colors.border} p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover ${
                  pkg.slug === 'growth' ? 'ring-4 ring-mouse-teal/10' : ''
                }`}
              >
                {pkg.slug === 'growth' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-mouse-teal to-mouse-teal-dark text-white px-6 py-2 rounded-full text-sm font-bold shadow-glow-teal">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-gray-400">{pkg.description}</p>
                </div>

                <div className="text-center mb-8">
                  <span className="text-6xl font-bold gradient-text">
                    {formatPrice(pkg.priceCents)}
                  </span>
                  <div className={`flex items-center justify-center gap-2 mt-4 ${colors.accent}`}>
                    <div className={`p-2 ${colors.bg} rounded-lg`}>
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg">
                      {formatWorkHours(pkg.workHours)} AI Work Hours
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    ${((pkg.priceCents / 100) / pkg.workHours).toFixed(2)} per hour
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`p-1 ${colors.bg} rounded-full mt-0.5`}>
                        <Check className={`w-4 h-4 ${colors.accent}`} />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(pkg.slug)}
                  disabled={loading === pkg.slug}
                  className={`w-full py-4 px-4 rounded-xl font-bold text-white transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${colors.button}`}
                >
                  {loading === pkg.slug ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Buy {pkg.name}
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Enterprise CTA */}
        <div className="relative overflow-hidden rounded-2xl p-10 mb-16 bg-gradient-to-r from-mouse-navy via-dark-surface to-mouse-navy border border-dark-border">
          <div className="absolute inset-0 bg-gradient-shine bg-[length:200%_100%] animate-shimmer opacity-5"></div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                <Shield className="w-8 h-8 text-mouse-teal" />
                <h2 className="text-3xl font-bold text-white">Enterprise</h2>
              </div>
              <p className="text-gray-400 max-w-xl">
                Custom AI Work Hours, volume discounts, dedicated support, and SLA guarantees for large organizations.
              </p>
            </div>
            <a
              href="mailto:sales@mouseplatform.com"
              className="btn-secondary whitespace-nowrap"
            >
              Contact Sales
            </a>
          </div>
        </div>

        {/* Work Hours Costs Section */}
        <div className="glass-card p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-mouse-teal" />
              <h2 className="text-3xl font-bold text-white">What Can You Do With AI Work Hours?</h2>
            </div>
            <p className="text-gray-400">Estimate your usage based on common actions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group p-6 bg-dark-bg-tertiary/50 rounded-2xl border border-dark-border hover:border-mouse-teal/30 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-mouse-teal/10 rounded-xl group-hover:bg-mouse-teal/20 transition-colors">
                  <MessageSquare className="w-7 h-7 text-mouse-teal" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Message King Mouse</h3>
                  <p className="text-3xl font-bold text-mouse-teal mb-2">
                    {WORK_HOURS_COSTS.messageKingMouse.hours}
                  </p>
                  <p className="text-sm text-gray-400">
                    hours per message sent to your AI assistant
                  </p>
                </div>
              </div>
            </div>

            <div className="group p-6 bg-dark-bg-tertiary/50 rounded-2xl border border-dark-border hover:border-accent-purple/30 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-accent-purple/10 rounded-xl group-hover:bg-accent-purple/20 transition-colors">
                  <Bot className="w-7 h-7 text-accent-purple" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Deploy AI Employee</h3>
                  <p className="text-3xl font-bold text-accent-purple mb-2">
                    {WORK_HOURS_COSTS.deployAiEmployee.hours}
                  </p>
                  <p className="text-sm text-gray-400">
                    hour one-time cost per AI employee deployment
                  </p>
                </div>
              </div>
            </div>

            <div className="group p-6 bg-dark-bg-tertiary/50 rounded-2xl border border-dark-border hover:border-accent-cyan/30 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-accent-cyan/10 rounded-xl group-hover:bg-accent-cyan/20 transition-colors">
                  <Clock className="w-7 h-7 text-accent-cyan" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">VM Runtime</h3>
                  <p className="text-3xl font-bold text-accent-cyan mb-2">
                    {WORK_HOURS_COSTS.vmRuntime1h.hours}
                  </p>
                  <p className="text-sm text-gray-400">
                    hour per hour of VM runtime for AI employees
                  </p>
                </div>
              </div>
            </div>

            <div className="group p-6 bg-dark-bg-tertiary/50 rounded-2xl border border-dark-border hover:border-green-500/30 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
                  <Mail className="w-7 h-7 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Process Email</h3>
                  <p className="text-3xl font-bold text-green-400 mb-2">
                    {WORK_HOURS_COSTS.processEmail.hours}
                  </p>
                  <p className="text-sm text-gray-400">
                    hours per email processed by AI employees
                  </p>
                </div>
              </div>
            </div>

            <div className="group p-6 bg-dark-bg-tertiary/50 rounded-2xl border border-dark-border hover:border-accent-amber/30 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-accent-amber/10 rounded-xl group-hover:bg-accent-amber/20 transition-colors">
                  <Zap className="w-7 h-7 text-accent-amber" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">API Call</h3>
                  <p className="text-3xl font-bold text-accent-amber mb-2">
                    {WORK_HOURS_COSTS.apiCall.hours}
                  </p>
                  <p className="text-sm text-gray-400">
                    hours per API request to the platform
                  </p>
                </div>
              </div>
            </div>

            <div className="group p-6 bg-dark-bg-tertiary/50 rounded-2xl border border-dark-border hover:border-rose-500/30 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-rose-500/10 rounded-xl group-hover:bg-rose-500/20 transition-colors">
                  <AlertCircle className="w-7 h-7 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Low Balance Alert</h3>
                  <p className="text-3xl font-bold text-rose-400 mb-2">
                    &lt; 5
                  </p>
                  <p className="text-sm text-gray-400">
                    we&apos;ll notify you when AI Work Hours run low
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Have Questions?</h3>
          <p className="text-gray-400 mb-6">
            Check out our documentation or contact support for help.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="#" className="btn-secondary">
              View Documentation
            </a>
            <a href="mailto:support@mouseplatform.com" className="btn-primary">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
