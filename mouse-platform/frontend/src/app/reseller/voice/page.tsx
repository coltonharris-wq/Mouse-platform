'use client';

import { useEffect, useState } from 'react';
import {
  Phone, PhoneIncoming, Clock, Building2, Pause, Play, Pencil, Loader2
} from 'lucide-react';
import VoiceAgentBuilder from '@/components/reseller/VoiceAgentBuilder';

interface VoiceAgent {
  id: string;
  business_id: string;
  business_name: string;
  phone_number: string;
  twilio_sid: string;
  status: 'active' | 'paused';
  greeting: string;
  voice_id: string;
  business_hours: unknown;
  calls_today: number;
  avg_duration: number;
}

type View = 'builder' | 'manage';

export default function VoicePage() {
  const [view, setView] = useState<View>('builder');
  const [agents, setAgents] = useState<VoiceAgent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Test call state
  const [testModalAgent, setTestModalAgent] = useState<VoiceAgent | null>(null);
  const [testPhone, setTestPhone] = useState('');
  const [testingCall, setTestingCall] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const resellerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('reseller_id') || ''
    : '';

  const loadAgents = async () => {
    if (!resellerId) return;
    setLoadingAgents(true);
    try {
      const res = await fetch(`/api/reseller/voice/agents?reseller_id=${resellerId}`);
      const data = await res.json();
      setAgents(data.agents || []);
    } catch { /* ignore */ }
    setLoadingAgents(false);
  };

  useEffect(() => {
    if (view === 'manage') loadAgents();
  }, [view, resellerId]);

  const handleTogglePause = async (agent: VoiceAgent) => {
    setTogglingId(agent.id);
    try {
      await fetch('/api/receptionist/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: agent.id,
          is_enabled: agent.status !== 'active',
        }),
      });
      await loadAgents();
    } catch { /* ignore */ }
    setTogglingId(null);
  };

  const handleTestCall = async () => {
    if (!testPhone || !testModalAgent) return;
    setTestingCall(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/reseller/voice/test-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number_to_call: testPhone,
          greeting: testModalAgent.greeting || 'Hello! This is your AI receptionist.',
          voice_tone: 'Professional',
        }),
      });
      const data = await res.json();
      setTestResult(data.success ? 'Call initiated! Check your phone.' : data.error || 'Test call failed');
    } catch {
      setTestResult('Failed to initiate test call');
    } finally {
      setTestingCall(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '-';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div>
      {/* Header with view toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voice Builder</h1>
          <p className="text-gray-500 text-sm mt-1">Build and manage AI phone agents for your businesses</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setView('builder')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              view === 'builder'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Builder
          </button>
          <button
            onClick={() => setView('manage')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              view === 'manage'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Manage
          </button>
        </div>
      </div>

      {/* Builder View */}
      {view === 'builder' && (
        <VoiceAgentBuilder
          resellerId={resellerId}
          onDeployed={() => {
            setView('manage');
            loadAgents();
          }}
        />
      )}

      {/* Manage View */}
      {view === 'manage' && (
        <>
          {loadingAgents ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Phone className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="mb-4">No voice agents deployed yet.</p>
              <button
                onClick={() => setView('builder')}
                className="px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                Build Your First Agent
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Business</th>
                      <th className="px-4 py-3 text-left hidden sm:table-cell">Phone</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center hidden sm:table-cell">Calls Today</th>
                      <th className="px-4 py-3 text-center hidden sm:table-cell">Avg Duration</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {agents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900 text-sm">{agent.business_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                          {agent.phone_number}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                            agent.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              agent.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                            }`} />
                            {agent.status === 'active' ? 'Active' : 'Paused'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-medium hidden sm:table-cell">
                          {agent.calls_today}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 hidden sm:table-cell">
                          {formatDuration(agent.avg_duration)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setTestModalAgent(agent)}
                              className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Test"
                            >
                              <PhoneIncoming className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleTogglePause(agent)}
                              disabled={togglingId === agent.id}
                              className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                              title={agent.status === 'active' ? 'Pause' : 'Resume'}
                            >
                              {togglingId === agent.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : agent.status === 'active' ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Test Call Modal (manage view) */}
      {testModalAgent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setTestModalAgent(null); setTestResult(null); }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Test: {testModalAgent.business_name}</h3>
            <p className="text-sm text-gray-500 mb-4">Enter your phone number to receive a test call.</p>
            <input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+19105551234"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent mb-4"
            />
            {testResult && (
              <p className="text-sm text-teal-700 bg-teal-50 rounded-lg px-3 py-2 mb-4">{testResult}</p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setTestModalAgent(null); setTestResult(null); setTestPhone(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleTestCall}
                disabled={testingCall || !testPhone}
                className="px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {testingCall ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calling...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    Call Me
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
