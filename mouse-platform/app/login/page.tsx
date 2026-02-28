'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bot, Eye, EyeOff, Loader2 } from 'lucide-react';

type UserRole = 'admin' | 'sales' | 'reseller' | 'customer';

interface User {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

// Demo users for testing
const demoUsers: User[] = [
  { email: 'admin@mouse.ai', password: 'admin123', role: 'admin', name: 'Admin User' },
  { email: 'sales@mouse.ai', password: 'sales123', role: 'sales', name: 'Sales User' },
  { email: 'reseller@mouse.ai', password: 'reseller123', role: 'reseller', name: 'Reseller User' },
  { email: 'customer@mouse.ai', password: 'customer123', role: 'customer', name: 'Customer User' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = demoUsers.find(u => u.email === email && u.password === password);

    if (user) {
      // Store user info in localStorage (in production, use secure cookies/JWT)
      localStorage.setItem('user', JSON.stringify({
        email: user.email,
        role: user.role,
        name: user.name,
      }));

      // Redirect based on role
      switch (user.role) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'sales':
          router.push('/dashboard/sales');
          break;
        case 'reseller':
          router.push('/dashboard/reseller');
          break;
        case 'customer':
          router.push('/dashboard/customer');
          break;
        default:
          router.push('/dashboard');
      }
    } else {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role: UserRole) => {
    const user = demoUsers.find(u => u.role === role);
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#1e3a5f]">Mouse</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-[#1e3a5f]">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your dashboard based on your role
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1e3a5f] focus:border-[#1e3a5f] sm:text-sm"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1e3a5f] focus:border-[#1e3a5f] sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#1e3a5f] focus:ring-[#1e3a5f] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[#1e3a5f] hover:text-[#2d4a6f]">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1e3a5f] hover:bg-[#2d4a6f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a5f] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {(['admin', 'sales', 'reseller', 'customer'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => fillDemoCredentials(role)}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 capitalize"
                >
                  {role}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-center text-gray-500">
              Click any role to auto-fill demo credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
