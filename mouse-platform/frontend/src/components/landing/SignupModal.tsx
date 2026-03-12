'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface SignupModalProps {
  industry: string;
  niche: string;
  sessionToken: string;
  chatTranscript: { role: string; content: string }[];
  businessNameHint: string;
  onClose: () => void;
}

export default function SignupModal({
  industry,
  niche,
  sessionToken,
  chatTranscript,
  businessNameHint,
  onClose,
}: SignupModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState(businessNameHint);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          business_name: businessName,
          owner_name: '',
          phone: phone || null,
          industry,
          niche,
          session_token: sessionToken,
          demo_chat_transcript: chatTranscript,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed. Please try again.');
        setSubmitting(false);
        return;
      }

      // Store customer_id and token for provisioning
      if (data.customer_id) {
        sessionStorage.setItem('customer_id', data.customer_id);
      }
      if (data.access_token) {
        sessionStorage.setItem('access_token', data.access_token);
      }
      sessionStorage.setItem('signup_industry', industry);
      sessionStorage.setItem('signup_niche', niche);
      sessionStorage.setItem('signup_business_name', businessName || '');

      // Redirect to provisioning
      window.location.href = `/provisioning?customer_id=${data.customer_id}`;
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return;
    // Store context for post-OAuth redirect
    sessionStorage.setItem('signup_industry', industry);
    sessionStorage.setItem('signup_niche', niche);
    sessionStorage.setItem('signup_session_token', sessionToken);
    sessionStorage.setItem('signup_transcript', JSON.stringify(chatTranscript));
    sessionStorage.setItem('signup_business_name', businessName);

    const redirectTo = `${window.location.origin}/provisioning?oauth=google`;
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{'\u{1F42D}'}</div>
            <h2 className="text-2xl font-bold text-[#0B1F3B]">Create Your Account</h2>
            <p className="text-gray-500 mt-1">Save your progress and set up your dashboard</p>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-[#0F6B6E] focus:ring-1 focus:ring-[#0F6B6E] outline-none"
                placeholder="you@business.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-[#0F6B6E] focus:ring-1 focus:ring-[#0F6B6E] outline-none"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-[#0F6B6E] focus:ring-1 focus:ring-[#0F6B6E] outline-none"
                placeholder="Your Business Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-[#0F6B6E] focus:ring-1 focus:ring-[#0F6B6E] outline-none"
                placeholder="(555) 123-4567"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="w-full bg-[#0F6B6E] text-white py-3 rounded-xl font-semibold hover:bg-[#0B5456] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
