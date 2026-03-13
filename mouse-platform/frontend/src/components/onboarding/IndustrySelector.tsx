'use client';

import { useState, useEffect } from 'react';
import { Search, Check, Loader2 } from 'lucide-react';
import type { ProTemplateLight } from '@/types/pro-template';

interface IndustrySelectorProps {
  onSelect: (template: ProTemplateLight | null) => void;
  selectedId?: string;
}

export default function IndustrySelector({ onSelect, selectedId }: IndustrySelectorProps) {
  const [templates, setTemplates] = useState<ProTemplateLight[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    fetch('/api/templates')
      .then((r) => r.json())
      .then((data) => {
        setTemplates(data.templates || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#0F6B6E] animate-spin" />
      </div>
    );
  }

  const filtered = search
    ? templates.filter(
        (t) =>
          t.display_name.toLowerCase().includes(search.toLowerCase()) ||
          t.industry.toLowerCase().includes(search.toLowerCase()) ||
          t.niche.toLowerCase().includes(search.toLowerCase())
      )
    : templates;

  const selected = templates.find((t) => t.id === selectedId);

  const handleSelect = (template: ProTemplateLight) => {
    setShowCustom(false);
    onSelect(template);
  };

  const handleCustom = () => {
    setShowCustom(true);
    // Create a minimal "custom" template
    const customTemplate: ProTemplateLight = {
      id: 'custom',
      industry: customIndustry || 'Other',
      niche: customIndustry || 'Custom Business',
      display_name: customIndustry || 'Other',
      emoji: '\u{1F4E6}',
      tagline: 'Your AI operations manager, customized for your business',
      wizard_steps: [
        {
          step_number: 1,
          title: 'About Your Business',
          description: 'Tell us about your business',
          fields: [
            { name: 'business_name', label: "What's the name of your business?", type: 'text', placeholder: 'Your Business Name', required: true },
            { name: 'owner_name', label: "What's your name?", type: 'text', placeholder: 'Your Name', required: true },
            { name: 'phone', label: 'Business phone number?', type: 'phone', placeholder: '(555) 123-4567', required: true },
            { name: 'address', label: 'Business address?', type: 'text', placeholder: '123 Main St', required: false },
          ],
        },
        {
          step_number: 2,
          title: 'Hours & Services',
          description: 'When are you open?',
          fields: [
            { name: 'business_hours', label: 'Business hours?', type: 'time_range', placeholder: '9:00 AM - 5:00 PM', required: true },
            { name: 'description', label: 'Describe what your business does', type: 'textarea', placeholder: 'We help customers by...', required: false },
          ],
        },
        {
          step_number: 3,
          title: 'What Should King Mouse Handle?',
          description: 'Pick the tasks you want automated',
          fields: [
            { name: 'tasks', label: 'Select tasks for King Mouse', type: 'multiselect', placeholder: '', required: false, options: ['Answer phone calls', 'Schedule appointments', 'Send reminders', 'Handle customer inquiries', 'Manage reviews', 'Send follow-ups', 'Handle billing questions', 'Social media'] },
          ],
        },
        {
          step_number: 4,
          title: 'Review & Launch',
          description: 'Review your setup and launch King Mouse',
          fields: [
            { name: 'special_instructions', label: 'Anything else King Mouse should know?', type: 'textarea', placeholder: 'Tell us about any special requirements...', required: false },
          ],
        },
      ],
      dashboard_widgets: [
        { id: 'calls-handled', title: 'Calls Today', description: 'Phone calls handled', priority: 1, icon: 'Phone' },
        { id: 'todays-appointments', title: "Today's Appointments", description: 'Scheduled appointments', priority: 2, icon: 'Calendar' },
        { id: 'daily-revenue', title: "Today's Revenue", description: 'Revenue today', priority: 3, icon: 'DollarSign' },
        { id: 'new-clients', title: 'New Clients', description: 'New clients this week', priority: 4, icon: 'UserPlus' },
        { id: 'review-alerts', title: 'Review Alerts', description: 'New reviews', priority: 5, icon: 'Star' },
      ],
      sample_tasks: [
        { title: 'Answer the next phone call', description: 'King Mouse handles incoming calls professionally', category: 'Calls', difficulty: 'easy' },
        { title: 'Schedule an appointment', description: 'Book and confirm customer appointments', category: 'Scheduling', difficulty: 'easy' },
        { title: 'Send follow-up messages', description: 'Reach out to recent customers', category: 'Follow-up', difficulty: 'easy' },
        { title: 'Respond to a review', description: 'Draft professional review responses', category: 'Reviews', difficulty: 'easy' },
      ],
      kpis: [
        { name: 'Calls Handled', unit: 'calls', description: 'Calls handled per day', target_suggestion: 10 },
        { name: 'Appointments Booked', unit: 'appointments', description: 'Appointments booked per week', target_suggestion: 15 },
        { name: 'Response Time', unit: 'minutes', description: 'Average call response time', target_suggestion: 5 },
        { name: 'Customer Rating', unit: 'stars', description: 'Average customer rating', target_suggestion: 4.5 },
      ],
      receptionist_greeting: "Thanks for calling! This is King Mouse, your AI assistant. I can help schedule appointments, answer questions, or take a message. How can I help?",
      suggested_integrations: [
        { name: 'Google Business', slug: 'google-business', category: 'Reviews', why: 'Monitor and respond to reviews', priority: 'recommended' },
        { name: 'Calendly', slug: 'calendly', category: 'Scheduling', why: 'Enable self-service booking', priority: 'recommended' },
        { name: 'QuickBooks', slug: 'quickbooks', category: 'Accounting', why: 'Sync invoices and payments', priority: 'nice-to-have' },
      ],
      estimated_hours_saved_weekly: 12,
      estimated_monthly_value: 1800,
      ideal_plan: 'pro',
    };
    onSelect(customTemplate);
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-[#0B1F3B] mb-1">What kind of business do you run?</h3>
      <p className="text-gray-500 mb-5 text-sm">Pick your industry so King Mouse knows exactly how to help</p>

      {/* Template cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {filtered.map((t) => {
          const isSelected = selectedId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleSelect(t)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all text-center min-h-[90px] ${
                isSelected
                  ? 'border-[#0F6B6E] bg-[#0F6B6E]/5 shadow-md'
                  : 'border-gray-200 hover:border-[#0F6B6E]/50 hover:bg-gray-50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-[#0F6B6E]" />
                </div>
              )}
              <span className="text-3xl mb-1">{t.emoji}</span>
              <span className={`text-sm font-semibold ${isSelected ? 'text-[#0F6B6E]' : 'text-gray-700'}`}>
                {t.display_name}
              </span>
            </button>
          );
        })}

        {/* "Other" card */}
        <button
          onClick={handleCustom}
          className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all text-center min-h-[90px] ${
            showCustom
              ? 'border-[#0F6B6E] bg-[#0F6B6E]/5 shadow-md'
              : 'border-gray-200 hover:border-[#0F6B6E]/50 hover:bg-gray-50'
          }`}
        >
          {showCustom && (
            <div className="absolute top-2 right-2">
              <Check className="w-4 h-4 text-[#0F6B6E]" />
            </div>
          )}
          <span className="text-3xl mb-1">{'\u{1F4E6}'}</span>
          <span className={`text-sm font-semibold ${showCustom ? 'text-[#0F6B6E]' : 'text-gray-700'}`}>
            Other
          </span>
        </button>
      </div>

      {/* Custom industry text input */}
      {showCustom && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tell us your industry</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={customIndustry}
              onChange={(e) => {
                setCustomIndustry(e.target.value);
                // Update the custom template with the typed industry
                handleCustom();
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-[#0F6B6E] focus:ring-1 focus:ring-[#0F6B6E] outline-none"
              placeholder="e.g., Dog grooming, Accounting, Photography..."
            />
          </div>
        </div>
      )}

      {/* Selected template tagline */}
      {selected && !showCustom && (
        <div className="bg-[#0F6B6E]/5 border border-[#0F6B6E]/20 rounded-xl p-3 text-center">
          <p className="text-sm text-[#0F6B6E] font-medium">
            {selected.emoji} {selected.display_name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">&ldquo;{selected.tagline}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
