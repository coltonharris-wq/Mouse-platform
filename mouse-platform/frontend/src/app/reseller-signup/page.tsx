'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Loader2, ArrowRight, ArrowLeft, DollarSign } from 'lucide-react';

export default function ResellerSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Step 2 fields
  const [markupRate, setMarkupRate] = useState(7.48);
  const wholesale = 4.98;
  const profit = markupRate - wholesale;

  const handleStep1 = () => {
    if (!fullName || !email || !password) {
      setError('Please fill in name, email, and password.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reseller/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          password,
          company_name: companyName,
          markup_rate: markupRate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }
      // Store reseller ID and redirect to welcome
      if (data.reseller_id) {
        sessionStorage.setItem('reseller_id', data.reseller_id);
      }
      router.push('/reseller-welcome');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#0a0a14' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8" style={{ color: '#F07020' }} />
            <span className="text-2xl font-bold text-white">Mouse Reseller</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className={`w-8 h-1 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-gray-700'}`} style={step >= 1 ? { backgroundColor: '#F07020' } : undefined} />
            <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-gray-700'}`} style={step >= 2 ? { backgroundColor: '#F07020' } : undefined} />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-white mb-6">Create your account</h2>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name *</label>
                  <input
                    type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Email *</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Phone</label>
                  <input
                    type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="(910) 555-1234"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Company Name</label>
                  <input
                    type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Smith Digital Solutions"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Password *</label>
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                onClick={handleStep1}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#F07020' }}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Set your price</h2>
              <p className="text-sm text-gray-400 mb-6">Choose what you charge per hour. You keep the difference above $4.98.</p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-400 mb-1">Your hourly rate</p>
                  <p className="text-4xl font-extrabold text-white">${markupRate.toFixed(2)}</p>
                </div>
                <input
                  type="range" min={4.98} max={8.98} step={0.25} value={markupRate}
                  onChange={(e) => setMarkupRate(Number(e.target.value))}
                  className="w-full accent-orange-500 mb-6"
                />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Customer pays</span>
                    <span className="text-white font-semibold">${markupRate.toFixed(2)}/hr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Mouse costs</span>
                    <span className="text-white font-semibold">$4.98/hr</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Your profit
                    </span>
                    <span className="font-bold" style={{ color: '#1D9E75' }}>${profit.toFixed(2)}/hr</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6 text-center">
                <p className="text-xs text-gray-500 mb-1">10 customers x 40h/month</p>
                <p className="text-2xl font-bold" style={{ color: '#1D9E75' }}>
                  ${(10 * 40 * profit).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mo
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#F07020' }}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                  ) : (
                    <>Create Reseller Account</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Already a reseller?{' '}
          <a href="/reseller" className="underline" style={{ color: '#F07020' }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}
