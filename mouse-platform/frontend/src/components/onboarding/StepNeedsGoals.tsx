'use client';

const NEEDS = [
  { id: 'scheduling', label: 'Scheduling & Appointments' },
  { id: 'inventory', label: 'Inventory Management' },
  { id: 'leads', label: 'Lead Generation & Follow-up' },
  { id: 'customer_comms', label: 'Customer Communication' },
  { id: 'admin', label: 'Admin & Paperwork' },
  { id: 'ordering', label: 'Supplier Ordering' },
  { id: 'other', label: 'Other' },
];

interface StepNeedsGoalsProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepNeedsGoals({ selected, onChange, onNext, onBack }: StepNeedsGoalsProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">What do you need help with?</h2>
      <p className="text-gray-600 mb-8">Select all that apply. This helps us recommend the right AI employee.</p>

      <div className="space-y-3">
        {NEEDS.map((need) => (
          <button
            key={need.id}
            onClick={() => toggle(need.id)}
            className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-colors ${
              selected.includes(need.id)
                ? 'border-teal-500 bg-teal-50 text-teal-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{need.label}</span>
              {selected.includes(need.id) && (
                <span className="text-teal-600 font-bold">&#10003;</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
