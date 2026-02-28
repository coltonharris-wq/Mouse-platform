import Link from "next/link";
import { employees } from "@/lib/seed-data";

interface Employee {
  id: string;
  name: string;
  role: string;
  status: string;
  fteEquivalent: number;
  costPerMonth: number;
  tasksToday: number;
  valueGenerated: number;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-mouse-green text-white",
    working: "bg-mouse-teal text-white",
    idle: "bg-mouse-slate text-white",
    error: "bg-mouse-red text-white",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
        styles[status] ?? "bg-gray-400 text-white"
      }`}
    >
      {status}
    </span>
  );
}

export default function PortalEmployeesPage() {
  const myEmployees: Employee[] = employees.filter(
    (e) => e.customerId === "cust-001"
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mouse-charcoal">
          Your AI Workforce
        </h1>
        <p className="text-mouse-slate text-sm mt-1">
          Active digital employees working for Redwood Construction Co.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {myEmployees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-mouse-navy rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">
                  {emp.name[0]}
                </span>
              </div>
              <StatusBadge status={emp.status} />
            </div>

            {/* Name and role */}
            <div className="mb-4">
              <h3 className="font-bold text-mouse-charcoal text-lg leading-tight">
                {emp.name}
              </h3>
              <p className="text-mouse-slate text-sm mt-0.5">{emp.role}</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-mouse-slate/10 mb-4">
              <div className="text-center">
                <div className="text-mouse-charcoal font-bold text-sm">
                  {emp.tasksToday}
                </div>
                <div className="text-mouse-slate text-xs mt-0.5">
                  Tasks Today
                </div>
              </div>
              <div className="text-center">
                <div className="text-mouse-charcoal font-bold text-sm">
                  {emp.fteEquivalent} FTE
                </div>
                <div className="text-mouse-slate text-xs mt-0.5">
                  Equivalent
                </div>
              </div>
              <div className="text-center">
                <div className="text-mouse-charcoal font-bold text-sm">
                  ${emp.costPerMonth.toLocaleString()}
                </div>
                <div className="text-mouse-slate text-xs mt-0.5">Cost/mo</div>
              </div>
            </div>

            {/* View Details link */}
            <Link
              href={`/portal/employees/${emp.id}`}
              className="block text-center text-mouse-teal text-sm font-medium hover:underline pt-3 border-t border-mouse-slate/10"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
