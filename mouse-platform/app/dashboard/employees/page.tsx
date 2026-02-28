import Link from "next/link";
import { employees } from "@/lib/seed-data";

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

export default function EmployeesPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-mouse-navy mb-6">AI Employees</h1>

      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-mouse-offwhite text-left">
                <th className="px-6 py-3 text-mouse-slate font-medium">Name</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Role</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Customer</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Status</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Tasks Today</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Hours Saved</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Value Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mouse-slate/10">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-mouse-offwhite transition-colors">
                  <td className="px-6 py-4 font-medium text-mouse-charcoal">{emp.name}</td>
                  <td className="px-6 py-4 text-mouse-charcoal">{emp.role}</td>
                  <td className="px-6 py-4 text-mouse-charcoal">
                    <Link
                      href={`/dashboard/customers/${emp.customerId}`}
                      className="hover:text-mouse-teal transition-colors"
                    >
                      {emp.customerName}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={emp.status} />
                  </td>
                  <td className="px-6 py-4 text-mouse-charcoal">{emp.tasksToday}</td>
                  <td className="px-6 py-4 text-mouse-charcoal">{emp.hoursSaved}h</td>
                  <td className="px-6 py-4 font-medium text-mouse-green">
                    {emp.valueGenerated > 0
                      ? `$${emp.valueGenerated.toLocaleString()}`
                      : "—"}
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
