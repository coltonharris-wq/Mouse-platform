"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle, Mail, Building2, User, Phone, ExternalLink } from "lucide-react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCustomerModal({ isOpen, onClose, onSuccess }: AddCustomerModalProps) {
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    customer: any;
    paymentLink: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth("/api/reseller/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add customer");
      }

      setSuccessData(data);
      
      // Notify parent to refresh list
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ businessName: "", ownerName: "", email: "", phone: "" });
    setError(null);
    setSuccessData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-mouse-navy">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Building2 className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {successData ? "Customer Added!" : "Add New Customer"}
              </h2>
              <p className="text-white/60 text-xs">
                {successData ? "Onboarding email sent" : "Create a new customer account"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={20} className="text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {successData ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-mouse-charcoal mb-2">
                {successData.customer.businessName}
              </h3>
              <p className="text-sm text-mouse-slate mb-4">
                Has been added and an onboarding email was sent to {successData.customer.email}
              </p>
              
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-4">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Payment Required
                </p>
                <p className="text-xs text-blue-600 mb-3">
                  The customer needs to complete payment to activate their account.
                </p>
                <a
                  href={successData.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Copy Payment Link
                </a>
              </div>

              <button
                onClick={handleClose}
                className="text-sm text-mouse-teal hover:underline"
              >
                Close and view customers
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-start gap-2">
                  <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Business Name Field */}
              <div>
                <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
                  Business Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mouse-slate" />
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    placeholder="Acme Inc."
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal placeholder-mouse-slate focus:outline-none focus:ring-2 focus:ring-mouse-teal/30 focus:border-mouse-teal"
                  />
                </div>
              </div>

              {/* Owner Name Field */}
              <div>
                <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
                  Owner/Contact Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mouse-slate" />
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerName: e.target.value })
                    }
                    placeholder="John Smith"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal placeholder-mouse-slate focus:outline-none focus:ring-2 focus:ring-mouse-teal/30 focus:border-mouse-teal"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mouse-slate" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="john@company.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal placeholder-mouse-slate focus:outline-none focus:ring-2 focus:ring-mouse-teal/30 focus:border-mouse-teal"
                  />
                </div>
                <p className="text-xs text-mouse-slate mt-1">
                  Onboarding email will be sent to this address
                </p>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mouse-slate" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(555) 123-4567"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal placeholder-mouse-slate focus:outline-none focus:ring-2 focus:ring-mouse-teal/30 focus:border-mouse-teal"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-mouse-orange text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding Customer...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4" />
                      Add Customer
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
