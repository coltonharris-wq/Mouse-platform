"use client";

import Link from "next/link";
import { getAuthHeaders } from "@/lib/admin-auth";
import { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Mail, 
  MoreHorizontal, 
  Edit, 
  PauseCircle, 
  PlayCircle,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react";

interface Customer {
  id: string;
  company: string;
  email: string;
  plan: string;
  status: string;
  mrr: number;
  resellerId: string;
  resellerName: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeSubscriptionStatus?: string;
  createdAt: string;
  updatedAt: string;
}

interface Reseller {
  id: string;
  name: string;
  email: string;
  status: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-600",
    suspended: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
    warning: "bg-yellow-100 text-yellow-700",
    critical: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
    pending: "Pending",
    warning: "Warning",
    critical: "Critical",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    Enterprise: "bg-mouse-teal/10 text-mouse-teal",
    Growth: "bg-blue-100 text-blue-700",
    Starter: "bg-gray-100 text-gray-600",
    Pro: "bg-mouse-teal/10 text-mouse-teal",
    Basic: "bg-gray-100 text-gray-600",
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

// Edit Customer Modal
function EditCustomerModal({ 
  customer, 
  resellers, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  customer: Customer | null;
  resellers: Reseller[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    company: '',
    email: '',
    plan: 'Starter',
    status: 'active',
    reseller_id: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        company: customer.company || '',
        email: customer.email || '',
        plan: customer.plan || 'Starter',
        status: customer.status || 'active',
        reseller_id: customer.resellerId || '',
      });
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(customer.id, {
        company_name: formData.company,
        email: formData.email,
        plan_tier: formData.plan.toLowerCase(),
        status: formData.status,
        reseller_id: formData.reseller_id,
      });
      onClose();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Customer</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
            >
              <option value="Starter">Starter</option>
              <option value="Growth">Growth</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reseller</label>
            <select
              value={formData.reseller_id}
              onChange={(e) => setFormData({ ...formData, reseller_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
            >
              {resellers.map((reseller) => (
                <option key={reseller.id} value={reseller.id}>
                  {reseller.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Customer Details Modal
function CustomerDetailsModal({ 
  customer, 
  isOpen, 
  onClose 
}: { 
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Customer Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Company</label>
              <p className="font-medium text-gray-900">{customer.company}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium text-gray-900">{customer.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Plan</label>
              <p className="font-medium"><PlanBadge plan={customer.plan} /></p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <p className="font-medium"><StatusBadge status={customer.status} /></p>
            </div>
            <div>
              <label className="text-sm text-gray-500">MRR</label>
              <p className="font-medium text-green-600">${customer.mrr.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Reseller</label>
              <p className="font-medium text-gray-900">{customer.resellerName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Customer ID</label>
              <p className="font-medium text-gray-500 text-sm">{customer.id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Created</label>
              <p className="font-medium text-gray-900">
                {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {customer.stripeCustomerId && (
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">Stripe Information</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Customer ID:</span>{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded">{customer.stripeCustomerId}</code>
                </div>
                {customer.stripeSubscriptionId && (
                  <div>
                    <span className="text-gray-500">Subscription ID:</span>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded">{customer.stripeSubscriptionId}</code>
                  </div>
                )}
                {customer.stripeSubscriptionStatus && (
                  <div>
                    <span className="text-gray-500">Subscription Status:</span>{' '}
                    <span className="capitalize">{customer.stripeSubscriptionStatus}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resellerFilter, setResellerFilter] = useState("all");
  
  // Modals
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Actions
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (planFilter !== 'all') params.append('plan', planFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (resellerFilter !== 'all') params.append('reseller', resellerFilter);
      
      const response = await fetch(`/api/admin/customers?${params.toString()}`, { headers: getAuthHeaders() });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  }, [search, planFilter, statusFilter, resellerFilter]);

  // Fetch resellers
  const fetchResellers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/resellers', { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setResellers(data.resellers || []);
      }
    } catch (err) {
      console.error('Error fetching resellers:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCustomers();
    fetchResellers();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, planFilter, statusFilter, resellerFilter]);

  // Update customer
  const handleUpdateCustomer = async (id: string, data: any) => {
    const response = await fetch(`/api/admin/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update customer');
    }
    fetchCustomers();
  };

  // Suspend/Activate customer
  const handleToggleStatus = async (id: string, action: 'suspend' | 'activate') => {
    setIsActionLoading(id);
    try {
      const response = await fetch(`/api/admin/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} customer`);
      }
      fetchCustomers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }
    setIsActionLoading(id);
    try {
      const response = await fetch(`/api/admin/customers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete customer');
      }
      fetchCustomers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  // Export to CSV
  const handleExport = () => {
    const csvContent = [
      ['ID', 'Company', 'Email', 'Plan', 'Status', 'MRR', 'Reseller', 'Created At'].join(','),
      ...customers.map(c => [
        c.id,
        `"${c.company}"`,
        c.email,
        c.plan,
        c.status,
        c.mrr,
        `"${c.resellerName}"`,
        c.createdAt,
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalMrr = customers.reduce((sum, c) => sum + c.mrr, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-mouse-navy">Customers</h1>
          <p className="text-sm text-mouse-slate mt-1">
            {customers.length} customers · ${totalMrr.toLocaleString()} MRR
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCustomers}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Error loading customers</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchCustomers}
            className="text-sm underline mt-1 hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mouse-slate" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal placeholder-mouse-slate focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-mouse-slate" />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-mouse-slate/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
            >
              <option value="all">All Plans</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Growth">Growth</option>
              <option value="Starter">Starter</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-mouse-slate/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={resellerFilter}
              onChange={(e) => setResellerFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-mouse-slate/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
            >
              <option value="all">All Resellers</option>
              {resellers.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-mouse-offwhite text-left">
                <th className="px-6 py-3 text-mouse-slate font-medium">Name</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Email</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Plan</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Status</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">MRR</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Reseller</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mouse-slate/10">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-mouse-slate">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Loading customers...
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-mouse-slate">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-mouse-offwhite transition-colors"
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsDetailsModalOpen(true);
                        }}
                        className="font-medium text-mouse-charcoal hover:text-mouse-teal transition-colors text-left"
                      >
                        {customer.company}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-mouse-charcoal">
                        <Mail size={14} className="text-mouse-slate" />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <PlanBadge plan={customer.plan} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="px-6 py-4 font-medium text-green-600">
                      ${customer.mrr.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-mouse-charcoal">
                      {customer.resellerName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsDetailsModalOpen(true);
                          }}
                          className="p-1.5 text-mouse-slate hover:text-mouse-teal hover:bg-gray-100 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-mouse-slate hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Customer"
                        >
                          <Edit size={16} />
                        </button>
                        {customer.status === 'suspended' ? (
                          <button
                            onClick={() => handleToggleStatus(customer.id, 'activate')}
                            disabled={isActionLoading === customer.id}
                            className="p-1.5 text-mouse-slate hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                            title="Activate Account"
                          >
                            <PlayCircle size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(customer.id, 'suspend')}
                            disabled={isActionLoading === customer.id}
                            className="p-1.5 text-mouse-slate hover:text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
                            title="Suspend Account"
                          >
                            <PauseCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          disabled={isActionLoading === customer.id}
                          className="p-1.5 text-mouse-slate hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Delete Customer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-mouse-slate/20 flex items-center justify-between">
          <p className="text-sm text-mouse-slate">
            Showing {customers.length} customers
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="px-3 py-1.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-slate disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal hover:bg-mouse-offwhite transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditCustomerModal
        customer={selectedCustomer}
        resellers={resellers}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCustomer(null);
        }}
        onSave={handleUpdateCustomer}
      />

      {/* Details Modal */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCustomer(null);
        }}
      />
    </div>
  );
}
