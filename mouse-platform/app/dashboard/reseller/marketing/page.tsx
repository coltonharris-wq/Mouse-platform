export default function MarketingPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1e3a5f] mb-4">Marketing Materials</h1>
        <p className="text-gray-600">Access branded marketing resources and assets.</p>
        
        <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-[#1e3a5f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Marketing Resources</h2>
          <p className="text-gray-600 max-w-md mx-auto">Download logos, banners, case studies, and sales collateral.</p>
        </div>
      </div>
    </div>
  );
}
