import Link from 'next/link';
import { Bot, Zap, Shield, BarChart3, ArrowRight, Check, Users, HeadphonesIcon } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1e3a5f]">Mouse</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="#features" className="text-gray-600 hover:text-[#1e3a5f] px-3 py-2">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-[#1e3a5f] px-3 py-2">
                Pricing
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-[#1e3a5f] px-3 py-2">
                Login
              </Link>
              <Link
                href="/login"
                className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#2d4a6f] transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-blue-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1e3a5f] mb-6">
              Deploy AI Employees That
              <span className="text-blue-600"> Work 24/7</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Mouse Platform empowers businesses to hire, manage, and scale AI employees. 
              Automate workflows, reduce costs, and increase productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#1e3a5f] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#2d4a6f] transition-colors"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/sales/demo"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#1e3a5f] border-2 border-[#1e3a5f] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1e3a5f] mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools for managing AI employees, tracking performance, and growing your business.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Bot,
                title: 'AI Employees',
                description: 'Hire specialized AI agents for any task - from sales to support to development.',
              },
              {
                icon: Zap,
                title: 'Instant Deployment',
                description: 'Deploy AI employees in minutes with pre-trained models and custom workflows.',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Bank-grade security with SOC 2 compliance and end-to-end encryption.',
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description: 'Real-time insights into AI performance, productivity, and ROI.',
              },
            ].map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-[#1e3a5f] rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1e3a5f] mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Basic',
                price: '$99',
                period: '/month',
                description: 'Perfect for small teams getting started',
                features: ['3 AI Employees', '1,000 tasks/month', 'Basic analytics', 'Email support'],
                cta: 'Start Free Trial',
                popular: false,
              },
              {
                name: 'Pro',
                price: '$299',
                period: '/month',
                description: 'For growing teams with advanced needs',
                features: [
                  '10 AI Employees',
                  '10,000 tasks/month',
                  'Advanced analytics',
                  'Priority support',
                  'Custom integrations',
                ],
                cta: 'Start Free Trial',
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                description: 'For large organizations with custom requirements',
                features: [
                  'Unlimited AI Employees',
                  'Unlimited tasks',
                  'Custom AI training',
                  'Dedicated support',
                  'SLA guarantee',
                  'On-premise option',
                ],
                cta: 'Contact Sales',
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-[#1e3a5f] text-white ring-4 ring-blue-200'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <span className="inline-block px-3 py-1 bg-blue-500 text-sm font-medium rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className={`text-xl font-semibold mb-2 ${plan.popular ? 'text-white' : 'text-[#1e3a5f]'}`}>
                  {plan.name}
                </h3>
                <p className={`mb-4 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={plan.popular ? 'text-blue-100' : 'text-gray-600'}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className={`w-5 h-5 ${plan.popular ? 'text-blue-200' : 'text-green-500'}`} />
                      <span className={plan.popular ? 'text-blue-50' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block text-center py-3 rounded-xl font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-white text-[#1e3a5f] hover:bg-blue-50'
                      : 'bg-[#1e3a5f] text-white hover:bg-[#2d4a6f]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1e3a5f] mb-4">
              Built for Every Role
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Powerful portals designed for administrators, sales teams, resellers, and customers.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'Admin Portal',
                description: 'Manage customers, resellers, view reports and security logs.',
                href: '/login',
              },
              {
                icon: Users,
                title: 'Sales Portal',
                description: 'Track pipeline, manage leads, and run product demos.',
                href: '/login',
              },
              {
                icon: BarChart3,
                title: 'Reseller Portal',
                description: '40% commission, referral links, and customer management.',
                href: '/login',
              },
              {
                icon: HeadphonesIcon,
                title: 'Customer Portal',
                description: 'Manage AI employees, VMs, tasks, and billing.',
                href: '/login',
              },
            ].map((portal) => (
              <Link key={portal.title} href={portal.href} className="block p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-[#1e3a5f] rounded-xl flex items-center justify-center mb-4">
                  <portal.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2">{portal.title}</h3>
                <p className="text-gray-600">{portal.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1e3a5f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of companies already using Mouse to power their AI workforce.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#1e3a5f] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-[#2d4a6f] text-white border border-[#3b5998] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#3b5998] transition-colors"
            >
              Become a Reseller
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#152a45] text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Mouse</span>
              </div>
              <p className="text-sm">
                Empowering businesses with AI employees that work 24/7.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/sales/demo" className="hover:text-white">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
                <li><Link href="/login" className="hover:text-white">Partners</Link></li>
                <li><Link href="/login" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#1e3a5f] mt-8 pt-8 text-center text-sm">
            © 2026 Mouse Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
