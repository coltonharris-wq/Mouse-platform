'use client';

import { useEffect, useState, useRef } from 'react';
import { Phone, Search, PhoneCall, Check, Volume2, Send, X, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PhoneNumber {
  phone_number: string;
  friendly_name: string;
  locality: string;
  region: string;
}

interface OwnedNumber {
  id: string;
  phone_number: string;
  friendly_name: string;
  status: string;
}

interface ReceptionistConfig {
  is_enabled: boolean;
  greeting_text: string;
  after_hours_message: string;
  voicemail_enabled: boolean;
  voicemail_email: string;
  voice_id: string;
}

interface CallLog {
  id: string;
  caller_number: string;
  duration_seconds: number;
  status: string;
  created_at: string;
}

const VOICES = [
  { id: 'nova', name: 'Nova', desc: 'Warm and friendly, great for customer service', badge: 'Recommended' },
  { id: 'onyx', name: 'Onyx', desc: 'Professional and deep, ideal for formal businesses', badge: null },
  { id: 'shimmer', name: 'Shimmer', desc: 'Energetic and upbeat, perfect for retail and food', badge: null },
];

export default function ReceptionistPage() {
  // ─── State (keeps existing API integrations) ───
  const [areaCode, setAreaCode] = useState('');
  const [availableNumbers, setAvailableNumbers] = useState<PhoneNumber[]>([]);
  const [ownedNumbers, setOwnedNumbers] = useState<OwnedNumber[]>([]);
  const [config, setConfig] = useState<ReceptionistConfig | null>(null);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [greetingText, setGreetingText] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Mini chat helper
  const [helperOpen, setHelperOpen] = useState(false);
  const [helperMessages, setHelperMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: "Need help with your receptionist? I can change your greeting, set up voicemail, or walk you through forwarding your business number. Just ask!" },
  ]);
  const [helperInput, setHelperInput] = useState('');
  const [helperSending, setHelperSending] = useState(false);
  const helperEndRef = useRef<HTMLDivElement>(null);

  const customerId = typeof window !== 'undefined' ? sessionStorage.getItem('customer_id') || 'demo' : 'demo';

  const hasPhone = ownedNumbers.length > 0;

  // ─── Data loading (unchanged API calls) ───
  useEffect(() => {
    fetch(`/api/receptionist/config?customer_id=${customerId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
        if (data.phone_numbers?.length > 0) setOwnedNumbers(data.phone_numbers);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`/api/receptionist/calls?customer_id=${customerId}`)
      .then((r) => r.json())
      .then((data) => setCalls(data.calls || []))
      .catch(() => {});
  }, [customerId]);

  // Set default greeting from business name
  useEffect(() => {
    if (!greetingText) {
      const biz = sessionStorage.getItem('signup_business_name') || 'our business';
      setGreetingText(`Thanks for calling ${biz}! How can I help you today?`);
    }
  }, [greetingText]);

  // ─── Existing API handlers (unchanged) ───
  const handleSearch = async () => {
    if (!areaCode || areaCode.length !== 3) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/receptionist/phone-numbers/search?area_code=${areaCode}`);
      const data = await res.json();
      setAvailableNumbers((data.numbers || []).slice(0, 4));
    } catch { /* ignore */ }
    setSearching(false);
  };

  const handlePurchase = async (phoneNumber: string) => {
    setPurchasing(true);
    try {
      const res = await fetch('/api/receptionist/phone-numbers/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, phone_number: phoneNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setOwnedNumbers([{ id: 'new', phone_number: data.phone_number, friendly_name: data.phone_number, status: 'active' }]);
        setWizardStep(3); // Jump to greeting step
        const configRes = await fetch(`/api/receptionist/config?customer_id=${customerId}`);
        const configData = await configRes.json();
        if (configData.config) setConfig(configData.config);
      }
    } catch {
      alert('Failed to activate number. Please try again.');
    }
    setPurchasing(false);
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await fetch('/api/receptionist/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, ...config }),
      });
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleSaveVoiceAndGreeting = async () => {
    setSaving(true);
    try {
      await fetch('/api/receptionist/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          greeting_text: greetingText,
          voice_id: selectedVoice,
          is_enabled: true,
        }),
      });
      setConfig((prev) => prev ? { ...prev, greeting_text: greetingText, voice_id: selectedVoice } : prev);
    } catch { /* ignore */ }
    setSaving(false);
    setShowConfetti(true);
    setWizardStep(4);
  };

  // ─── Mini chat helper ───
  const sendHelperMessage = async () => {
    if (!helperInput.trim() || helperSending) return;
    const msg = helperInput.trim();
    setHelperInput('');
    setHelperMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setHelperSending(true);
    try {
      const res = await fetch('/api/demo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: helperMessages,
          system_prompt: 'You are King Mouse, helping a customer configure their AI receptionist. Keep answers short and focused on receptionist setup: phone numbers, greetings, voicemail, call forwarding, and number porting. If they want to port a number, explain they should contact their current carrier for an account number and PIN, then come back to you.',
        }),
      });
      const data = await res.json();
      setHelperMessages((prev) => [...prev, { role: 'assistant', content: data.response || 'Let me look into that for you.' }]);
    } catch {
      setHelperMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble right now. Try again in a moment!" }]);
    }
    setHelperSending(false);
  };

  useEffect(() => {
    helperEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [helperMessages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-[#0F6B6E] animate-spin" />
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  //  SETUP WIZARD — when NO phone number
  // ═══════════════════════════════════════════════
  if (!hasPhone) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Step 0: Intro */}
        {wizardStep === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-6">{'\u{1F4DE}'}</div>
            <h1 className="text-4xl font-bold text-[#0B1F3B] mb-4">Let&apos;s set up your AI receptionist</h1>
            <p className="text-xl text-gray-500 mb-8 max-w-lg mx-auto">
              Your AI receptionist will answer your business phone 24/7, take messages, book appointments, and handle common questions.
            </p>
            <button
              onClick={() => setWizardStep(1)}
              className="bg-[#0F6B6E] text-white px-10 py-4 rounded-xl text-xl font-bold hover:bg-[#0B5456] transition-colors inline-flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Step 1: Area Code */}
        {wizardStep === 1 && (
          <div className="text-center py-8">
            <button onClick={() => setWizardStep(0)} className="text-gray-400 hover:text-gray-600 mb-6 inline-flex items-center gap-1 text-lg">
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <h2 className="text-3xl font-bold text-[#0B1F3B] mb-3">What&apos;s your area code?</h2>
            <p className="text-xl text-gray-500 mb-8">We&apos;ll get you a local phone number your customers will recognize.</p>
            <div className="max-w-xs mx-auto">
              <input
                type="text"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="e.g., 910"
                className="w-full text-center text-4xl font-bold border-2 border-gray-300 rounded-xl px-4 py-4 focus:outline-none focus:border-[#0F6B6E] focus:ring-2 focus:ring-[#0F6B6E]"
                maxLength={3}
                autoFocus
              />
              <p className="text-base text-gray-400 mt-3">The first 3 digits of your phone number</p>
            </div>
            <button
              onClick={() => { handleSearch(); setWizardStep(2); }}
              disabled={areaCode.length !== 3}
              className="mt-8 bg-[#0F6B6E] text-white px-10 py-4 rounded-xl text-xl font-bold hover:bg-[#0B5456] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {searching ? <><Loader2 className="w-5 h-5 animate-spin" /> Searching...</> : <>Find Numbers <ArrowRight className="w-6 h-6" /></>}
            </button>
          </div>
        )}

        {/* Step 2: Pick Number */}
        {wizardStep === 2 && (
          <div className="py-8">
            <button onClick={() => setWizardStep(1)} className="text-gray-400 hover:text-gray-600 mb-6 inline-flex items-center gap-1 text-lg">
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <h2 className="text-3xl font-bold text-[#0B1F3B] mb-3 text-center">Pick your number</h2>
            <p className="text-xl text-gray-500 mb-8 text-center">Choose a local number for your business</p>

            {searching ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-10 h-10 text-[#0F6B6E] animate-spin" />
              </div>
            ) : availableNumbers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500">No numbers found for area code {areaCode}.</p>
                <button onClick={() => setWizardStep(1)} className="mt-4 text-[#0F6B6E] font-semibold text-lg hover:underline">Try a different area code</button>
              </div>
            ) : (
              <div className="space-y-4 max-w-md mx-auto">
                {availableNumbers.map((n) => (
                  <button
                    key={n.phone_number}
                    onClick={() => handlePurchase(n.phone_number)}
                    disabled={purchasing}
                    className="w-full bg-white rounded-xl border-2 border-gray-200 p-6 text-left hover:border-[#0F6B6E] hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <p className="text-2xl font-bold text-gray-900">{n.friendly_name}</p>
                    <p className="text-lg text-gray-500">{n.locality}, {n.region}</p>
                    {purchasing ? (
                      <span className="mt-2 inline-flex items-center gap-2 text-[#0F6B6E] font-semibold text-lg"><Loader2 className="w-4 h-4 animate-spin" /> Activating...</span>
                    ) : (
                      <span className="mt-2 inline-block text-[#0F6B6E] font-semibold text-lg">Pick this one &rarr;</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Greeting + Voice */}
        {wizardStep === 3 && (
          <div className="py-8">
            <button onClick={() => setWizardStep(2)} className="text-gray-400 hover:text-gray-600 mb-6 inline-flex items-center gap-1 text-lg">
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <h2 className="text-3xl font-bold text-[#0B1F3B] mb-3 text-center">How should your receptionist answer?</h2>
            <p className="text-xl text-gray-500 mb-8 text-center">Customize the greeting or keep the default</p>

            <div className="max-w-lg mx-auto space-y-8">
              {/* Greeting */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">Greeting Message</label>
                <textarea
                  value={greetingText}
                  onChange={(e) => setGreetingText(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-[#0F6B6E] focus:ring-2 focus:ring-[#0F6B6E]"
                />
              </div>

              {/* Voice Cards */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">Choose a Voice</label>
                <div className="space-y-3">
                  {VOICES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoice(v.id)}
                      className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                        selectedVoice === v.id
                          ? 'border-[#0F6B6E] bg-teal-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                        selectedVoice === v.id ? 'bg-[#0F6B6E] text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Volume2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-900">{v.name}</span>
                          {v.badge && (
                            <span className="text-sm bg-[#0F6B6E] text-white px-2 py-0.5 rounded-full">{v.badge}</span>
                          )}
                        </div>
                        <p className="text-base text-gray-500 mt-0.5">{v.desc}</p>
                      </div>
                      {selectedVoice === v.id && (
                        <Check className="w-6 h-6 text-[#0F6B6E] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveVoiceAndGreeting}
                disabled={saving}
                className="w-full bg-[#0F6B6E] text-white py-4 rounded-xl text-xl font-bold hover:bg-[#0B5456] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <>Finish Setup <Check className="w-6 h-6" /></>}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {wizardStep === 4 && (
          <div className="text-center py-8">
            {showConfetti && (
              <div className="text-5xl mb-4 animate-bounce">{'\u{1F389}\u{1F38A}\u{1F389}'}</div>
            )}
            <div className="text-6xl mb-6">{'\u{2705}'}</div>
            <h2 className="text-4xl font-bold text-[#0B1F3B] mb-4">You&apos;re all set!</h2>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 max-w-md mx-auto mb-6">
              <p className="text-lg text-green-700 font-medium mb-1">Your receptionist number:</p>
              <p className="text-3xl font-bold text-green-900">{ownedNumbers[0]?.phone_number}</p>
            </div>
            <p className="text-xl text-gray-500 mb-2">Your receptionist is live and ready to answer calls.</p>
            <p className="text-lg text-gray-400 mb-8">Tell your customers to call this number — or forward your existing number to it.</p>
            <div className="bg-gray-50 rounded-xl p-5 max-w-md mx-auto mb-8">
              <p className="text-lg text-gray-600">
                {'\u{1F42D}'} <strong>Want to port your existing number?</strong> Ask King Mouse in the main chat and he&apos;ll handle it for you.
              </p>
            </div>
            <Link href="/dashboard" className="bg-[#0F6B6E] text-white px-8 py-3 rounded-xl text-xl font-semibold hover:bg-[#0B5456] transition-colors">
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* Floating helper */}
        <FloatingHelper
          open={helperOpen}
          onToggle={() => setHelperOpen(!helperOpen)}
          messages={helperMessages}
          input={helperInput}
          onInputChange={setHelperInput}
          onSend={sendHelperMessage}
          sending={helperSending}
          endRef={helperEndRef}
        />
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  //  ACTIVE VIEW — when phone number EXISTS
  //  Single page: number + settings + recent calls
  // ═══════════════════════════════════════════════
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold text-[#0B1F3B] mb-8">AI Receptionist</h1>

      {/* Phone Number Card */}
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg text-green-700 font-medium">Your Phone Number</p>
            <p className="text-3xl font-bold text-green-900 mt-1">{ownedNumbers[0]?.phone_number}</p>
          </div>
          <span className="flex items-center gap-2 text-lg font-semibold text-green-700 bg-green-100 px-4 py-2 rounded-full">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            Active
          </span>
        </div>
      </div>

      {/* Settings */}
      {config && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Greeting Message</label>
            <textarea
              value={config.greeting_text}
              onChange={(e) => setConfig({ ...config, greeting_text: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#0F6B6E]"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">After Hours Message</label>
            <textarea
              value={config.after_hours_message}
              onChange={(e) => setConfig({ ...config, after_hours_message: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#0F6B6E]"
            />
          </div>

          {/* Voice Cards (not dropdown) */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-3">Voice</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setConfig({ ...config, voice_id: v.id })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    config.voice_id === v.id
                      ? 'border-[#0F6B6E] bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-lg font-bold text-gray-900">{v.name}</p>
                  <p className="text-base text-gray-500 mt-1">{v.desc.split(',')[0]}</p>
                  {config.voice_id === v.id && <Check className="w-5 h-5 text-[#0F6B6E] mt-2" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.voicemail_enabled}
              onChange={(e) => setConfig({ ...config, voicemail_enabled: e.target.checked })}
              className="rounded w-5 h-5"
            />
            <label className="text-lg text-gray-700">Enable voicemail</label>
          </div>

          {config.voicemail_enabled && (
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Voicemail notification email</label>
              <input
                type="email"
                value={config.voicemail_email || ''}
                onChange={(e) => setConfig({ ...config, voicemail_email: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#0F6B6E]"
              />
            </div>
          )}

          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="bg-[#0F6B6E] text-white px-8 py-3 rounded-xl text-lg font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}

      {/* Port Number — simplified */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Want to use your existing number?</h3>
        <p className="text-lg text-gray-600">
          {'\u{1F42D}'} Ask King Mouse in the main chat and he&apos;ll handle the number porting paperwork for you.
        </p>
        <Link href="/dashboard" className="inline-block mt-3 text-[#0F6B6E] text-lg font-semibold hover:underline">
          Go to Chat &rarr;
        </Link>
      </div>

      {/* Recent Calls */}
      <div className="bg-white rounded-xl border border-gray-200 mb-8">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Recent Calls</h2>
        </div>
        {calls.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <PhoneCall className="w-14 h-14 mx-auto mb-4 text-gray-300" />
            <p className="text-xl">No calls yet</p>
            <p className="text-lg mt-2">Call logs will appear here after your first call.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {calls.slice(0, 10).map((call) => (
              <div key={call.id} className="flex items-center gap-4 p-5 hover:bg-gray-50">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <PhoneCall className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-900">{call.caller_number || 'Unknown'}</p>
                  <p className="text-base text-gray-400">{new Date(call.created_at).toLocaleString()}</p>
                </div>
                <span className="text-lg text-gray-500">{call.duration_seconds}s</span>
                <span className={`text-base px-3 py-1 rounded-full ${
                  call.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>{call.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating helper */}
      <FloatingHelper
        open={helperOpen}
        onToggle={() => setHelperOpen(!helperOpen)}
        messages={helperMessages}
        input={helperInput}
        onInputChange={setHelperInput}
        onSend={sendHelperMessage}
        sending={helperSending}
        endRef={helperEndRef}
      />
    </div>
  );
}

// ─── Floating Helper Mini-Chat ───
function FloatingHelper({
  open,
  onToggle,
  messages,
  input,
  onInputChange,
  onSend,
  sending,
  endRef,
}: {
  open: boolean;
  onToggle: () => void;
  messages: { role: string; content: string }[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      {/* FAB */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#0F6B6E] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#0B5456] transition-colors z-40"
      >
        {open ? <X className="w-6 h-6" /> : <span className="text-2xl">{'\u{1F42D}'}</span>}
      </button>

      {/* Chat Overlay */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 max-h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-40 overflow-hidden">
          <div className="bg-[#0F6B6E] text-white px-4 py-3 flex items-center gap-2">
            <span className="text-xl">{'\u{1F42D}'}</span>
            <span className="font-bold">Receptionist Help</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[320px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-base ${
                  m.role === 'user' ? 'bg-[#0F6B6E] text-white' : 'bg-gray-100 text-gray-800'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-2.5 flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="border-t p-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSend(); }}
              placeholder="Ask about your receptionist..."
              className="flex-1 text-base border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#0F6B6E]"
            />
            <button
              onClick={onSend}
              disabled={!input.trim() || sending}
              className="p-2 bg-[#0F6B6E] text-white rounded-xl disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
