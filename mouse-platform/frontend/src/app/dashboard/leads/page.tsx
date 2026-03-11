'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Phone, Mail, Globe, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Lead {
  id: string;
  source: string;
  name: string;
  contact: string;
  status: string;
  notes: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-teal-100 text-teal-700',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-gray-100 text-gray-500',
};

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  phone: Phone,
  email: Mail,
  web_form: Globe,
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Leads fetched from Supabase — come in via n8n webhook
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <span className="text-sm text-gray-500">{leads.length} total</span>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No leads yet</h2>
          <p className="text-gray-500 mb-6">
            KingMouse captures leads from web forms, calls, and emails automatically.
            New leads will appear here with status tracking.
          </p>
          <Link
            href="/dashboard/chat"
            className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700"
          >
            Ask KingMouse about lead capture &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {leads.map((lead) => {
            const SourceIcon = SOURCE_ICONS[lead.source] || UserPlus;
            return (
              <div key={lead.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <SourceIcon className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  <p className="text-sm text-gray-500">{lead.contact}</p>
                  {lead.notes && <p className="text-xs text-gray-400 mt-1 truncate">{lead.notes}</p>}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[lead.status] || STATUS_COLORS.new}`}>
                  {lead.status}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(lead.created_at).toLocaleDateString()}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
