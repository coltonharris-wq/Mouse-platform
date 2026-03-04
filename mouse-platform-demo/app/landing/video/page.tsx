"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Play, 
  X, 
  Star, 
  ArrowRight, 
  Building2, 
  Home, 
  Stethoscope, 
  Scale, 
  Store, 
  UtensilsCrossed,
  CheckCircle2,
  Users,
  Mail,
  Database,
  Phone
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

function VideoModal({ isOpen, onClose, title }: VideoModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-4xl">
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X size={32} />
        </button>
        <div className="aspect-video bg-navy-dark rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Play size={64} className="text-white/50 mx-auto mb-4" />
            <p className="text-white/70 text-lg">{title}</p>
            <p className="text-white/50 text-sm mt-2">Video playback coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface VideoCardProps {
  label: string;
  quote: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function VideoCard({ label, quote, icon, onClick }: VideoCardProps) {
  return (
    <div 
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-navy-light to-navy aspect-video"
    >
      {/* Thumbnail placeholder */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-mouse-orange group-hover:scale-110 transition-all duration-300">
          <Play size={28} className="text-white ml-1" fill="white" />
        </div>
      </div>
      
      {/* Label */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="p-1.5 bg-white/10 backdrop-blur-sm rounded">
          {icon}
        </div>
        <span className="text-white/90 text-sm font-medium">{label}</span>
      </div>
      
      {/* Quote overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white text-sm font-medium italic">&ldquo;{quote}&rdquo;</p>
      </div>
    </div>
  );
}

interface FeatureDemoProps {
  title: string;
  description: string;
  onClick: () => void;
}

function FeatureDemo({ title, description, onClick }: FeatureDemoProps) {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="aspect-video bg-gradient-to-br from-mouse-navy to-navy-light relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-mouse-orange group-hover:scale-110 transition-all duration-300">
            <Play size={24} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">30 sec demo</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-mouse-navy">{title}</h3>
        <p className="text-sm text-mouse-charcoal mt-1">{description}</p>
      </div>
    </div>
  );
}

const journeyStages = [
  {
    icon: <Building2 size={24} className="text-mouse-teal" />,
    text: "I thought AI was for tech companies",
    stage: 1
  },
  {
    icon: <CheckCircle2 size={24} className="text-mouse-teal" />,
    text: "I tried it for 30 days",
    stage: 2
  },
  {
    icon: <Users size={24} className="text-mouse-teal" />,
    text: "My AI employee actually works",
    stage: 3
  },
  {
    icon: <Star size={24} className="text-mouse-teal" />,
    text: "I can't imagine running my business without it",
    stage: 4
  }
];

const customerLogos = [
  "Meridian Construction",
  "Apex Dental",
  "Northwest Legal",
  "Summit Realty",
  "Metro Retail Group",
  "Coastal Dining Co.",
  "Pinnacle Auto",
  "Horizon Medical"
];

export default function VideoLandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "" });

  const openVideo = (title: string) => {
    setModalTitle(title);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert("Thanks! We'll be in touch soon.");
    setFormData({ name: "", email: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Video Modal */}
      <VideoModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalTitle} 
      />

      {/* Hero Section - Dark Navy with Video */}
      <section className="bg-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-dark via-navy to-navy-dark" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Price Hook Banner */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-mouse-orange/20 via-mouse-orange/10 to-transparent border-l-4 border-mouse-orange rounded-r-lg px-6 py-4">
              <p className="text-mouse-orange font-bold text-lg sm:text-xl">
                "I was paying $35/hour, now I pay $4.98"
              </p>
              <p className="text-white/70 text-sm mt-1">
                — Mike R., saved $26,000 in his first year
              </p>
            </div>
          </div>

          {/* Video Player */}
          <div className="max-w-4xl mx-auto">
            <div 
              onClick={() => openVideo("57-year-old business owner testimonial")}
              className="group relative aspect-video bg-gradient-to-br from-navy-light to-black rounded-2xl overflow-hidden cursor-pointer shadow-2xl"
            >
              {/* Video placeholder with cinematic gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-mouse-navy/80 via-transparent to-mouse-teal/30" />
              
              {/* Price Overlay on Video */}
              <div className="absolute top-4 right-4 bg-mouse-orange/90 backdrop-blur-sm rounded-lg px-4 py-2 z-20">
                <p className="text-white font-bold text-lg">$4.98/hr</p>
                <p className="text-white/80 text-xs line-through">vs $35/hr</p>
              </div>
              
              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-mouse-orange group-hover:scale-110 transition-all duration-300 border border-white/20">
                  <Play size={36} className="text-white ml-1" fill="white" />
                </div>
              </div>
              
              {/* Video info badge */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-white text-sm font-medium">Mike R., 57</p>
                <p className="text-white/70 text-xs">Construction Business Owner</p>
              </div>
              
              {/* Duration */}
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                <span className="text-white text-xs">2:34</span>
              </div>

              {/* Text Overlay Quote */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 max-w-xs">
                <p className="text-white text-sm font-medium italic">"I was paying $35/hour, now I pay $4.98"</p>
              </div>
            </div>
          </div>
          
          {/* Headline below video */}
          <div className="text-center mt-10 sm:mt-14">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              I Was Skeptical About AI Employees. Then I Tried One.
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
              Watch how Mike saved 15 hours a week and $26,000 a year
            </p>
            <div className="mt-8">
              <Link
                href="#get-started"
                className="inline-flex items-center gap-2 bg-mouse-orange text-white text-lg font-semibold px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
              >
                Get Your Own AI Employee
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Grid Section */}
      <section className="bg-mouse-offwhite py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-mouse-navy">
              Real Business Owners, Real Results
            </h2>
            <p className="mt-3 text-mouse-charcoal max-w-xl mx-auto">
              Hear from owners across industries who transformed their businesses with AI employees
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <VideoCard
              label="Construction Owner"
              quote="Best decision I made for my business"
              icon={<Building2 size={18} className="text-white" />}
              onClick={() => openVideo("Construction Owner Testimonial")}
            />
            <VideoCard
              label="Real Estate Agent"
              quote="Follow-ups happen automatically now"
              icon={<Home size={18} className="text-white" />}
              onClick={() => openVideo("Real Estate Agent Testimonial")}
            />
            <VideoCard
              label="Dentist"
              quote="Patient communication is seamless"
              icon={<Stethoscope size={18} className="text-white" />}
              onClick={() => openVideo("Dentist Testimonial")}
            />
            <VideoCard
              label="Lawyer"
              quote="I focus on cases, not paperwork"
              icon={<Scale size={18} className="text-white" />}
              onClick={() => openVideo("Lawyer Testimonial")}
            />
            <VideoCard
              label="Retail Owner"
              quote="Inventory management runs itself"
              icon={<Store size={18} className="text-white" />}
              onClick={() => openVideo("Retail Owner Testimonial")}
            />
            <VideoCard
              label="Restaurant Owner"
              quote="Scheduling used to take hours"
              icon={<UtensilsCrossed size={18} className="text-white" />}
              onClick={() => openVideo("Restaurant Owner Testimonial")}
            />
          </div>
        </div>
      </section>

      {/* ROI Section - The Numbers Don't Lie */}
      <section className="bg-mouse-navy py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              The Numbers Don&apos;t Lie
            </h2>
            <p className="mt-3 text-white/70">
              See the savings in real numbers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Traditional Employee Cost */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <p className="text-white/60 text-sm uppercase tracking-wide mb-2">Traditional Employee</p>
                <p className="text-5xl font-bold text-white">$35<span className="text-2xl">/hr</span></p>
                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center gap-3 text-white/70">
                    <span className="text-red-400">✕</span>
                    <span>Benefits & taxes (+30%)</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/70">
                    <span className="text-red-400">✕</span>
                    <span>Training & onboarding</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/70">
                    <span className="text-red-400">✕</span>
                    <span>Sick days & vacation</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/70">
                    <span className="text-red-400">✕</span>
                    <span>Office space & equipment</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-white/60 text-sm">Annual cost (2,080 hrs)</p>
                  <p className="text-3xl font-bold text-red-400">$72,800</p>
                </div>
              </div>
            </div>

            {/* AI Employee Cost */}
            <div className="bg-mouse-orange/20 backdrop-blur-sm rounded-2xl p-8 border border-mouse-orange/50">
              <div className="text-center">
                <p className="text-mouse-orange text-sm uppercase tracking-wide font-semibold mb-2">AI Employee</p>
                <p className="text-5xl font-bold text-white">$4.98<span className="text-2xl">/hr</span></p>
                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center gap-3 text-white/80">
                    <span className="text-green-400">✓</span>
                    <span>No benefits or taxes</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <span className="text-green-400">✓</span>
                    <span>Trained instantly</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <span className="text-green-400">✓</span>
                    <span>Works 24/7/365</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <span className="text-green-400">✓</span>
                    <span>No office needed</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-mouse-orange/30">
                  <p className="text-white/60 text-sm">Annual cost (2,080 hrs)</p>
                  <p className="text-3xl font-bold text-green-400">$10,358</p>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Summary */}
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-green-500/20 backdrop-blur-sm rounded-2xl px-8 py-6 border border-green-500/30">
              <div className="text-center sm:text-left">
                <p className="text-green-400 text-sm uppercase tracking-wide font-semibold">Your Annual Savings</p>
                <p className="text-4xl sm:text-5xl font-bold text-white">$62,442</p>
              </div>
              <div className="hidden sm:block w-px h-16 bg-green-500/30" />
              <div className="text-center sm:text-left">
                <p className="text-white/70 text-sm">That&apos;s like getting</p>
                <p className="text-white text-lg font-semibold">7 AI employees for the price of 1</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section - The Skeptic's Journey */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-mouse-navy">
              The Skeptic&apos;s Journey
            </h2>
            <p className="mt-3 text-mouse-charcoal">
              From doubt to dependence — how business owners become believers
            </p>
          </div>
          
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-mouse-teal to-transparent hidden md:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {journeyStages.map((stage, index) => (
                <div key={index} className="relative text-center">
                  {/* Stage number and icon */}
                  <div className="relative z-10 w-24 h-24 mx-auto bg-white rounded-full border-4 border-mouse-teal/20 flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      {stage.icon}
                      <span className="block text-xs text-mouse-charcoal mt-1">Step {stage.stage}</span>
                    </div>
                  </div>
                  
                  {/* Text */}
                  <p className="mt-4 text-sm font-medium text-mouse-navy px-2">
                    {stage.text}
                  </p>
                  
                  {/* Customer photo placeholder */}
                  <div className="mt-4 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mouse-teal/20 to-mouse-navy/20 flex items-center justify-center">
                      <Users size={20} className="text-mouse-teal" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features - Video Demos */}
      <section className="bg-navy-dark py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              See AI Employees in Action
            </h2>
            <p className="mt-3 text-white/70">
              Watch 30-second demos of real tasks being completed
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <FeatureDemo
              title="Watch AI Send Emails"
              description="See how AI drafts and sends personalized follow-up emails to your leads"
              onClick={() => openVideo("AI Email Demo")}
            />
            <FeatureDemo
              title="Watch AI Update CRM"
              description="Watch as AI logs into your CRM and updates contact records automatically"
              onClick={() => openVideo("AI CRM Demo")}
            />
            <FeatureDemo
              title="Watch AI Follow Up"
              description="See the complete lead follow-up process from start to finish"
              onClick={() => openVideo("AI Lead Follow-up Demo")}
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-mouse-navy">
              Join 10,000+ Business Owners
            </h2>
            
            {/* Star rating */}
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className="text-yellow-400" fill="currentColor" />
              ))}
              <span className="ml-2 text-mouse-charcoal font-semibold">4.9/5</span>
            </div>
            <p className="text-sm text-mouse-charcoal mt-1">Based on 2,000+ reviews</p>
          </div>
          
          {/* Logo Wall */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {customerLogos.map((logo, index) => (
              <div 
                key={index}
                className="h-16 bg-mouse-offwhite rounded-lg flex items-center justify-center px-4 hover:bg-gray-100 transition-colors"
              >
                <span className="text-mouse-navy/60 font-medium text-sm text-center">{logo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="get-started" className="bg-gradient-to-br from-mouse-navy to-navy-dark py-16 sm:py-24">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Start Your 30-Day Trial
          </h2>
          <p className="mt-3 text-white/70">
            Join these successful business owners who transformed their operations
          </p>
          
          {/* Simple form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-mouse-orange transition-colors"
                required
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-mouse-orange transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-mouse-orange text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
            >
              Get Started
            </button>
          </form>
          
          <p className="mt-4 text-white/50 text-sm">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
