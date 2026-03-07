"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { TrendingUp, Users, DollarSign, Zap } from "lucide-react";

export default function ForResellersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Resell AI Employees. Earn 40% Commission.
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Join the Mouse reseller program. White-label AI workforce for your clients. Recurring revenue, instant payouts.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-mouse-teal/20 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-mouse-teal" />
            </div>
            <h3 className="text-white font-semibold mb-2">40% Recurring</h3>
            <p className="text-gray-400 text-sm">Commission on every customer you bring. Every month.</p>
          </div>
          <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-mouse-teal/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-mouse-teal" />
            </div>
            <h3 className="text-white font-semibold mb-2">Set Your Price</h3>
            <p className="text-gray-400 text-sm">Custom pricing per client. You control the margin.</p>
          </div>
          <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-mouse-teal/20 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-mouse-teal" />
            </div>
            <h3 className="text-white font-semibold mb-2">Invite & Convert</h3>
            <p className="text-gray-400 text-sm">Share invite links. Customers pay you. We handle fulfillment.</p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/signup/reseller"
            className="inline-flex items-center gap-2 bg-mouse-teal text-white font-semibold px-8 py-3 rounded-lg hover:bg-mouse-teal/90 transition-colors"
          >
            <TrendingUp className="w-5 h-5" />
            Become a Reseller
          </Link>
          <p className="mt-4 text-gray-500 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-mouse-teal hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
