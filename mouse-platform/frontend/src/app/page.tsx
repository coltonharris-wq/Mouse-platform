import Link from "next/link";
import { Bot, Coins, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Bot className="w-8 h-8 text-teal-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Mouse Platform</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Pricing
              </Link>
              <Link
                href="/dashboard"
                className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Deploy AI Employees
            <span className="block text-teal-600">That Work For You</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Token-based platform for deploying and managing AI employees. 
            Pay only for what you use with transparent pricing.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/pricing"
              className="bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-teal-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/dashboard"
              className="bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-300 transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
              <Coins className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Token-Based</h3>
            <p className="text-gray-600">
              Pay only for what you use. Purchase tokens and spend them on AI employees, 
              VM runtime, and more.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Monitored</h3>
            <p className="text-gray-600">
              Built-in guardrails and monitoring to ensure your AI employees 
              operate safely and securely.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Deployment</h3>
            <p className="text-gray-600">
              Deploy AI employees in seconds. Scale up or down based on your 
              needs with no long-term contracts.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bot className="w-8 h-8 text-teal-400" />
              <span className="ml-2 text-xl font-bold">Mouse Platform</span>
            </div>
            <p className="text-gray-400">
              © 2024 Mouse Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
