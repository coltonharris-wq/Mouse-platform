'use client';

import { useState, useEffect } from 'react';
import {
  Globe, Loader2, Phone, Mic, Clock, MessageSquare,
  CalendarCheck, PhoneForwarded, HelpCircle, Search,
  CheckCircle2, X
} from 'lucide-react';
import type { ResellerBusiness } from '@/types/reseller-dashboard';

interface VoiceAgentBuilderProps {
  resellerId: string;
  onDeployed?: (agent: { agent_id: string; phone_number: string; business_id: string }) => void;
}

interface AvailableNumber {
  phone_number: string;
  friendly_name: string;
  locality: string;
  region: string;
}

export default function VoiceAgentBuilder({ resellerId, onDeployed }: VoiceAgentBuilderProps) {
  // Business selection
  const [businesses, setBusinesses] = useState<ResellerBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [newBusinessName, setNewBusinessName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Agent config
  const [greeting, setGreeting] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [voiceTone, setVoiceTone] = useState('Professional');
  const [language, setLanguage] = useState('English');

  // Feature toggles
  const [appointmentBooking, setAppointmentBooking] = useState(true);
  const [takeMessages, setTakeMessages] = useState(true);
  const [answerFaqs, setAnswerFaqs] = useState(true);
  const [transferToOwner, setTransferToOwner] = useState(false);

  // Phone number selection
  const [areaCode, setAreaCode] = useState('');
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState('');
  const [searchingNumbers, setSearchingNumbers] = useState(false);

  // Test call
  const [showTestModal, setShowTestModal] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testingCall, setTestingCall] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Deploy
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{ phone_number: string; agent_id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resellerId) return;
    fetch(`/api/reseller/businesses?reseller_id=${resellerId}`)
      .then((r) => r.json())
      .then((d) => setBusinesses(d.businesses || []))
      .catch(() => {});
  }, [resellerId]);

  const handleAnalyze = async () => {
    if (!websiteUrl) return;
    setAnalyzing(true);
    setError(null);
    try {
      let url = websiteUrl.trim();
      if (!url.startsWith('http')) url = 'https://' + url;

      const res = await fetch('/api/reseller/voice/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Analysis failed');
        return;
      }

      if (data.business_name && !newBusinessName) setNewBusinessName(data.business_name);
      if (data.suggested_greeting) setGreeting(data.suggested_greeting);
      if (data.hours) setBusinessHours(data.hours);
    } catch {
      setError('Failed to analyze website');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSearchNumbers = async () => {
    if (!areaCode || areaCode.length < 3) return;
    setSearchingNumbers(true);
    setAvailableNumbers([]);
    setSelectedNumber('');
    try {
      const res = await fetch(`/api/receptionist/phone-numbers/search?area_code=${areaCode}`);
      const data = await res.json();
      setAvailableNumbers(data.numbers || []);
    } catch {
      setError('Failed to search phone numbers');
    } finally {
      setSearchingNumbers(false);
    }
  };

  const handleTestCall = async () => {
    if (!testPhoneNumber) return;
    setTestingCall(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/reseller/voice/test-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number_to_call: testPhoneNumber,
          greeting: greeting || 'Hello! This is a test of your AI voice agent.',
          voice_tone: voiceTone,
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

  const handleDeploy = async () => {
    if (!selectedNumber || !greeting) {
      setError('Please select a phone number and set a greeting message.');
      return;
    }
    setDeploying(true);
    setError(null);
    try {
      const res = await fetch('/api/reseller/voice/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reseller_id: resellerId,
          business_id: selectedBusinessId || undefined,
          business_name: selectedBusinessId ? undefined : newBusinessName || 'New Business',
          phone_number: selectedNumber,
          greeting,
          business_hours: businessHours,
          voice_tone: voiceTone,
          language,
          features: {
            appointment_booking: appointmentBooking,
            take_messages: takeMessages,
            answer_faqs: answerFaqs,
            transfer_to_owner: transferToOwner,
          },
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Deployment failed');
        return;
      }

      setDeployResult({ phone_number: data.phone_number, agent_id: data.agent_id });
      onDeployed?.({ agent_id: data.agent_id, phone_number: data.phone_number, business_id: data.business_id });
    } catch {
      setError('Failed to deploy voice agent');
    } finally {
      setDeploying(false);
    }
  };

  // Success state
  if (deployResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Voice Agent Deployed!</h2>
          <p className="text-gray-500 mb-6">Your AI receptionist is now live and answering calls.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Phone Number</p>
            <p className="text-2xl font-bold text-gray-900">{deployResult.phone_number}</p>
          </div>
          <button
            onClick={() => {
              setDeployResult(null);
              setGreeting('');
              setBusinessHours('');
              setSelectedNumber('');
              setAvailableNumbers([]);
              setSelectedBusinessId('');
              setNewBusinessName('');
              setWebsiteUrl('');
            }}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Build Another Agent
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Voice Agent Builder</h2>
              <p className="text-sm text-gray-500">Build a custom AI phone agent in 60 seconds</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Select Business */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Business</label>
            <select
              value={selectedBusinessId}
              onChange={(e) => {
                setSelectedBusinessId(e.target.value);
                if (e.target.value) {
                  setNewBusinessName('');
                  setWebsiteUrl('');
                }
              }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
            >
              <option value="">Start Fresh (new business)</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.business_name}</option>
              ))}
            </select>
          </div>

          {/* New business fields */}
          {!selectedBusinessId && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name</label>
                <input
                  type="text"
                  value={newBusinessName}
                  onChange={(e) => setNewBusinessName(e.target.value)}
                  placeholder="Tony's Pizza"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Website</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="www.tonyspizza.com"
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing || !websiteUrl}
                    className="px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shrink-0"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Greeting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <MessageSquare className="w-4 h-4 inline mr-1.5 text-gray-400" />
              Greeting Message
            </label>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              rows={3}
              placeholder="Thanks for calling Tony's Pizza! How can I help you today?"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Business Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1.5 text-gray-400" />
              Business Hours
            </label>
            <input
              type="text"
              value={businessHours}
              onChange={(e) => setBusinessHours(e.target.value)}
              placeholder="Mon-Fri: 9AM-9PM, Sat-Sun: 10AM-8PM"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Voice Tone + Language */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Voice Tone</label>
              <select
                value={voiceTone}
                onChange={(e) => setVoiceTone(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option>Professional</option>
                <option>Friendly</option>
                <option>Energetic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>

          {/* Feature Toggles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Features</label>
            <div className="space-y-2.5">
              {[
                { label: 'Appointment Booking', icon: CalendarCheck, checked: appointmentBooking, set: setAppointmentBooking },
                { label: 'Take Messages', icon: MessageSquare, checked: takeMessages, set: setTakeMessages },
                { label: 'Answer FAQs', icon: HelpCircle, checked: answerFaqs, set: setAnswerFaqs },
                { label: 'Transfer to Owner', icon: PhoneForwarded, checked: transferToOwner, set: setTransferToOwner },
              ].map((feat) => (
                <label key={feat.label} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={feat.checked}
                    onChange={(e) => feat.set(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <feat.icon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  <span className="text-sm text-gray-700">{feat.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Phone Number Search */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Phone className="w-4 h-4 inline mr-1.5 text-gray-400" />
              Select Phone Number
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="Area code (e.g. 910)"
                maxLength={3}
                className="w-40 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button
                onClick={handleSearchNumbers}
                disabled={searchingNumbers || areaCode.length < 3}
                className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {searchingNumbers ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </button>
            </div>

            {availableNumbers.length > 0 && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {availableNumbers.map((num) => (
                  <button
                    key={num.phone_number}
                    onClick={() => setSelectedNumber(num.phone_number)}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedNumber === num.phone_number
                        ? 'bg-teal-50 border border-teal-200 text-teal-800'
                        : 'bg-white border border-gray-150 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="font-medium">{num.friendly_name}</span>
                    <span className="text-xs text-gray-500">{num.locality}, {num.region}</span>
                    {selectedNumber === num.phone_number && (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {selectedNumber && (
              <div className="mt-3 flex items-center gap-2 text-sm text-teal-700">
                <CheckCircle2 className="w-4 h-4" />
                Selected: <span className="font-semibold">{selectedNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={() => setShowTestModal(true)}
            disabled={!greeting}
            className="px-5 py-2.5 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Test Voice Agent
          </button>
          <button
            onClick={handleDeploy}
            disabled={deploying || !selectedNumber || !greeting}
            className="px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {deploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deploying...
              </>
            ) : (
              'Deploy Agent'
            )}
          </button>
        </div>
      </div>

      {/* Test Call Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTestModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Test Voice Agent</h3>
            <p className="text-sm text-gray-500 mb-4">Enter your phone number to receive a test call with your configured greeting.</p>
            <input
              type="tel"
              value={testPhoneNumber}
              onChange={(e) => setTestPhoneNumber(e.target.value)}
              placeholder="+19105551234"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent mb-4"
            />
            {testResult && (
              <p className="text-sm text-teal-700 bg-teal-50 rounded-lg px-3 py-2 mb-4">{testResult}</p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowTestModal(false); setTestResult(null); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleTestCall}
                disabled={testingCall || !testPhoneNumber}
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
