import { Clock, Moon, DollarSign } from "lucide-react";

export default function SimpleLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* HERO - Only section above fold */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight mb-8">
            Hire An Employee That Works 24/7 For{" "}
            <span className="text-slate-700">$997/Month</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto">
            AI employees handle your busywork. You focus on growth.
          </p>

          {/* Single CTA Button */}
          <button
            className="bg-mouse-orange hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-xl px-12 py-8 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            See Available Employees
          </button>
        </div>
      </section>

      {/* BELOW FOLD - Minimal content */}
      
      {/* 3 Icons Row */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {/* Icon 1 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Hires in 5 minutes
              </h3>
            </div>

            {/* Icon 2 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                <Moon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Works while you sleep
              </h3>
            </div>

            {/* Icon 3 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Saves $20,000+/year
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Single Testimonial */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          {/* Avatar placeholder */}
          <div className="w-20 h-20 rounded-full bg-slate-200 mx-auto mb-6 flex items-center justify-center">
            <span className="text-2xl text-slate-400">MR</span>
          </div>
          
          {/* Quote */}
          <blockquote className="text-2xl md:text-3xl text-slate-900 font-medium mb-4">
            "I saved 15 hours a week."
          </blockquote>
          
          {/* Attribution */}
          <p className="text-slate-600">
            Mike R., 58, Construction
          </p>
        </div>
      </section>

      {/* Guarantee Line */}
      <section className="py-12 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-slate-700">
            30-day money-back guarantee. No questions asked.
          </p>
        </div>
      </section>

      {/* Second CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <button
            className="bg-mouse-orange hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-xl px-12 py-8 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            See Available Employees
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl mb-2">(555) 123-4567</p>
          <p className="text-slate-400 text-sm mb-6">Real humans answer 24/7</p>
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
