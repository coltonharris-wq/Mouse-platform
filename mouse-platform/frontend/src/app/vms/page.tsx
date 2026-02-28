"use client";

import { useEffect, useState } from "react";

interface VM {
  id: string;
  name: string;
  status: string;
  role: string;
  created_at: string;
}

export default function VMsPage() {
  const [vms, setVms] = useState<VM[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVM, setSelectedVM] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  useEffect(() => {
    fetchVMs();
  }, []);

  const fetchVMs = async () => {
    try {
      const res = await fetch("/api/v1/customers/demo/vms", {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}` }
      });
      const data = await res.json();
      if (data.success) {
        setVms(data.vms);
      }
    } catch (error) {
      console.error("Failed to fetch VMs:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewScreenshot = async (vmId: string) => {
    setSelectedVM(vmId);
    try {
      const res = await fetch(`/api/v1/customers/demo/vms/${vmId}/screenshot`, {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}` }
      });
      const data = await res.json();
      if (data.success) {
        setScreenshot(data.screenshot);
      }
    } catch (error) {
      console.error("Failed to fetch screenshot:", error);
    }
  };

  if (loading) return <div className="p-8">Loading VMs...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My VMs</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vms.map((vm) => (
          <div key={vm.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{vm.name}</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                vm.status === 'running' ? 'bg-green-100 text-green-800' :
                vm.status === 'stopped' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {vm.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Role: {vm.role}</p>
            <p className="text-xs text-gray-400">
              Created: {new Date(vm.created_at).toLocaleDateString()}
            </p>
            <button
              onClick={() => viewScreenshot(vm.id)}
              className="mt-3 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              View Live
            </button>
          </div>
        ))}
      </div>

      {vms.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No VMs deployed yet. Create your first AI employee to get started.
        </div>
      )}

      {selectedVM && screenshot && (
        <div className="mt-8 border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Live View: {selectedVM}</h2>
          <img 
            src={`data:image/png;base64,${screenshot}`} 
            alt="VM Screenshot" 
            className="w-full rounded border"
          />
        </div>
      )}
    </div>
  );
}
