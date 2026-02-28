'use client';

import { TrendingUp, BarChart3, Calendar, DollarSign } from 'lucide-react';

export default function ForecastPage() {
  const monthlyData = [
    { month: 'Jan', actual: 45000, forecast: 42000 },
    { month: 'Feb', actual: 52000, forecast: 48000 },
    { month: 'Mar', actual: 0, forecast: 55000 },
    { month: 'Apr', actual: 0, forecast: 60000 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-mouse-teal" />
        <h2 className="text-2xl font-bold text-white">Sales Forecast</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Q1 Target</p>
              <p className="text-2xl font-bold text-white">$150,000</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">YTD Actual</p>
              <p className="text-2xl font-bold text-white">$97,000</p>
            </div>
            <BarChart3 className="w-8 h-8 text-mouse-teal" />
          </div>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pipeline</p>
              <p className="text-2xl font-bold text-white">$125,000</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Monthly Performance</h3>
        <div className="space-y-6">
          {monthlyData.map((data, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{data.month}</span>
                <div className="flex items-center gap-4">
                  {data.actual > 0 && (
                    <span className="text-green-400">Actual: ${(data.actual / 1000).toFixed(0)}k</span>
                  )}
                  <span className="text-gray-400">Forecast: ${(data.forecast / 1000).toFixed(0)}k</span>
                </div>
              </div>
              <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-mouse-teal rounded-full"
                  style={{ width: `${(data.forecast / 70000) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
