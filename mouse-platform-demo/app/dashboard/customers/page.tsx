"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { OnboardedCustomer } from "@/lib/reseller-customer-manager";
import AddCustomerModal from "@/components/AddCustomerModal";
import CustomerStats from "@/components/CustomerStats";

// Export config to force dynamic rendering
export const dynamic = 'force-dynamic';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending_payment: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    active: "Active",
    pending_payment: "Pending Payment",
    cancelled: "Cancelled",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "active"
            ? "bg-green-500"
            : status === "pending_payment"
            ? "bg-yellow-500"
            : "bg-red-500"
        }`}
      />
      {labels[status] ?? status}
    </span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    enterprise: "bg-mouse-teal/10 text-mouse-teal",
    pro: "bg-blue-100 text-blue-700",
    starter: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[plan] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {plan}
    </span>
  );
}

interface DashboardStats {
  totalCustomers: number;
  pendingPayment: number;
  activeCustomers: number;
  cancelledCustomers: number;
  totalMrr: number;
  totalCommission: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<OnboardedCustomer[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const supabase = createClient();

  const fetchCustomers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No session found");
        return;
      }

      const response = await fetch("/api/reseller/customers", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();
      setCustomers(data.customers);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleResendInvite = async (customerId: string) => {
    setActionLoading(customerId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`/api/reseller/customers/${customerId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "resend-invite" }),
      });

      if (response.ok) {
        alert("Invite resent successfully!");
      } else {
        alert("Failed to resend invite");
      }
    } catch (error) {
      console.error("Error resending invite:", error);
      alert("Error resending invite");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.businessName.toLowerCase().includes(search.toLowerCase()) ||
    c.ownerName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mouse-teal"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-mouse-navy">Customers</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-mouse-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Customer
        </button>
      </div>

      {/* Stats Cards */}
      {stats && <CustomerStats stats={stats} />}

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-mouse-slate/20">
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal placeholder-mouse-slate focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-mouse-offwhite text-left">
                <th className="px-6 py-3 text-mouse-slate font-medium">Business</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Owner</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Status</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Plan</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">MRR</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Commission</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mouse-slate/10">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-mouse-slate">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-mouse-offwhite transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-mouse-charcoal">{customer.businessName}</p>
                        <p className="text-xs text-mouse-slate">{customer.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-mouse-charcoal">{customer.ownerName}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="px-6 py-4">
                      <PlanBadge plan={customer.planTier} />
                    </td>
                    <td className="px-6 py-4 font-medium text-mouse-green">
                      ${customer.mrr.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-mouse-teal">
                      ${customer.commissionEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {customer.status === "pending_payment" && (
                          <button
                            onClick={() => handleResendInvite(customer.id)}
                            disabled={actionLoading === customer.id}
                            className="text-xs bg-mouse-teal/10 text-mouse-teal px-3 py-1.5 rounded hover:bg-mouse-teal/20 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === customer.id ? "Sending..." : "Resend Invite"}
                          </button>
                        )}
                        <a
                          href={`/dashboard/customers/${customer.id}`}
                          className="text-xs text-mouse-slate hover:text-mouse-teal transition-colors px-2 py-1.5"
                        >
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchCustomers();
        }}
      />
    </div>
  );
}
