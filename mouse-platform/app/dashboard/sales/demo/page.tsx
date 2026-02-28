export default function DemoPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1e3a5f] mb-4">Demo Mode</h1>
        <p className="text-gray-600">Run interactive product demos for prospects.</p>
        
        <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-[#1e3a5f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Interactive Demo</h2>
          <p className="text-gray-600 max-w-md mx-auto">Show prospects the power of Mouse Platform with guided demos.</p>
          
          <div className="mt-6 flex justify-center gap-4">
            <button className="px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors">
              Start Demo
            </button>
            <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Customize Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
