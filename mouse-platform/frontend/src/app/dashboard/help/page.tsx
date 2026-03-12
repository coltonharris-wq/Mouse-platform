'use client';

import { useState } from 'react';
import { RotateCcw, ChevronDown, ChevronUp, Mail, MessageSquare, Loader2, CheckCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'How do I talk to King Mouse?',
    a: 'Just type in the chat on your dashboard. Click "Chat with King Mouse" in the sidebar, type what you need, and King Mouse will get to work.',
  },
  {
    q: 'What can King Mouse do?',
    a: 'King Mouse can answer calls, manage your schedule, track inventory, send emails, follow up with customers, generate reports, research competitors, and handle most day-to-day business operations. Just ask!',
  },
  {
    q: 'How do I check my hours?',
    a: 'Go to "Billing & Hours" in the sidebar. You\'ll see how many hours you\'ve used this month, what\'s remaining, and your current plan details.',
  },
  {
    q: 'How do I cancel?',
    a: 'Go to Settings, then scroll to "Danger Zone" at the bottom. You\'ll find the option to cancel your subscription. Your account stays active until the end of your billing period.',
  },
  {
    q: 'What if King Mouse makes a mistake?',
    a: 'Tell him in the chat! King Mouse learns from corrections. Say something like "That wasn\'t right, here\'s what I actually need..." and he\'ll adjust. He gets better over time.',
  },
  {
    q: 'Can I watch King Mouse work?',
    a: 'Yes! Click "King Mouse\'s Computer" in the sidebar to see a live view of what King Mouse is doing on his virtual computer in real time.',
  },
  {
    q: 'How do I connect my email or calendar?',
    a: 'Go to "Connections" in the sidebar. You\'ll see all available integrations. Click "Connect" on any app to link it with King Mouse.',
  },
];

export default function HelpPage() {
  const [restarting, setRestarting] = useState(false);
  const [restartSuccess, setRestartSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const customerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('customer_id') || 'demo'
    : 'demo';

  const handleRestart = async () => {
    setRestarting(true);
    setRestartSuccess(false);
    try {
      const res = await fetch(`/api/vm/restart?customer_id=${customerId}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRestartSuccess(true);
        setTimeout(() => setRestartSuccess(false), 5000);
      }
    } catch {
      // Ignore
    }
    setRestarting(false);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold text-[#0B1F3B] mb-8">Help & Support</h1>

      {/* Restart King Mouse — #1 most important thing */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Something not working?</h2>
        <p className="text-xl text-gray-500 mb-6">
          Restarting King Mouse fixes most issues. Give it about 30 seconds to come back online.
        </p>
        <button
          onClick={handleRestart}
          disabled={restarting}
          className="flex items-center gap-3 bg-[#0F6B6E] text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-[#0B5456] transition-colors disabled:opacity-50"
        >
          {restarting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Restarting King Mouse...
            </>
          ) : restartSuccess ? (
            <>
              <CheckCircle className="w-6 h-6" />
              King Mouse Restarted!
            </>
          ) : (
            <>
              <RotateCcw className="w-6 h-6" />
              Restart King Mouse
            </>
          )}
        </button>
      </div>

      {/* FAQ */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-xl font-semibold text-gray-900">{item.q}</span>
                {openFaq === i
                  ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                  : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                }
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5">
                  <p className="text-lg text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Contact Support</h2>
        <p className="text-xl text-gray-500 mb-4">Need help from a human? We&apos;re here for you.</p>
        <a
          href={`mailto:support@automio.com?subject=Support%20Request%20-%20Customer%20${customerId}`}
          className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          <Mail className="w-5 h-5" />
          Email support@automio.com
        </a>
      </div>

      {/* Live Chat Placeholder */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-6 h-6 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900">Live Chat</h2>
          <span className="text-base bg-teal-100 text-teal-700 px-3 py-1 rounded-full font-medium">Coming Soon</span>
        </div>
        <p className="text-xl text-gray-500">Chat directly with our support team — launching soon.</p>
      </div>
    </div>
  );
}
