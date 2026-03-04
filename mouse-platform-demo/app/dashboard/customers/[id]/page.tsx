"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, ArrowLeft, Users, FileText } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    working: "bg-teal-100 text-teal-700",
    idle: "bg-gray-100 text-gray-500",
    error: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    Enterprise: "bg-mouse-teal/10 text-mouse-teal",
    Growth: "bg-blue-100 text-blue-700",
    Starter: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[plan] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {plan}
    </span>
  );
}

interface Customer {
  id: string;
  company: string;
  plan: string;
  mrr: number;
  employees: number;
  health: string;
  email?: string;
  created_at?: string;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/reseller/customers/${id}`);
        if (res.ok) {
          const data = await res.json();
          const c = data.customer;
          if (c) {
            setCustomer({
              id: c.id,
              company: c.business_name || c.company_name || "Unknown",
              plan: c.plan || "Starter",
              mrr: c.mrr || 0,
              employees: c.employee_count || 0,
              health: c.health || "green",
              email: c.email,
              created_at: c.created_at,
            });
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-mouse-slate animate-spin" />
      </div>
    );
  }

  if (notFound || !customer) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-medium text-mouse-charcoal mb-2">Customer not found</p>
        <Link href="/dashboard/customers" className="text-sm text-mouse-teal hover:underline">
          ← Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-1 text-sm text-mouse-teal hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-mouse-navy mb-1">
              {customer.company}
            </h1>
            <div className="flex items-center gap-3">
              <PlanBadge plan={customer.plan} />
              <span className="text-sm text-mouse-slate">
                {customer.employees} AI Employee{customer.employees !== 1 ? "s" : ""}
              </span>
              {customer.email && (
                <span className="text-sm text-mouse-slate">{customer.email}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-mouse-green">
              ${customer.mrr.toLocaleString()}
            </p>
            <p className="text-xs text-mouse-slate mt-1">Monthly Recurring Revenue</p>
          </div>
        </div>
      </div>

      {/* AI Employees — empty state until VM deployment is live */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-mouse-slate/20">
          <h2 className="text-base font-semibold text-mouse-charcoal flex items-center gap-2">
            <Users className="w-4 h-4 text-mouse-teal" />
            AI Employees
          </h2>
        </div>
        <div className="px-6 py-10 text-center text-mouse-slate text-sm">
          No AI employees deployed for this customer yet.
        </div>
      </div>

      {/* Billing History — will populate from Stripe */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-mouse-slate/20">
          <h2 className="text-base font-semibold text-mouse-charcoal flex items-center gap-2">
            <FileText className="w-4 h-4 text-mouse-teal" />
            Billing History
          </h2>
        </div>
        <div className="px-6 py-10 text-center text-mouse-slate text-sm">
          No billing history yet. Invoices will appear here once the customer is billed.
        </div>
      </div>
    </div>
  );
}
