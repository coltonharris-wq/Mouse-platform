'use client';

import { HeadphonesIcon, MessageSquare, Mail, Phone, Send } from 'lucide-react';
import { useState } from 'react';

export default function SupportPage() {
  const [message, setMessage] = useState('');

  const tickets = [
    { id: 'TKT-001', subject: 'How to deploy a new employee?', status: 'Open', date: '2024-02-27', lastUpdate: '2 hours ago' },
    { id: 'TKT-002', subject: 'Billing question', status: 'Resolved', date: '2024-02-20', lastUpdate: '5 days ago' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Support Center</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <HeadphonesIcon className="w-6 h-6 text-mouse-teal" />
              <h3 className="text-lg font-semibold text-white">Contact Support</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                <textarea
                  rows={4}
                  placeholder="Describe your issue..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500 resize-none"
                />
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-mouse-teal text-white rounded-lg hover:bg-mouse-teal-dark transition-colors">
                <Send className="w-4 h-4" />
                Submit Ticket
              </button>
            </div>
          </div>

          <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-border">
              <h3 className="text-lg font-semibold text-white">Your Tickets</h3>
            </div>
            <div className="divide-y divide-dark-border">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-6 hover:bg-dark-bg transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{ticket.id}</span>
                      <h4 className="text-white font-medium">{ticket.subject}</h4>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      ticket.status === 'Open' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Created: {ticket.date}</span>
                    <span>Last update: {ticket.lastUpdate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Other Ways to Reach Us</h3>
            <div className="space-y-4">
              <a href="mailto:support@mouseplatform.com" className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg hover:bg-dark-bg-tertiary transition-colors">
                <Mail className="w-5 h-5 text-mouse-teal" />
                <div>
                  <p className="text-white font-medium">Email Support</p>
                  <p className="text-sm text-gray-500">support@mouseplatform.com</p>
                </div>
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg hover:bg-dark-bg-tertiary transition-colors">
                <Phone className="w-5 h-5 text-accent-purple" />
                <div>
                  <p className="text-white font-medium">Phone Support</p>
                  <p className="text-sm text-gray-500">+1 (234) 567-890</p>
                </div>
              </a>
              <div className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg">
                <MessageSquare className="w-5 h-5 text-accent-cyan" />
                <div>
                  <p className="text-white font-medium">Live Chat</p>
                  <p className="text-sm text-gray-500">Available 9am-6pm EST</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-mouse-teal/20 to-accent-purple/20 border border-mouse-teal/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Need Help Fast?</h3>
            <p className="text-sm text-gray-400 mb-4">Check our documentation for quick answers to common questions.</p>
            <a href="#" className="text-mouse-teal hover:text-mouse-teal-light font-medium">
              View Documentation →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
