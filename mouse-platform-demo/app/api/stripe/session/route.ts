import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover' as any,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'invoice'],
    });

    // Handle invoice URL safely
    let invoiceUrl = null;
    if (session.invoice && typeof session.invoice === 'object') {
      invoiceUrl = session.invoice.hosted_invoice_url;
    }

    return NextResponse.json({
      plan: session.metadata?.plan,
      amount: session.amount_total,
      customerEmail: session.customer_details?.email,
      customerId: session.metadata?.customer_id,
      invoiceUrl: invoiceUrl,
      status: session.status,
      paymentStatus: session.payment_status,
    });
  } catch (error) {
    console.error('Failed to retrieve session:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
