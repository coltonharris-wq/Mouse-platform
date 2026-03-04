'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-mouse-offwhite py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-orange-600" />
            </div>

            <h1 className="text-3xl font-bold text-mouse-navy mb-4">
              Payment Cancelled
            </h1>
            
            <p className="text-mouse-charcoal text-lg mb-6">
              Your payment was cancelled and you were not charged. If you have any questions or need help completing your purchase, we're here to help.
            </p>

            <div className="bg-mouse-offwhite rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-mouse-navy mb-2 flex items-center gap-2">
                <HelpCircle size={18} />
                Common Questions
              </h3>
              <ul className="space-y-2 text-sm text-mouse-charcoal">
                <li>• Need a custom plan? Contact our sales team</li>
                <li>• Have questions about features? Check our FAQ</li>
                <li>• Want to try first? Start with our Free plan</li>
                <li>• Payment issues? We're here to help</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-3 rounded hover:bg-teal-700 transition-colors"
              >
                <ArrowLeft size={18} />
                Back to Pricing
              </Link>
              <a
                href="mailto:sales@mouseplatform.com"
                className="inline-flex items-center justify-center gap-2 border-2 border-mouse-teal text-mouse-teal px-6 py-3 rounded hover:bg-mouse-teal hover:text-white transition-colors"
              >
                Contact Sales
              </a>
            </div>

            <div className="mt-6 text-sm text-mouse-slate">
              <p>Need immediate help? Call us at{' '}
                <a href="tel:+18779340395" className="text-mouse-teal hover:underline">
                  (877) 934-0395
                </a>
              </p>
            </div>
          </div>

          {/* Alternative options */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/pricing" className="bg-white rounded-lg p-6 border border-gray-200 hover:border-mouse-teal transition-colors">
              <h4 className="font-semibold text-mouse-navy mb-2">Explore Plans</h4>
              <p className="text-sm text-mouse-slate">Compare all our pricing options and find the perfect fit for your business.</p>
            </Link>
            <Link href="/#get-started?plan=free" className="bg-white rounded-lg p-6 border border-gray-200 hover:border-mouse-teal transition-colors">
              <h4 className="font-semibold text-mouse-navy mb-2">Start Free</h4>
              <p className="text-sm text-mouse-slate">Try Mouse Platform with 50 free messages. No credit card required.</p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
