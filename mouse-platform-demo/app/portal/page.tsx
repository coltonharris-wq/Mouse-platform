'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, CheckCircle, Clock, DollarSign, Menu, X,
  CreditCard, MessageSquare, Zap, Bot, ArrowRight,
} from 'lucide-react';
import { useWorkHours } from '@/app/context/WorkHoursContext';
import { useEmployees } from '@/app/context/EmployeeContext';

export default function PortalDashboardPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { balance, totalHours } = useWorkHours();
  const { employees } = useEmployees();

  useEffect(() => {
    const session = localStorage.getItem('mouse_session');
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(session));
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mouse-offwhite flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-mouse-teal border-t-transparent rounded-full"/>
      </div>
    );
  }

  const activeEmployees = employees?.filter((e: any) => e.status === 'active')?.length || 0;
  const safeBalance = Number.isFinite(balance) ? balance : 0;
  const safeTotalHours = Number.isFinite(totalHours) ? totalHours : 0;
  const hoursUsed = safeTotalHours - safeBalance;

  return (
    <div className="min-h-screen bg-mouse-offwhite pb-20">
      {/* Header */}
      <header className="bg-[#0B1F3B] border-b border-[#1a3358] sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 -ml-2 text-gray-300 hover:text-white"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <span className="text-white font-bold text-xl">🖱️ Mouse</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                localStorage.removeItem('mouse_session');
                router.push('/login');
              }}
              className="text-gray-300 hover:text-white text-base font-medium"
            >
              Logout
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-mouse-teal to-[#0B1F3B] rounded-full flex items-center justify-center text-white text-base font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 top-14 bg-mouse-offwhite z-40 p-4">
          <nav className="space-y-1">
            <MenuItem href="/portal" icon={<Zap className="w-6 h-6" />} label="Dashboard" active />
            <MenuItem href="/dashboard/marketplace" icon={<StoreIcon className="w-6 h-6" />} label="AI Marketplace" />
            <MenuItem href="/portal/employees" icon={<Users className="w-6 h-6" />} label="My Employees" />
            <MenuItem href="/portal/work-hours" icon={<Clock className="w-6 h-6" />} label="Usage" />
            <MenuItem href="/portal/billing" icon={<CreditCard className="w-6 h-6" />} label="Billing" />
            <MenuItem href="/portal/messages" icon={<MessageSquare className="w-6 h-6" />} label="Messages" />
          </nav>
          <div className="mt-8 pt-4 border-t border-gray-200">
            <button 
              onClick={() => {
                localStorage.removeItem('mouse_session');
                router.push('/login');
              }}
              className="w-full text-left px-4 py-3 text-red-500 text-base font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B1F3B] mb-2">
            Welcome back
          </h1>
          <p className="text-mouse-slate text-lg">{user?.email}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/portal/king-mouse"
            className="bg-gradient-to-br from-[#0B1F3B] to-mouse-teal rounded-2xl p-6 text-white block hover:shadow-lg transition-shadow">
            <Bot className="w-8 h-8 mb-4" />
            <h3 className="font-semibold text-xl mb-2">King Mouse</h3>
            <p className="text-white/90 text-base leading-relaxed">Your AI orchestrator. Ask questions, give commands, get insights.</p>
          </Link>
          <Link href="/dashboard/marketplace"
            className="bg-gradient-to-br from-mouse-teal to-[#0B1F3B] rounded-2xl p-6 text-white block hover:shadow-lg transition-shadow">
            <Users className="w-8 h-8 mb-4" />
            <h3 className="font-semibold text-xl mb-2">Hire Employee</h3>
            <p className="text-white/90 text-base leading-relaxed">Browse 30 AI employees. Sales, admin, support, and more.</p>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard value={activeEmployees} label="Employees Active" icon={<Users className="w-6 h-6" />} color="text-mouse-teal" />
          <StatCard value={0} label="Tasks Today" icon={<CheckCircle className="w-6 h-6" />} color="text-green-500" />
          <StatCard value={`${Math.round(safeBalance)}`} label="Hours Remaining" icon={<Clock className="w-6 h-6" />} color="text-mouse-teal" />
          <StatCard value={`$${(hoursUsed * 4.98).toFixed(0)}`} label="Value Generated" icon={<DollarSign className="w-6 h-6" />} color="text-amber-500" />
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#0B1F3B] font-semibold text-lg">Activity</h2>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"/>
              <span className="text-green-600 text-sm font-medium">Online</span>
            </div>
          </div>
          {activeEmployees === 0 ? (
            <div className="px-5 py-12 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No activity yet</p>
              <p className="text-gray-400 text-sm mt-1">Hire your first AI employee to see activity here.</p>
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-gray-500">Employee activity will appear here in real-time.</p>
            </div>
          )}
          <Link 
            href="/portal/work-hours"
            className="block w-full py-4 text-center text-orange-500 text-base font-medium border-t border-gray-100 hover:bg-orange-50"
          >
            View Usage Details
          </Link>
        </div>

        {/* Upgrade CTA */}
        <div className="mt-8 bg-gradient-to-r from-[#0B1F3B] to-mouse-teal rounded-2xl p-6">
          <h3 className="text-white font-semibold text-xl mb-2">Need More Hours?</h3>
          <p className="text-white/90 text-base mb-4">Upgrade your plan for more AI work hours and faster results.</p>
          <Link 
            href="/portal/billing"
            className="inline-flex items-center gap-2 bg-orange-500 text-white font-semibold px-5 py-3 rounded-lg text-base hover:bg-orange-600 transition-colors"
          >
            View Plans
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0B1F3B] border-t border-white/10 px-4 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <BottomNavItem href="/portal" icon={<Zap className="w-7 h-7" />} label="Home" active />
          <BottomNavItem href="/portal/king-mouse" icon={<Bot className="w-7 h-7" />} label="King" />
          <BottomNavItem href="/portal/employees" icon={<Users className="w-7 h-7" />} label="Team" />
          <BottomNavItem href="/portal/billing" icon={<CreditCard className="w-7 h-7" />} label="Billing" />
        </div>
      </nav>
    </div>
  );
}

function StoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function MenuItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
        active ? 'bg-mouse-teal/10 text-mouse-teal' : 'text-gray-600 hover:bg-gray-100 hover:text-[#0B1F3B]'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function StatCard({ value, label, icon, color }: { value: string | number; label: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-[#0B1F3B] border border-[#1a3358] rounded-2xl p-5">
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-3xl md:text-4xl font-bold text-white mb-1">{value}</p>
      <p className="text-gray-300 text-sm font-medium">{label}</p>
    </div>
  );
}

function BottomNavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex flex-col items-center py-2 px-3 ${active ? 'text-[#14B8B6]' : 'text-white/50 hover:text-white/80'}`}
    >
      {icon}
      <span className="text-xs mt-1 font-medium">{label}</span>
    </Link>
  );
}
