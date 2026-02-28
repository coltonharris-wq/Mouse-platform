'use client';

import Sidebar from '../../../components/layout/Sidebar';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  Edit, 
  MoreHorizontal,
  Check,
  Clock,
  MessageSquare,
  FileText,
  User,
  Building,
  DollarSign,
  Tag
} from 'lucide-react';
import Link from 'next/link';

const activities = [
  { id: '1', type: 'call', description: 'Initial discovery call completed', createdBy: 'You', createdAt: '2 hours ago' },
  { id: '2', type: 'email', description: 'Sent follow-up email with proposal', createdBy: 'You', createdAt: '5 hours ago' },
  { id: '3', type: 'note', description: 'Lead interested in enterprise plan. Budget confirmed at $50K.', createdBy: 'You', createdAt: '1 day ago' },
  { id: '4', type: 'meeting', description: 'Demo scheduled for next week', createdBy: 'System', createdAt: '2 days ago' },
];

const statusHistory = [
  { status: 'New', date: 'Jan 15, 2026', by: 'System' },
  { status: 'Contacted', date: 'Jan 16, 2026', by: 'John Doe' },
  { status: 'Qualified', date: 'Jan 18, 2026', by: 'John Doe' },
];

export default function LeadDetailPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="sales" />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Link */}
          <Link href="/sales/leads" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Leads
          </Link>

          {/* Lead Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                  J
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">John Smith</h1>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Building className="w-4 h-4" />
                    Acme Corp
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Qualified
                </span>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Edit className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-200">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Email</span>
                </div>
                <div className="text-gray-900">john@acme.com</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Phone</span>
                </div>
                <div className="text-gray-900">+1 (555) 123-4567</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Deal Value</span>
                </div>
                <div className="text-gray-900 font-medium">$50,000</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm">Source</span>
                </div>
                <div className="text-gray-900">Website</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Activity Timeline */}
            <div className="col-span-2">
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                        <MessageSquare className="w-4 h-4" />
                        Log Call
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Mail className="w-4 h-4" />
                        Send Email
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {activities.map((activity, index) => (
                      <div key={activity.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'call' ? 'bg-green-100 text-green-600' :
                            activity.type === 'email' ? 'bg-blue-100 text-blue-600' :
                            activity.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {activity.type === 'call' && <Phone className="w-5 h-5" />}
                            {activity.type === 'email' && <Mail className="w-5 h-5" />}
                            {activity.type === 'meeting' && <Calendar className="w-5 h-5" />}
                            {activity.type === 'note' && <FileText className="w-5 h-5" />}
                          </div>
                          {index < activities.length - 1 && (
                            <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 capitalize">{activity.type}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">{activity.createdBy}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{activity.createdAt}</span>
                          </div>
                          <p className="text-gray-700">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Status History */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Status History</h3>
                <div className="space-y-3">
                  {statusHistory.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-900">{item.status}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">{item.date}</div>
                        <div className="text-xs text-gray-500">by {item.by}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Schedule Meeting</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Create Proposal</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Assign to Rep</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
