import Link from "next/link";
import React from "react";
import { customers, employees, invoices } from "@/lib/seed-data";
import { notFound } from "next/navigation";

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
    Enterprise: "bg-purple-100 text-purple-700",
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

function InvoiceStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        status === "paid"
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const customer = customers.find((c) => c.id === id);

  if (!customer) {
    notFound();
  }

  const customerEmployees = employees.filter((e) => e.customerId === customer.id);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/customers"
          className="text-sm text-mouse-teal hover:underline font-medium"
        >
          &larr; Back to Customers
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

      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-mouse-slate/20">
          <h2 className="text-base font-semibold text-mouse-charcoal">
            AI Employees
          </h2>
        </div>
        {customerEmployees.length === 0 ? (
          <div className="px-6 py-8 text-center text-mouse-slate text-sm">
            No employees assigned to this customer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-mouse-offwhite text-left">
                  <th className="px-6 py-3 text-mouse-slate font-medium">Name</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Role</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Status</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Tasks Today</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Hours Saved</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Value Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mouse-slate/10">
                {customerEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-mouse-offwhite transition-colors">
                    <td className="px-6 py-4 font-medium text-mouse-charcoal">
                      {emp.name}
                    </td>
                    <td className="px-6 py-4 text-mouse-charcoal">{emp.role}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="px-6 py-4 text-mouse-charcoal">{emp.tasksToday}</td>
                    <td className="px-6 py-4 text-mouse-charcoal">{emp.hoursSaved}h</td>
                    <td className="px-6 py-4 text-mouse-green font-medium">
                      ${emp.valueGenerated.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-mouse-slate/20">
          <h2 className="text-base font-semibold text-mouse-charcoal">
            Billing History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-mouse-offwhite text-left">
                <th className="px-6 py-3 text-mouse-slate font-medium">Invoice</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Date</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Amount</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mouse-slate/10">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-mouse-offwhite transition-colors">
                  <td className="px-6 py-4 text-mouse-charcoal">{inv.plan}</td>
                  <td className="px-6 py-4 text-mouse-slate">
                    {new Date(inv.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 font-medium text-mouse-charcoal">
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
