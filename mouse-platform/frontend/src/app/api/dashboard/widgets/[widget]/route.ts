/**
 * GET /api/dashboard/widgets/[widget]?customer_id=X
 * Returns widget data. Tries real data from Supabase, falls back to mock data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ widget: string }> }
) {
  const { widget } = await params;
  const customerId = request.nextUrl.searchParams.get('customer_id') || '';

  // Try to get customer industry for industry-specific mock data
  let industry = 'default';
  if (customerId && customerId !== 'demo') {
    try {
      const customers = await supabaseQuery('customers', 'GET', undefined, `id=eq.${customerId}&select=industry`);
      if (customers?.[0]?.industry) {
        industry = customers[0].industry;
      }
    } catch {
      // Use default
    }
  }

  const data = getMockData(widget, industry);
  return NextResponse.json(data);
}

function getMockData(widget: string, industry: string): unknown {
  const mocks: Record<string, Record<string, unknown>> = {
    calls: {
      'Food & Restaurant': { calls_today: 14, calls_week: 67, trend: 'up' },
      'Automotive': { calls_today: 9, calls_week: 42, trend: 'stable' },
      'Healthcare': { calls_today: 22, calls_week: 98, trend: 'up' },
      'Beauty & Personal Care': { calls_today: 11, calls_week: 52, trend: 'up' },
      'Home Services': { calls_today: 12, calls_week: 56, trend: 'stable' },
      'Professional Services': { calls_today: 7, calls_week: 34, trend: 'up' },
      'Fitness & Wellness': { calls_today: 8, calls_week: 40, trend: 'stable' },
      default: { calls_today: 8, calls_week: 38, trend: 'stable' },
    },
    appointments: {
      'Beauty & Personal Care': { today: 16, next: { time: '2:30 PM', name: 'Sarah M.', service: 'Balayage' } },
      'Healthcare': { today: 24, next: { time: '1:00 PM', name: 'John D.', service: 'Cleaning & Exam' } },
      'Fitness & Wellness': { today: 8, next: { time: '10:00 AM', name: 'Mike R.', service: 'Personal Training' } },
      'Home Services': { today: 5, next: { time: '11:00 AM', name: 'Smith residence', service: 'Deep Clean' } },
      default: { today: 6, next: { time: '3:00 PM', name: 'Customer', service: 'Appointment' } },
    },
    revenue: {
      'Food & Restaurant': { today: 1847, yesterday: 1620 },
      'Automotive': { today: 3200, yesterday: 2800 },
      'Healthcare': { today: 4500, yesterday: 4200 },
      'Beauty & Personal Care': { today: 1450, yesterday: 1380 },
      'Home Services': { today: 2100, yesterday: 1900 },
      'Professional Services': { today: 3800, yesterday: 3500 },
      'Fitness & Wellness': { today: 890, yesterday: 920 },
      default: { today: 1247, yesterday: 1100 },
    },
    reviews: {
      'Food & Restaurant': { new_count: 3, avg_rating: 4.5, latest: '"Best pizza in town! Fast delivery too."' },
      'Automotive': { new_count: 1, avg_rating: 4.7, latest: '"Honest mechanics, fair prices. Highly recommend."' },
      'Healthcare': { new_count: 2, avg_rating: 4.8, latest: '"Dr. Smith is the best! Gentle and thorough."' },
      'Beauty & Personal Care': { new_count: 4, avg_rating: 4.9, latest: '"Love my new balayage! Bella is amazing."' },
      default: { new_count: 2, avg_rating: 4.6, latest: '"Great service! Will definitely come back."' },
    },
    orders: {
      'Food & Restaurant': { pending: 3, items: ['Large Pepperoni', 'Medium Margherita', 'Wings + Fries'] },
      default: { pending: 2, items: ['Order #1042', 'Order #1043'] },
    },
    vehicles: {
      'Automotive': { count: 4, statuses: [{ vehicle: '2019 Toyota Camry', status: 'In Progress' }, { vehicle: '2021 Honda Civic', status: 'Waiting Parts' }] },
      default: { count: 3, statuses: [] },
    },
    patients: {
      'Healthcare': { today: 18, next: { time: '1:00 PM', name: 'John D.', service: 'Cleaning & Exam' } },
      default: { today: 12, next: { time: '2:00 PM', name: 'Patient', service: 'Visit' } },
    },
    slots: {
      'Beauty & Personal Care': { open: 5, times: ['2:00 PM', '2:30 PM', '3:00 PM', '4:00 PM', '4:30 PM'] },
      'Healthcare': { open: 3, times: ['11:00 AM', '2:00 PM', '4:00 PM'] },
      default: { open: 4, times: ['1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'] },
    },
    inventory: {
      'Food & Restaurant': { low_count: 2, items: ['Mozzarella cheese', 'Pizza boxes'] },
      default: { low_count: 1, items: ['Supply item'] },
    },
    pipeline: {
      'Professional Services': { total: 8, stages: { new: 3, contacted: 3, qualified: 2 } },
      default: { total: 5, stages: { new: 2, contacted: 2, qualified: 1 } },
    },
    estimates: {
      'Automotive': { count: 3, total_value: 2450 },
      'Home Services': { count: 4, total_value: 3200 },
      default: { count: 2, total_value: 1500 },
    },
    catering: {
      'Food & Restaurant': { count: 2, upcoming: ['Corporate lunch (Mar 15)', 'Birthday party (Mar 20)'] },
      default: { count: 1, upcoming: ['Event inquiry'] },
    },
    'new-clients': {
      'Fitness & Wellness': { count: 7, period: 'this week' },
      'Healthcare': { count: 4, period: 'this week' },
      default: { count: 5, period: 'this week' },
    },
    recalls: {
      'Healthcare': { count: 18, message: 'Patients overdue for 6-month checkup' },
      default: { count: 12, message: 'Clients due for follow-up' },
    },
  };

  return mocks[widget]?.[industry] || mocks[widget]?.default || {};
}
