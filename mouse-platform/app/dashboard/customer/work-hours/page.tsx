'use client';

import { useState } from 'react';
import { 
  Clock, 
  CreditCard, 
  TrendingUp, 
  History,
  Zap,
  Package,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  ShoppingCart,
  DollarSign,
  Calendar,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface WorkHoursPackage {
  id: string;
  name: string;
  hours: number;
  price: number;
  pricePerHour: number;
  popular?: boolean;
  features: string[];
}

const packages: WorkHoursPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    hours: 10,
    price: 49,
    pricePerHour: 4.90,
    features: ['Basic AI employees', 'Email support', 'Standard VMs'],
  },
  {
    id: 'pro',
    name: 'Pro',
    hours: 50,
    price: 199,
    pricePerHour: 3.98,
    popular: true,
    features: ['Advanced AI employees', 'Priority support', 'High-performance VMs', 'Screen recording'],
  },
  {
    id: 'business',
    name: 'Business',
    hours: 200,
    price: 599,
    pricePerHour: 3.00,
    features: ['All AI employee types', '24/7 support', 'Premium VMs', 'Advanced analytics', 'API access'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    hours: 1000,
    price: 2499,
    pricePerHour: 2.50,
    features: ['Custom AI training', 'Dedicated manager', 'Custom VMs', 'SLA guarantee', 'White-label option'],
  },
];

interface UsageRecord {
  id: string;
  date: string;
  employee: string;
  task: string;
  hoursUsed: number;
  cost: number;
  status: 'completed' | 'in-progress';
}

const mockUsageHistory: UsageRecord[] = [
  {
    id: '1',
    date: '2026-02-28 14:30',
    employee: 'Web Developer Knight',
    task: 'Website Redesign',
    hoursUsed: 2.5,
    cost: 9.95,
    status: 'completed',
  },
  {
    id: '2',
    date: '2026-02-28 11:15',
    employee: 'Support Agent Alice',
    task: 'Ticket Resolution',
    hoursUsed: 1.2,
    cost: 4.78,
    status: 'completed',
  },
  {
    id: '3',
    date: '2026-02-28 09:00',
    employee: 'Data Analyst Bob',
    task: 'Q1 Report Analysis',
    hoursUsed: 3.0,
    cost: 11.94,
    status: 'in-progress',
  },
  {
    id: '4',
    date: '2026-02-27 16:45',
    employee: 'Social Media Maven',
    task: 'Content Creation',
    hoursUsed: 2.0,
    cost: 7.96,
    status: 'completed',
  },
  {
    id: '5',
    date: '2026-02-27 14:20',
    employee: 'Sales Rep Sarah',
    task: 'Lead Outreach',
    hoursUsed: 1.8,
    cost: 7.16,
    status: 'completed',
  },
];

export default function WorkHoursPage() {
  const [currentBalance, setCurrentBalance] = useState(45.5);
  const [selectedPackage, setSelectedPackage] = useState<WorkHoursPackage | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const totalUsed = mockUsageHistory.reduce((sum, record) => sum + record.hoursUsed, 0);
  const totalCost = mockUsageHistory.reduce((sum, record) => sum + record.cost, 0);
  const avgCostPerHour = totalCost / totalUsed;

  const handlePurchase = () => {
    if (!selectedPackage) return;
    
    // Simulate purchase
    setTimeout(() => {
      setCurrentBalance(prev => prev + (selectedPackage.hours * purchaseQuantity));
      setPurchaseSuccess(true);
      setTimeout(() => {
        setShowPurchaseModal(false);
        setPurchaseSuccess(false);
        setSelectedPackage(null);
        setPurchaseQuantity(1);
      }, 2000);
    }, 1000);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Work Hours</h1>
            <p className="text-gray-600">Manage your AI employee work hours and billing</p>
          </div>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Purchase Hours
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-blue-200" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Available</span>
            </div>
            <p className="text-3xl font-bold">{currentBalance.toFixed(1)}</p>
            <p className="text-blue-200 text-sm">Hours Remaining</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">This Month</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalUsed.toFixed(1)}</p>
            <p className="text-gray-500 text-sm">Hours Used</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Total Cost</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
            <p className="text-gray-500 text-sm">This Month</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Avg Rate</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">${avgCostPerHour.toFixed(2)}</p>
            <p className="text-gray-500 text-sm">Per Hour</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Usage History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-[#1e3a5f] flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Usage History
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockUsageHistory.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{record.date}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{record.employee}</td>
                        <td className="px-4 py-3 text-gray-600">{record.task}</td>
                        <td className="px-4 py-3 text-gray-900">{record.hoursUsed.toFixed(1)}h</td>
                        <td className="px-4 py-3 text-green-600 font-medium">${record.cost.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {record.status === 'completed' ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {record.status === 'completed' ? 'Done' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Cost Per Action
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Web Development</p>
                  <p className="text-lg font-semibold text-gray-900">$3.98/hr</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Customer Support</p>
                  <p className="text-lg font-semibold text-gray-900">$3.50/hr</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Data Analysis</p>
                  <p className="text-lg font-semibold text-gray-900">$4.50/hr</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Sales Outreach</p>
                  <p className="text-lg font-semibold text-gray-900">$3.75/hr</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Purchase */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Popular Packages
              </h3>
              <div className="space-y-3">
                {packages.slice(0, 2).map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setShowPurchaseModal(true);
                    }}
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#1e3a5f] cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{pkg.name}</p>
                        <p className="text-sm text-gray-500">{pkg.hours} hours</p>
                      </div>
                      <span className="text-lg font-bold text-[#1e3a5f]">${pkg.price}</span>
                    </div>
                    <p className="text-xs text-green-600">${pkg.pricePerHour}/hr</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="w-full mt-4 py-2 text-[#1e3a5f] border border-[#1e3a5f] rounded-lg hover:bg-[#1e3a5f] hover:text-white transition-colors"
              >
                View All Packages
              </button>
            </div>

            {/* Low Balance Alert */}
            {currentBalance < 10 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800">Low Balance Warning</p>
                    <p className="text-sm text-yellow-600 mt-1">
                      You have less than 10 hours remaining. Purchase more to avoid interruptions.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Purchase Modal */}
        {showPurchaseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
              {purchaseSuccess ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Purchase Successful!</h3>
                  <p className="text-gray-600">
                    {selectedPackage ? selectedPackage.hours * purchaseQuantity : 0} hours have been added to your account.
                  </p>
                </div>
              ) : selectedPackage ? (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#1e3a5f]">Complete Purchase</h2>
                    <button
                      onClick={() => setSelectedPackage(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedPackage.name} Package</h3>
                        <p className="text-sm text-gray-600">{selectedPackage.hours} hours</p>
                      </div>
                      <span className="text-2xl font-bold text-[#1e3a5f]">${selectedPackage.price}</span>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">{purchaseQuantity}</span>
                        <button
                          onClick={() => setPurchaseQuantity(purchaseQuantity + 1)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-[#1e3a5f]">
                          ${selectedPackage.price * purchaseQuantity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handlePurchase}
                      className="w-full py-3 bg-[#1e3a5f] text-white rounded-xl font-semibold hover:bg-[#2d4a6f] transition-colors"
                    >
                      Complete Purchase
                    </button>
                    <button
                      onClick={() => setSelectedPackage(null)}
                      className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Back to Packages
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#1e3a5f]">Purchase Work Hours</h2>
                    <button
                      onClick={() => setShowPurchaseModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                          pkg.popular
                            ? 'border-[#1e3a5f] bg-[#1e3a5f]/5'
                            : 'border-gray-200 hover:border-[#1e3a5f]'
                        }`}
                      >
                        {pkg.popular && (
                          <span className="inline-block px-3 py-1 bg-[#1e3a5f] text-white text-xs font-medium rounded-full mb-3">
                            Most Popular
                          </span>
                        )}
                        <h3 className="font-semibold text-gray-900 mb-1">{pkg.name}</h3>
                        <p className="text-3xl font-bold text-[#1e3a5f] mb-1">
                          ${pkg.price}
                          <span className="text-base font-normal text-gray-500">/{pkg.hours} hrs</span>
                        </p>
                        <p className="text-sm text-green-600 mb-4">${pkg.pricePerHour}/hour</p>
                        <ul className="space-y-2">
                          {pkg.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
