"use client";

import { useState, useEffect } from "react";
import { Users, AlertCircle } from "lucide-react";

interface Reseller {
  id: string;
  name: string;
  email: string;
  status: string;
  stripe_onboarding_status: string;
  stripe_charges_enabled: boolean;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending_verification: "bg-yellow-100 text-yellow-700",
    suspended: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    pending_verification: "Pending",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[status] || status}
    </span>
  );
}

export default function AdminResellersPage() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/resellers")
      .then((r) => r.json())
      .then((data) => setResellers(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = resellers.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-mouse-navy">Resellers</h1>
        <span className="text-sm text-gray-400">{resellers.length} total</span>
      </div>

      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-mouse-slate/20">
          <input
            type="text"
            placeholder="Search resellers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal placeholder-mouse-slate focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
          />
        </div>
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                {resellers.length === 0 ? "No resellers yet" : "No resellers match your search"}
              </p>
              {resellers.length === 0 && (
                <p className="text-gray-400 text-sm mt-1">Resellers will appear here once they sign up.</p>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-mouse-offwhite text-left">
                  <th className="px-6 py-3 text-mouse-slate font-medium">Name</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Email</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Status</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Stripe</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mouse-slate/10">
                {filtered.map((reseller) => (
                  <tr key={reseller.id} className="hover:bg-mouse-offwhite transition-colors">
                    <td className="px-6 py-4 font-medium text-mouse-charcoal">{reseller.name}</td>
                    <td className="px-6 py-4 text-gray-600">{reseller.email}</td>
                    <td className="px-6 py-4"><StatusBadge status={reseller.status} /></td>
                    <td className="px-6 py-4">
                      <StatusBadge status={reseller.stripe_onboarding_status} />
                    </td>
                    <td className="px-6 py-4 text-mouse-slate">
                      {new Date(reseller.created_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
