import Link from "next/link";

export default function PublicNav() {
  return (
    <nav className="bg-mouse-navy px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-xl tracking-tight">
          Mouse
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/pricing" className="text-mouse-slate hover:text-white text-sm transition-colors">
            Pricing
          </Link>
          <Link href="/onboard" className="text-mouse-slate hover:text-white text-sm transition-colors">
            Get Started
          </Link>
          <Link href="/login" className="text-mouse-slate hover:text-white text-sm transition-colors">
            Log In
          </Link>
          <Link
            href="/onboard"
            className="bg-mouse-orange text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
          >
            Deploy Your AI Workforce
          </Link>
        </div>
        <div className="md:hidden">
          <Link
            href="/onboard"
            className="bg-mouse-orange text-white px-3 py-1.5 rounded text-sm font-semibold"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
