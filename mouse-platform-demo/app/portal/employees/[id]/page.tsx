"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, Activity, Clock, Bot, Loader2,
  Server, Cpu, HardDrive, Globe,
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  role: string;
  status: string;
  type?: string;
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Try to fetch from marketplace employees in Supabase
        const res = await fetch("/api/marketplace/employees");
        if (res.ok) {
          const data = await res.json();
          const emp = (data.employees || []).find((e: any) => e.id === id);
          if (emp) {
            setEmployee({
              id: emp.id,
              name: emp.name,
              role: emp.role || emp.specialty || "AI Employee",
              status: emp.status || "available",
              type: emp.type,
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

  if (notFound || !employee) {
    return (
      <div className="text-center py-20">
        <Bot className="w-12 h-12 text-mouse-slate/30 mx-auto mb-4" />
        <p className="text-lg font-medium text-mouse-charcoal mb-2">Employee not found</p>
        <p className="text-sm text-mouse-slate mb-4">This AI employee may not be deployed yet.</p>
        <Link href="/portal/employees" className="text-sm text-mouse-teal hover:underline">
          ← Back to My Employees
        </Link>
      </div>
    );
  }

  const statusColor = {
    active: "bg-green-100 text-green-700",
    available: "bg-blue-100 text-blue-700",
    deploying: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
  }[employee.status] || "bg-gray-100 text-gray-600";

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/portal/employees"
          className="inline-flex items-center gap-1 text-sm text-mouse-teal hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Employees
        </Link>
      </div>

      {/* Employee Header */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-mouse-teal/10 flex items-center justify-center">
            <Bot className="w-7 h-7 text-mouse-teal" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-mouse-navy">{employee.name}</h1>
            <p className="text-sm text-mouse-slate">{employee.role}</p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor}`}>
                {employee.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* VM Info — placeholder until deployment */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-mouse-charcoal flex items-center gap-2 mb-4">
          <Server className="w-4 h-4 text-mouse-teal" />
          Virtual Machine
        </h2>
        <div className="text-center py-8">
          <Server className="w-10 h-10 text-mouse-slate/30 mx-auto mb-3" />
          <p className="text-sm text-mouse-slate">No VM assigned yet</p>
          <p className="text-xs text-mouse-slate/70 mt-1">
            A virtual machine will be provisioned when this employee is deployed.
          </p>
        </div>
      </div>

      {/* Activity Feed — empty */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
        <h2 className="text-base font-semibold text-mouse-charcoal flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-mouse-teal" />
          Activity Feed
        </h2>
        <div className="text-center py-8">
          <Clock className="w-10 h-10 text-mouse-slate/30 mx-auto mb-3" />
          <p className="text-sm text-mouse-slate">No activity yet</p>
          <p className="text-xs text-mouse-slate/70 mt-1">
            Activity will appear here once this employee starts working.
          </p>
        </div>
      </div>
    </div>
  );
}
