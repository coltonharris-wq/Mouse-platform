'use client';

import { useEffect, useState } from 'react';
import { Phone, PhoneIncoming, Clock, Building2 } from 'lucide-react';
import type { ResellerBusiness } from '@/types/reseller-dashboard';

interface CallLog {
  id: string;
  customer_id: string;
  caller_number: string;
  duration_seconds: number;
  status: string;
  created_at: string;
}

interface BusinessCallStats {
  business: ResellerBusiness;
  phone_number: string | null;
  total_calls: number;
  avg_duration: number;
  last_call: string | null;
  calls: CallLog[];
}

export default function VoicePage() {
  const [stats, setStats] = useState<BusinessCallStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBiz, setExpandedBiz] = useState<string | null>(null);

  const resellerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('reseller_id') || ''
    : '';

  useEffect(() => {
    if (!resellerId) { setLoading(false); return; }

    (async () => {
      try {
        // Get businesses
        const bizRes = await fetch(`/api/reseller/businesses?reseller_id=${resellerId}`);
        const bizData = await bizRes.json();
        const businesses: ResellerBusiness[] = bizData.businesses || [];

        // For each active business with a customer_id, get call stats
        const statsArr: BusinessCallStats[] = [];
        for (const biz of businesses) {
          if (!biz.customer_id) {
            statsArr.push({
              business: biz,
              phone_number: null,
              total_calls: 0,
              avg_duration: 0,
              last_call: null,
              calls: [],
            });
            continue;
          }

          try {
            const callRes = await fetch(`/api/receptionist/calls?customer_id=${biz.customer_id}`);
            const callData = await callRes.json();
            const calls: CallLog[] = callData.calls || [];

            const totalCalls = calls.length;
            const avgDuration = totalCalls > 0
              ? Math.round(calls.reduce((s: number, c: CallLog) => s + (c.duration_seconds || 0), 0) / totalCalls)
              : 0;
            const lastCall = calls.length > 0 ? calls[0].created_at : null;

            // Try to get phone number
            const configRes = await fetch(`/api/receptionist/config?customer_id=${biz.customer_id}`);
            const configData = await configRes.json();
            const phoneNumber = configData.phone_numbers?.[0]?.phone_number || null;

            statsArr.push({
              business: biz,
              phone_number: phoneNumber,
              total_calls: totalCalls,
              avg_duration: avgDuration,
              last_call: lastCall,
              calls: calls.slice(0, 10),
            });
          } catch {
            statsArr.push({
              business: biz,
              phone_number: null,
              total_calls: 0,
              avg_duration: 0,
              last_call: null,
              calls: [],
            });
          }
        }

        setStats(statsArr);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [resellerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Voice</h1>
      <p className="text-gray-500 text-sm mb-6">AI Receptionist activity across your businesses.</p>

      {stats.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Phone className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No businesses yet. Add businesses to see call activity.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Business</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Phone</th>
                  <th className="px-4 py-3 text-center">Total Calls</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">Avg Duration</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Last Call</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.map((s) => (
                  <>
                    <tr
                      key={s.business.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedBiz(expandedBiz === s.business.id ? null : s.business.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{s.business.business_name}</p>
                            <p className="text-xs text-gray-400">{s.business.pro_slug || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{s.phone_number || 'No number'}</td>
                      <td className="px-4 py-3 text-center text-sm font-medium">{s.total_calls}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600 hidden sm:table-cell">
                        {s.avg_duration > 0 ? `${Math.floor(s.avg_duration / 60)}m ${s.avg_duration % 60}s` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-400 hidden sm:table-cell">
                        {s.last_call ? new Date(s.last_call).toLocaleString() : 'No calls'}
                      </td>
                    </tr>
                    {expandedBiz === s.business.id && s.calls.length > 0 && (
                      <tr key={`${s.business.id}-calls`}>
                        <td colSpan={5} className="px-4 py-3 bg-gray-50">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent Calls</p>
                          <div className="space-y-2">
                            {s.calls.map((call) => (
                              <div key={call.id} className="flex items-center gap-3 text-sm">
                                <PhoneIncoming className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-gray-700">{call.caller_number || 'Unknown'}</span>
                                <span className="flex items-center gap-1 text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  {call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s` : '-'}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  call.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {call.status}
                                </span>
                                <span className="ml-auto text-gray-400 text-xs">
                                  {new Date(call.created_at).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
