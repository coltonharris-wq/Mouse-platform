'use client';

interface StepBusinessInfoProps {
  data: {
    business_name: string;
    owner_name: string;
    email: string;
    location: string;
    business_type: string;
  };
  onChange: (data: Partial<StepBusinessInfoProps['data']>) => void;
  onNext: () => void;
}

export default function StepBusinessInfo({ data, onChange, onNext }: StepBusinessInfoProps) {
  const canProceed = data.business_name && data.owner_name && data.email;

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your business</h2>
      <p className="text-gray-600 mb-8">We&apos;ll use this to configure your AI employee.</p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
          <input
            type="text"
            value={data.business_name}
            onChange={(e) => onChange({ business_name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Bob's Appliance Repair"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
          <input
            type="text"
            value={data.owner_name}
            onChange={(e) => onChange({ owner_name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Bob Smith"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="bob@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Dallas, TX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
          <input
            type="text"
            value={data.business_type}
            onChange={(e) => onChange({ business_type: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Appliance Repair"
          />
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="mt-8 w-full bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
