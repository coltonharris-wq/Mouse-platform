import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-mouse-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="text-white text-xl font-bold tracking-tight">
              Mouse
            </Link>
            <p className="mt-3 text-mouse-slate text-sm leading-relaxed">
              AI Workforce Operating System. Deploy digital workers that operate your existing software.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#features"
                  className="text-mouse-slate text-sm hover:text-mouse-orange transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-mouse-slate text-sm hover:text-mouse-orange transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/#use-cases"
                  className="text-mouse-slate text-sm hover:text-mouse-orange transition-colors"
                >
                  Use Cases
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-mouse-slate text-sm hover:text-mouse-orange transition-colors"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#about"
                  className="text-mouse-slate text-sm hover:text-mouse-orange transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/#testimonials"
                  className="text-mouse-slate text-sm hover:text-mouse-orange transition-colors"
                >
                  Customers
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:hello@mouseplatform.com"
                  className="text-mouse-slate text-sm hover:text-mouse-orange transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="text-mouse-slate text-sm hover:text-mouse-orange transition-colors"
                >
                  Partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-mouse-slate text-sm hover:text-mouse-orange transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-mouse-slate text-sm hover:text-mouse-orange transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="text-mouse-slate text-sm hover:text-mouse-orange transition-colors"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  href="/sla"
                  className="text-mouse-slate text-sm hover:text-mouse-orange transition-colors"
                >
                  SLA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <p className="text-mouse-slate text-sm text-center">
            &copy; 2025 Mouse Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
