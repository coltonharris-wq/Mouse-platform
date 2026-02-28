"use client";

import { useEffect, useState } from "react";

interface TokenPackage {
  slug: string;
  name: string;
  tokens: number;
  price: number;
  description: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

const TOKEN_PACKAGES: TokenPackage[] = [
  { slug: "starter", name: "Starter", tokens: 1900, price: 19, description: "Perfect for trying out" },
  { slug: "growth", name: "Growth", tokens: 5300, price: 49, description: "Best value for small teams" },
  { slug: "enterprise", name: "Enterprise", tokens: 11500, price: 99, description: "For power users" }
];

export default function TokensPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/v1/customers/demo/tokens/balance", {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}` }
      });
      const data = await res.json();
      if (data.success) {
        setBalance(data.balance?.amount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/v1/customers/demo/tokens/transactions?limit=10", {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}` }
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseTokens = async (pkg: TokenPackage) => {
    setPurchasing(pkg.slug);
    try {
      const res = await fetch("/api/v1/customers/demo/tokens/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
        },
        body: JSON.stringify({
          package_slug: pkg.slug,
          success_url: `${window.location.origin}/tokens?success=true`,
          cancel_url: `${window.location.origin}/tokens?canceled=true`
        })
      });
      const data = await res.json();
      if (data.success && data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error("Failed to create checkout:", error);
      setPurchasing(null);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Token Management</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-8">
        <p className="text-sm opacity-80">Current Balance</p>
        <p className="text-4xl font-bold">{balance.toLocaleString()} tokens</p>
        <p className="text-sm opacity-80 mt-2">
          Tokens are used to deploy and run AI employees
        </p>
      </div>

      {/* Purchase Packages */}
      <h2 className="text-xl font-semibold mb-4">Purchase Tokens</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {TOKEN_PACKAGES.map((pkg) => (
          <div key={pkg.slug} className="border rounded-lg p-6 text-center hover:shadow-lg transition">
            <h3 className="text-lg font-semibold">{pkg.name}</h3>
            <p className="text-3xl font-bold text-blue-600 my-2">
              {pkg.tokens.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mb-4">tokens</p>
            <p className="text-gray-700 mb-4">{pkg.description}</p>
            <p className="text-2xl font-bold mb-4">${pkg.price}</p>
            <button
              onClick={() => purchaseTokens(pkg)}
              disabled={purchasing === pkg.slug}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {purchasing === pkg.slug ? "Processing..." : "Purchase"}
            </button>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Type</th>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Amount</th>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Description</th>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t">
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    tx.type === 'credit' || tx.type === 'purchase' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="p-3 font-medium">
                  {tx.type === 'credit' || tx.type === 'purchase' ? '+' : '-'}
                  {tx.amount}
                </td>
                <td className="p-3 text-gray-700">{tx.description}</td>
                <td className="p-3 text-sm text-gray-500">
                  {new Date(tx.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No transactions yet
          </div>
        )}
      </div>
    </div>
  );
}
