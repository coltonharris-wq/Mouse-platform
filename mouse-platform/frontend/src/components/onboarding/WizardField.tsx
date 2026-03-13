'use client';

import { useState } from 'react';
import type { WizardField as WizardFieldType } from '@/types/pro-template';

interface WizardFieldProps {
  field: WizardFieldType;
  value: string | boolean | number | string[];
  onChange: (value: string | boolean | number | string[]) => void;
}

export default function WizardField({ field, value, onChange }: WizardFieldProps) {
  const baseInputClass =
    'w-full px-4 py-3 min-h-[48px] text-base bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-colors';

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'phone':
      case 'email':
      case 'url':
        return (
          <input
            type={field.type === 'phone' ? 'tel' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseInputClass}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={(value as number) || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            placeholder={field.placeholder}
            required={field.required}
            className={baseInputClass}
          />
        );

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-base">$</span>
            <input
              type="number"
              value={(value as number) || ''}
              onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
              placeholder={field.placeholder}
              required={field.required}
              className={`${baseInputClass} pl-8`}
            />
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={`${baseInputClass} resize-none`}
          />
        );

      case 'select':
        return (
          <select
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className={baseInputClass}
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case 'multiselect':
        return <MultiselectPills options={field.options || []} value={value as string[]} onChange={onChange as (v: string[]) => void} />;

      case 'toggle':
        return (
          <button
            type="button"
            onClick={() => onChange(!(value as boolean))}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              value ? 'bg-teal-500' : 'bg-zinc-600'
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow ${
                value ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        );

      case 'time_range':
        return <TimeRangePicker value={(value as string) || ''} onChange={onChange as (v: string) => void} placeholder={field.placeholder} />;

      default:
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-base font-medium text-zinc-200">
        {field.label}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {renderField()}
      {field.help_text && (
        <p className="text-sm text-zinc-500">{field.help_text}</p>
      )}
    </div>
  );
}

function MultiselectPills({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const selected = Array.isArray(value) ? value : [];

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((v) => v !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-teal-500 text-white shadow-md'
                : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-teal-400/50'
            }`}
          >
            {isActive && <span className="mr-1.5">{'\u2713'}</span>}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function TimeRangePicker({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  // Parse "HH:MM AM - HH:MM PM" or use defaults
  const parts = value.split(' - ');
  const [open, setOpen] = useState(parts[0] || '');
  const [close, setClose] = useState(parts[1] || '');

  const update = (newOpen: string, newClose: string) => {
    setOpen(newOpen);
    setClose(newClose);
    if (newOpen && newClose) {
      onChange(`${newOpen} - ${newClose}`);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="time"
        value={open}
        onChange={(e) => update(e.target.value, close)}
        className="flex-1 px-4 py-3 min-h-[48px] text-base bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
        placeholder={placeholder.split(' - ')[0] || 'Open'}
      />
      <span className="text-zinc-500 font-medium">to</span>
      <input
        type="time"
        value={close}
        onChange={(e) => update(open, e.target.value)}
        className="flex-1 px-4 py-3 min-h-[48px] text-base bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
        placeholder={placeholder.split(' - ')[1] || 'Close'}
      />
    </div>
  );
}
