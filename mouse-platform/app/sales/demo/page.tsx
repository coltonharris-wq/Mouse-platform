'use client';

import { useState } from 'react';
import Sidebar from '../../../components/layout/Sidebar';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Maximize,
  Monitor,
  Bot,
  BarChart3,
  Shield,
  Zap,
  Check,
  ArrowRight
} from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Welcome to Mouse Platform',
    subtitle: 'AI Employees for Modern Business',
    content: 'Transform your workforce with AI employees that work 24/7, never get tired, and continuously improve.',
    icon: Bot,
    color: 'bg-blue-600',
  },
  {
    id: 2,
    title: 'Instant Deployment',
    subtitle: 'From Zero to Productive in Minutes',
    content: 'Deploy specialized AI agents for any task - sales, support, development, and more. No training required.',
    icon: Zap,
    color: 'bg-yellow-500',
  },
  {
    id: 3,
    title: 'Enterprise Security',
    subtitle: 'Bank-Grade Protection',
    content: 'SOC 2 compliant with end-to-end encryption. Your data never leaves your control.',
    icon: Shield,
    color: 'bg-green-500',
  },
  {
    id: 4,
    title: 'Advanced Analytics',
    subtitle: 'Real-Time Performance Insights',
    content: 'Track productivity, efficiency, and ROI in real-time. Make data-driven decisions.',
    icon: BarChart3,
    color: 'bg-purple-500',
  },
  {
    id: 5,
    title: 'Let\'s Get Started',
    subtitle: 'Your AI Workforce Awaits',
    content: 'Join thousands of companies already using Mouse to scale their operations.',
    icon: Bot,
    color: 'bg-blue-600',
  },
];

export default function DemoPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="sales" />
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Demo Presentation</h1>
              <p className="text-sm text-gray-600">Present Mouse Platform to prospects</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
              <Maximize className="w-4 h-4" />
              Fullscreen
            </button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-5xl">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Slide */}
              <div className={`${slide.color} p-16 text-white min-h-[500px] flex flex-col items-center justify-center text-center transition-all duration-500`}>
                <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                  <Icon className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                <p className="text-xl text-white/90 mb-4">{slide.subtitle}</p>
                <p className="text-lg text-white/80 max-w-2xl">{slide.content}</p>
                
                {slide.id === 5 && (
                  <div className="mt-8 flex gap-4">
                    <button className="px-8 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                      Start Free Trial
                    </button>
                    <button className="px-8 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors">
                      Contact Sales
                    </button>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="bg-white p-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={prevSlide}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <SkipBack className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={nextSlide}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <SkipForward className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="text-sm text-gray-600">
                    {currentSlide + 1} / {slides.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Notes */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Speaker Notes</h3>
              <p className="text-gray-600">
                {slide.id === 1 && "Welcome the prospect and introduce Mouse Platform as a revolutionary way to scale their workforce with AI employees."}
                {slide.id === 2 && "Emphasize how quickly they can deploy AI agents - no complex training or setup required. Demo the instant deployment feature."}
                {slide.id === 3 && "Address security concerns early. Highlight SOC 2 compliance, encryption, and data privacy features."}
                {slide.id === 4 && "Show the analytics dashboard. Explain how they can track ROI and productivity gains in real-time."}
                {slide.id === 5 && "Close with clear next steps. Offer a free trial or schedule a deeper technical demo."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
