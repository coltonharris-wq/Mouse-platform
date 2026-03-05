export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
    });
    const session = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: session.error?.message }, { status: 400 });
    }

    return NextResponse.json({
      plan: session.metadata?.plan || '',
      workHours: parseFloat(session.metadata?.work_hours || '0'),
      customerId: session.metadata?.customer_id || '',
      status: session.payment_status,
      amount: (session.amount_total || 0) / 100,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
