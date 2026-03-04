import Image from "next/image";
import Link from "next/link";
import { 
  AlertCircle, 
  Mail, 
  FileSpreadsheet, 
  UserX, 
  ArrowRight, 
  CheckCircle2,
  UserCheck,
  Clock,
  TrendingUp,
  Quote,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import PublicNav from "@/components/PublicNav";
import Footer from "@/components/Footer";

export default function StoryLandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicNav />
      
      {/* HERO SECTION */}
      <section className="bg-mouse-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-mouse-navy via-mouse-navy to-[#0F6B6E]/20" />
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Are You Drowning In{" "}
                <span className="text-mouse-orange">Busywork?</span>
              </h1>
              <p className="text-lg md:text-xl text-mouse-slate mb-8 max-w-xl mx-auto lg:mx-0">
                Most business owners waste 20+ hours a week on tasks that don&apos;t grow their business.
              </p>
              <Link
                href="#problem"
                className="inline-flex items-center gap-2 bg-mouse-orange text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-600 transition-all hover:scale-105 shadow-lg shadow-orange-500/25"
              >
                There&apos;s A Better Way
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop"
                  alt="Stressed business owner working late at night"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-mouse-navy/60 to-transparent" />
              </div>
              {/* Floating stat card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-mouse-red" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-mouse-navy">20+</p>
                    <p className="text-sm text-gray-500">Hours wasted weekly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* THE PROBLEM SECTION */}
      <section id="problem" className="py-20 lg:py-28 bg-mouse-offwhite">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-mouse-teal font-semibold text-sm uppercase tracking-wider mb-4">
            The Reality
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-mouse-navy mb-6">
            You started your business to do what you love...
          </h2>
          <p className="text-xl text-gray-600 mb-16">But now you spend your days:</p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Pain Point 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <AlertCircle className="w-7 h-7 text-mouse-red" />
              </div>
              <h3 className="font-semibold text-mouse-navy mb-2">Chasing unpaid invoices</h3>
              <p className="text-sm text-gray-500">Sending reminders, following up, dealing with excuses</p>
            </div>
            
            {/* Pain Point 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Mail className="w-7 h-7 text-mouse-orange" />
              </div>
              <h3 className="font-semibold text-mouse-navy mb-2">Answering the same emails</h3>
              <p className="text-sm text-gray-500">Over and over, day after day</p>
            </div>
            
            {/* Pain Point 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <FileSpreadsheet className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-mouse-navy mb-2">Updating spreadsheets</h3>
              <p className="text-sm text-gray-500">Manual data entry that never ends</p>
            </div>
            
            {/* Pain Point 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <UserX className="w-7 h-7 text-gray-600" />
              </div>
              <h3 className="font-semibold text-mouse-navy mb-2">Following up with leads</h3>
              <p className="text-sm text-gray-500">...who never respond</p>
            </div>
          </div>
          
          <div className="bg-mouse-navy rounded-2xl p-8 md:p-12 text-white">
            <p className="text-xl md:text-2xl font-medium leading-relaxed">
              By 8pm, you&apos;re <span className="text-mouse-orange font-bold">exhausted</span>. 
              Your family <span className="text-mouse-orange font-bold">misses you</span>. 
              And your business <span className="text-mouse-orange font-bold">isn&apos;t growing</span>.
            </p>
          </div>
        </div>
      </section>

      {/* THE TURNING POINT */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&h=600&fit=crop"
                  alt="Relaxed business owner spending time with family"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-mouse-teal/20 to-transparent" />
              </div>
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <p className="text-mouse-teal font-semibold text-sm uppercase tracking-wider mb-4">
                The Turning Point
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-mouse-navy mb-8 leading-tight">
                What if you could hire someone to handle{" "}
                <span className="text-mouse-teal">ALL of that</span>...
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 justify-center lg:justify-start">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💰</span>
                  </div>
                  <p className="text-xl text-gray-700">
                    For <span className="font-bold text-mouse-navy">less than $6 an hour?</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-4 justify-center lg:justify-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <p className="text-xl text-gray-700">
                    While you focus on what <span className="font-bold text-mouse-navy">actually matters?</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE SOLUTION */}
      <section className="py-20 lg:py-28 bg-mouse-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-mouse-navy via-mouse-navy to-mouse-teal/20" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-mouse-teal font-semibold text-sm uppercase tracking-wider mb-4">
              Introducing
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Meet <span className="text-mouse-orange">Mouse</span> — AI Employees That Actually Work
            </h2>
            <div className="space-y-2 text-lg text-mouse-slate">
              <p>Not chatbots. Not fancy software you have to learn.</p>
              <p className="text-white font-medium">
                Real digital employees that log into YOUR tools and do YOUR work.
              </p>
            </div>
          </div>
          
          {/* 3-Step Visual */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/10 hover:bg-white/15 transition-colors">
              <div className="w-16 h-16 bg-mouse-orange rounded-2xl flex items-center justify-center mb-6 mx-auto text-3xl font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Choose</h3>
              <p className="text-mouse-slate">Pick from our marketplace of specialized AI employees</p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/10 hover:bg-white/15 transition-colors">
              <div className="w-16 h-16 bg-mouse-teal rounded-2xl flex items-center justify-center mb-6 mx-auto text-3xl font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Connect</h3>
              <p className="text-mouse-slate">Link to your existing tools — CRM, email, spreadsheets</p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/10 hover:bg-white/15 transition-colors">
              <div className="w-16 h-16 bg-mouse-green rounded-2xl flex items-center justify-center mb-6 mx-auto text-3xl font-bold text-white">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Watch Them Work</h3>
              <p className="text-mouse-slate">Your AI employee starts handling tasks immediately</p>
            </div>
          </div>
          
          {/* Arrow connectors for desktop */}
          <div className="hidden md:flex justify-center items-center gap-4 -mt-40 mb-20 pointer-events-none">
            <div className="w-full max-w-xs" />
            <ArrowRight className="w-8 h-8 text-white/30" />
            <div className="w-full max-w-xs" />
            <ArrowRight className="w-8 h-8 text-white/30" />
            <div className="w-full max-w-xs" />
          </div>
        </div>
      </section>

      {/* PROOF SECTION */}
      <section className="py-20 lg:py-28 bg-mouse-offwhite">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-mouse-teal font-semibold text-sm uppercase tracking-wider mb-4">
              Real Results
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-mouse-navy">
              But Does It Actually Work?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Mike's Story */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-mouse-navy rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                👨‍💼
              </div>
              <h3 className="text-xl font-bold text-mouse-navy mb-4">Mike</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-red-500">
                  <span className="line-through font-medium">70 hrs/week</span>
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-mouse-green font-bold">45 hrs/week</span>
                </div>
                <p className="text-sm text-gray-500">Got his weekends back</p>
              </div>
            </div>
            
            {/* Sarah's Story */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-mouse-navy rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                👩‍💻
              </div>
              <h3 className="text-xl font-bold text-mouse-navy mb-4">Sarah</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-red-500 line-through font-medium">$0 new revenue</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-mouse-green font-bold text-lg">
                  <TrendingUp className="w-5 h-5" />
                  <span>$47K in 3 months</span>
                </div>
                <p className="text-sm text-gray-500">AI employee closed deals while she slept</p>
              </div>
            </div>
            
            {/* David's Story */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-mouse-navy rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                👨‍🔧
              </div>
              <h3 className="text-xl font-bold text-mouse-navy mb-4">David</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-red-500">
                  <span className="line-through font-medium">10 missed follow-ups/day</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-mouse-green font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>0 missed</span>
                </div>
                <p className="text-sm text-gray-500">Every lead gets a response</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xl text-mouse-navy font-medium">
              And they did it <span className="text-mouse-orange font-bold">without hiring a single human.</span>
            </p>
          </div>
        </div>
      </section>

      {/* OBJECTION HANDLING */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-mouse-navy mb-4">
              I know what you&apos;re thinking...
            </h2>
          </div>
          
          <div className="space-y-8">
            {/* Objection 1 */}
            <div className="bg-mouse-offwhite rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-4">
                <Quote className="w-8 h-8 text-mouse-orange flex-shrink-0" />
                <p className="text-xl font-medium text-mouse-navy italic">
                  &quot;This sounds too good to be true.&quot;
                </p>
              </div>
              <div className="ml-12">
                <p className="text-gray-600 mb-4">
                  We get it. You&apos;ve seen AI hype before. But Mouse isn&apos;t a chatbot — 
                  it&apos;s a digital employee that actually logs into your systems and performs tasks. 
                  You can watch them work in real-time.
                </p>
                <div className="flex items-center gap-3 text-sm text-mouse-teal font-medium">
                  <UserCheck className="w-5 h-5" />
                  <span>&quot;I was skeptical too. Then my AI employee booked 3 meetings in the first hour.&quot; — Jennifer R.</span>
                </div>
              </div>
            </div>
            
            {/* Objection 2 */}
            <div className="bg-mouse-offwhite rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-4">
                <Quote className="w-8 h-8 text-mouse-orange flex-shrink-0" />
                <p className="text-xl font-medium text-mouse-navy italic">
                  &quot;I tried AI before and it was useless.&quot;
                </p>
              </div>
              <div className="ml-12">
                <p className="text-gray-600 mb-4">
                  Most AI tools make you do all the work. Mouse is different — our AI employees 
                  are pre-trained for specific business roles. They know what to do from day one.
                </p>
                <div className="flex items-center gap-3 text-sm text-mouse-teal font-medium">
                  <UserCheck className="w-5 h-5" />
                  <span>&quot;ChatGPT couldn&apos;t help my business. Mouse actually did my invoicing.&quot; — Marcus T.</span>
                </div>
              </div>
            </div>
            
            {/* Objection 3 */}
            <div className="bg-mouse-offwhite rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-4">
                <Quote className="w-8 h-8 text-mouse-orange flex-shrink-0" />
                <p className="text-xl font-medium text-mouse-navy italic">
                  &quot;I don&apos;t have time to learn new software.&quot;
                </p>
              </div>
              <div className="ml-12">
                <p className="text-gray-600 mb-4">
                  That&apos;s exactly why we built Mouse. Setup takes 5 minutes. No training. 
                  No complex workflows. Just pick your employee, connect your tools, and watch them work.
                </p>
                <div className="flex items-center gap-3 text-sm text-mouse-teal font-medium">
                  <UserCheck className="w-5 h-5" />
                  <span>&quot;I&apos;m not tech-savvy at all. If I can do it, anyone can.&quot; — Linda K.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE OFFER */}
      <section className="py-20 lg:py-28 bg-mouse-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-mouse-navy via-mouse-navy to-mouse-teal/30" />
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-mouse-orange/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-mouse-teal/10 rounded-full blur-3xl" />
        
        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-mouse-orange/20 text-mouse-orange px-4 py-2 rounded-full text-sm font-semibold mb-8">
            <Sparkles className="w-4 h-4" />
            Limited Time Offer
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Try Your First AI Employee For{" "}
            <span className="text-mouse-orange">30 Days</span>
          </h2>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
            <p className="text-xl text-white mb-4">
              If you don&apos;t save at least <span className="font-bold text-mouse-orange">10 hours</span> in 30 days...
            </p>
            <p className="text-lg text-mouse-slate">
              We&apos;ll refund every penny{" "}
              <span className="text-white font-bold">AND give you $500</span>{" "}
              for wasting your time.
            </p>
          </div>
          
          <p className="text-mouse-teal font-semibold text-lg">
            That&apos;s how confident we are.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 lg:py-28 bg-mouse-offwhite">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-mouse-navy mb-8">
            Choose Your AI Employee
          </h2>
          
          <Link
            href="/dashboard/marketplace"
            className="inline-flex items-center gap-3 bg-mouse-orange text-white px-10 py-5 rounded-xl text-xl font-bold hover:bg-orange-600 transition-all hover:scale-105 shadow-xl shadow-orange-500/25 mb-6"
          >
            Browse The Marketplace
            <ArrowRight className="w-6 h-6" />
          </Link>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Takes 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
