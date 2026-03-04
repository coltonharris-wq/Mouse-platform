import Link from "next/link";
import { 
  Star, 
  Shield, 
  Check, 
  Phone, 
  Lock, 
  Award, 
  FileCheck,
  Play,
  TrendingDown,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  ChevronRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Video testimonial data
const videoTestimonials = [
  {
    name: "Robert K.",
    title: "HVAC Company Owner",
    age: 62,
    thumbnail: "ROBERT",
    duration: "2:34"
  },
  {
    name: "Linda M.",
    title: "Dental Practice Manager",
    age: 54,
    thumbnail: "LINDA",
    duration: "3:12"
  },
  {
    name: "David S.",
    title: "Construction Foreman",
    age: 58,
    thumbnail: "DAVID",
    duration: "1:58"
  }
];

// Written testimonials
const writtenTestimonials = [
  {
    name: "Mike R.",
    title: "Construction Owner",
    age: 58,
    image: "MR",
    quote: "I was skeptical about AI. But I've saved $26,000 this year.",
    before: "70 hrs/week",
    after: "45 hrs/week",
    savings: "$26,000"
  },
  {
    name: "Susan T.",
    title: "Real Estate Broker",
    age: 52,
    image: "ST",
    quote: "My AI employee handles all my follow-ups. I close 40% more deals now.",
    before: "60 hrs/week",
    after: "35 hrs/week",
    savings: "$34,000"
  },
  {
    name: "James H.",
    title: "Auto Shop Owner",
    age: 61,
    image: "JH",
    quote: "I finally have weekends back. The AI runs my appointment system 24/7.",
    before: "65 hrs/week",
    after: "40 hrs/week",
    savings: "$28,000"
  },
  {
    name: "Patricia W.",
    title: "Law Firm Partner",
    age: 55,
    image: "PW",
    quote: "Client intake used to take 4 hours a day. Now it takes zero.",
    before: "55 hrs/week",
    after: "30 hrs/week",
    savings: "$31,000"
  },
  {
    name: "Thomas B.",
    title: "Plumbing Business Owner",
    age: 59,
    image: "TB",
    quote: "Best investment I've made. ROI paid for itself in 6 weeks.",
    before: "68 hrs/week",
    after: "42 hrs/week",
    savings: "$24,000"
  },
  {
    name: "Carol M.",
    title: "Medical Practice Director",
    age: 57,
    image: "CM",
    quote: "Patient scheduling, insurance calls, reminders—it's all automated.",
    before: "50 hrs/week",
    after: "32 hrs/week",
    savings: "$29,000"
  }
];

// Case study data
const caseStudyData = [
  { month: "Month 1", labor: 15000, ai: 2997, hours: 45 },
  { month: "Month 2", labor: 15000, ai: 2997, hours: 52 },
  { month: "Month 3", labor: 15000, ai: 2997, hours: 58 },
  { month: "Month 4", labor: 15000, ai: 2997, hours: 61 },
  { month: "Month 5", labor: 15000, ai: 2997, hours: 64 },
  { month: "Month 6", labor: 15000, ai: 2997, hours: 67 },
];

export default function TrustLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#0B1F3B] py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Social Proof Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-white/90 text-sm font-medium">4.9/5 from 200+ reviews</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight max-w-4xl mx-auto">
              Join 847 Business Owners Who've Gotten 15+ Hours Back Every Week
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              No technical skills required. No contracts. 30-day guarantee.
            </p>

            {/* Video Testimonials */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {videoTestimonials.map((video, idx) => (
                <div 
                  key={idx}
                  className="relative group cursor-pointer bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all"
                >
                  <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-[#1a3a5c] to-[#0B1F3B]">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-white ml-1" fill="white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white font-semibold text-sm">{video.name}, {video.age}</p>
                    <p className="text-white/70 text-xs">{video.title}</p>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 rounded px-2 py-0.5">
                    <span className="text-white text-xs">{video.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-10">
              <Link
                href="#qualify"
                className="inline-flex items-center gap-2 bg-white text-[#0B1F3B] text-lg font-bold px-10 py-4 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                See If You Qualify
                <ChevronRight className="w-5 h-5" />
              </Link>
              <p className="mt-3 text-white/50 text-sm">Takes 60 seconds. No credit card required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-gray-50 py-8 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* As Seen On */}
            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
              <span className="text-gray-500 text-sm font-medium">As seen on:</span>
              <div className="flex items-center gap-6">
                <span className="text-xl font-bold text-gray-400">Forbes</span>
                <span className="text-xl font-bold text-gray-400">Inc</span>
                <span className="text-xl font-bold text-gray-400">Business Insider</span>
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex flex-wrap items-center gap-4 justify-center">
              <div className="flex items-center gap-2 text-gray-600">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">SSL Secure</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">SOC2</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FileCheck className="w-4 h-4" />
                <span className="text-sm font-medium">HIPAA</span>
              </div>
            </div>

            {/* Phone Support */}
            <div className="flex items-center gap-2 text-[#0B1F3B]">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-semibold">Real phone support: (555) 123-4567</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section - Testimonial Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1F3B]">
              Real Business Owners. Real Results.
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Join hundreds of owners over 50 who've transformed their businesses with AI employees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {writtenTestimonials.map((testimonial, idx) => (
              <div 
                key={idx}
                className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                {/* Header with Avatar */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#0B1F3B] flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-bold text-[#0B1F3B]">{testimonial.name}, {testimonial.age}</p>
                    <p className="text-sm text-gray-500">{testimonial.title}</p>
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-gray-700 mb-4 italic">
                  "{testimonial.quote}"
                </blockquote>

                {/* Before/After */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-500">Before:</span>
                      <span className="text-sm font-semibold text-red-600">{testimonial.before}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-500">After:</span>
                      <span className="text-sm font-semibold text-green-600">{testimonial.after}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <DollarSign className="w-4 h-4 text-[#0F6B6E]" />
                    <span className="text-sm text-gray-500">Annual savings:</span>
                    <span className="text-sm font-bold text-[#0F6B6E]">{testimonial.savings}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Section */}
      <section className="py-20 bg-[#0B1F3B]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-white/90 text-sm font-medium">Featured Case Study</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                How Redwood Construction Saved $31,000 in 6 Months
              </h2>
              
              <p className="text-white/70 text-lg mb-6">
                Redwood Construction was drowning in administrative work. Their owner, Mike, 
                was working 70-hour weeks just to keep up with quotes, follow-ups, and scheduling.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Labor costs reduced by 67%</p>
                    <p className="text-white/50 text-sm">From $15,000/month to $2,997/month</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">342 hours saved</p>
                    <p className="text-white/50 text-sm">Owner reclaimed 25 hours per week</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">$31,000 total savings</p>
                    <p className="text-white/50 text-sm">ROI achieved in first month</p>
                  </div>
                </div>
              </div>

              <button className="inline-flex items-center gap-2 bg-white text-[#0B1F3B] font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                Read Full Case Study
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right - Visual Chart */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-6 text-center">Cost Comparison: Labor vs AI</h3>
              
              {/* Chart */}
              <div className="space-y-4">
                {caseStudyData.map((data, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">{data.month}</span>
                      <span className="text-green-400 font-semibold">{data.hours} hrs saved</span>
                    </div>
                    <div className="flex gap-2 h-8">
                      {/* Labor Cost Bar */}
                      <div 
                        className="bg-red-400/30 rounded flex items-center justify-end px-2"
                        style={{ width: '75%' }}
                      >
                        <span className="text-red-300 text-xs font-medium">${(data.labor/1000).toFixed(0)}k</span>
                      </div>
                      {/* AI Cost Bar */}
                      <div 
                        className="bg-green-400/30 rounded flex items-center justify-end px-2"
                        style={{ width: '15%' }}
                      >
                        <span className="text-green-300 text-xs font-medium">${(data.ai/1000).toFixed(1)}k</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400/30 rounded"></div>
                  <span className="text-white/60 text-sm">Previous Labor Costs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400/30 rounded"></div>
                  <span className="text-white/60 text-sm">AI Employee Cost</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-[#0B1F3B] rounded-full flex items-center justify-center">
            <Shield className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1F3B] mb-4">
            30-Day "Love It or Leave It" Guarantee
          </h2>
          
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            If your AI employee doesn't save you 10+ hours in 30 days, we'll refund every penny 
            <span className="text-[#0B1F3B] font-bold"> + $500 for your trouble</span>
          </p>
          
          <p className="text-gray-500 text-sm">
            No questions asked. No hoops to jump through.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="w-5 h-5 text-green-500" />
              <span>Full refund within 30 days</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="w-5 h-5 text-green-500" />
              <span>$500 additional compensation</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="w-5 h-5 text-green-500" />
              <span>No cancellation fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-[#0B1F3B] rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#0B1F3B] mb-1">You approve every action</h3>
                <p className="text-gray-600 text-sm">Your AI never acts without your permission. Stay in complete control.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-[#0B1F3B] rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#0B1F3B] mb-1">Real humans available 24/7</h3>
                <p className="text-gray-600 text-sm">Phone, email, or chat—our US-based team is always here to help.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-[#0B1F3B] rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#0B1F3B] mb-1">Works with your existing software</h3>
                <p className="text-gray-600 text-sm">No integrations needed. Your AI uses the tools you already have.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-[#0B1F3B] rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#0B1F3B] mb-1">Cancel anytime</h3>
                <p className="text-gray-600 text-sm">No contracts. No commitments. Stay because it works, not because you have to.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="qualify" className="py-20 bg-[#0B1F3B]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Get Your Free Savings Analysis
            </h2>
            <p className="text-white/70 text-lg">
              See exactly how much time and money an AI employee could save your business.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <form className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="John Smith"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3B] focus:border-[#0B1F3B] outline-none transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="john@yourbusiness.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3B] focus:border-[#0B1F3B] outline-none transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3B] focus:border-[#0B1F3B] outline-none transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="business" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <select
                  id="business"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3B] focus:border-[#0B1F3B] outline-none transition-all bg-white"
                >
                  <option value="">Select your industry</option>
                  <option value="construction">Construction / Home Services</option>
                  <option value="medical">Medical / Dental Practice</option>
                  <option value="legal">Legal / Accounting</option>
                  <option value="realestate">Real Estate</option>
                  <option value="retail">Retail / E-commerce</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0B1F3B] text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-[#1a3a5c] transition-colors shadow-lg"
              >
                Get My Free Analysis
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Phone className="w-4 h-4" />
                <span className="text-sm">We'll call you within 24 hours</span>
              </div>
            </div>
          </div>

          {/* Trust badges below form */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-white/60">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Your info is secure</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Users className="w-4 h-4" />
              <span className="text-sm">No spam, ever</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Check className="w-4 h-4" />
              <span className="text-sm">Unsubscribe anytime</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
