"use client";

import { useEffect, useState } from "react";

interface Employee {
  id: string;
  name: string;
  role: string;
  status: string;
  task_description: string;
  vm_id: string;
  created_at: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeployForm, setShowDeployForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "web_developer",
    task_description: ""
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/v1/customers/demo/employees", {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}` }
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const deployEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/customers/demo/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
        },
        body: JSON.stringify(newEmployee)
      });
      const data = await res.json();
      if (data.success) {
        setEmployees([...employees, data.employee]);
        setShowDeployForm(false);
        setNewEmployee({ name: "", role: "web_developer", task_description: "" });
      }
    } catch (error) {
      console.error("Failed to deploy employee:", error);
    }
  };

  if (loading) return <div className="p-8">Loading employees...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">AI Employees</h1>
        <button
          onClick={() => setShowDeployForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Deploy Employee
        </button>
      </div>

      {showDeployForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Deploy New AI Employee</h2>
          <form onSubmit={deployEmployee} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., Alex"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="web_developer">Web Developer</option>
                <option value="social_media">Social Media Manager</option>
                <option value="content_writer">Content Writer</option>
                <option value="data_analyst">Data Analyst</option>
                <option value="customer_support">Customer Support</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Task Description</label>
              <textarea
                value={newEmployee.task_description}
                onChange={(e) => setNewEmployee({...newEmployee, task_description: e.target.value})}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="What should this employee work on?"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Deploy
              </button>
              <button
                type="button"
                onClick={() => setShowDeployForm(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {employees.map((emp) => (
          <div key={emp.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{emp.name}</h3>
                <p className="text-sm text-gray-600">{emp.role.replace('_', ' ')}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                emp.status === 'active' ? 'bg-green-100 text-green-800' :
                emp.status === 'idle' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {emp.status}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{emp.task_description}</p>
            <p className="text-xs text-gray-400">
              VM: {emp.vm_id?.substring(0, 8)}... | 
              Created: {new Date(emp.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {employees.length === 0 && !showDeployForm && (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">No AI employees deployed yet.</p>
          <button
            onClick={() => setShowDeployForm(true)}
            className="text-blue-500 hover:underline"
          >
            Deploy your first employee
          </button>
        </div>
      )}
    </div>
  );
}
