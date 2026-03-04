export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { kingMouseService } from '@/lib/king-mouse-service';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover' as any,
  });
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = getSupabase();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, supabase);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent, supabase);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice, supabase);
        break;
      }

      case 'invoice.created': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceCreated(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  const { customer_id, plan, work_hours, employees } = session.metadata || {};
  
  if (!customer_id || !plan) {
    console.error('Missing metadata in checkout session');
    return;
  }

  console.log('Processing checkout completion:', { customer_id, plan, work_hours, employees });

  // 1. Activate account and upgrade tier
  const { error: tierError } = await supabase
    .from('customers')
    .update({
      tier: plan,
      stripe_customer_id: session.customer as string,
      payment_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', customer_id);

  if (tierError) {
    console.error('Error updating customer tier:', tierError);
  }

  // 2. Grant work hours
  const workHoursNum = parseInt(work_hours || '0');
  if (workHoursNum > 0) {
    const { error: hoursError } = await supabase
      .from('work_hours')
      .upsert({
        customer_id: customer_id,
        total_hours: workHoursNum,
        used_hours: 0,
        remaining_hours: workHoursNum,
        plan: plan,
        billing_period_start: new Date().toISOString(),
        billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (hoursError) {
      console.error('Error granting work hours:', hoursError);
    }
  }

  // 3. Store payment record
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      customer_id: customer_id,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_customer_id: session.customer as string,
      plan: plan,
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: 'completed',
      metadata: session.metadata,
      created_at: new Date().toISOString(),
    });

  if (paymentError) {
    console.error('Error storing payment record:', paymentError);
  }

  // 4. Provision King Mouse (OpenClaw instance) for customer
  console.log(`🤖 Provisioning King Mouse for customer: ${customer_id}`);
  
  // Get customer details for provisioning
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('email, company_name, plan_tier')
    .eq('id', customer_id)
    .single();

  if (customerError) {
    console.error('Error fetching customer for King Mouse provisioning:', customerError);
  } else {
    const kingMouseResult = await kingMouseService.provisionKingMouse({
      customerId: customer_id,
      customerEmail: customer?.email || session.customer_email || '',
      companyName: customer?.company_name || 'Unknown Company',
      planTier: plan,
    });

    if (kingMouseResult.success) {
      console.log(`✅ King Mouse provisioned: ${kingMouseResult.instance?.id}`);
    } else {
      console.error(`❌ King Mouse provisioning failed: ${kingMouseResult.error}`);
      // Don't fail checkout - customer can still use web dashboard
    }
  }

  // 5. Send welcome email with login info
  await sendWelcomeEmail(customer_id, plan, session.customer_email || '', supabase);

  console.log('Checkout completed processing finished for customer:', customer_id);
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  // Update payment status if exists
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Error updating payment status:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  console.log('Invoice payment succeeded:', invoice.id);

  const customerId = invoice.metadata?.customer_id;
  if (!customerId) {
    console.error('No customer_id in invoice metadata');
    return;
  }

  // Store invoice in billing history
  const { error } = await supabase
    .from('invoices')
    .upsert({
      customer_id: customerId,
      stripe_invoice_id: invoice.id,
      stripe_customer_id: invoice.customer as string,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'paid',
      pdf_url: invoice.invoice_pdf,
      hosted_url: invoice.hosted_invoice_url,
      invoice_number: invoice.number,
      description: invoice.description,
      metadata: invoice.metadata,
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error storing invoice:', error);
  }

  // Send invoice email
  await sendInvoiceEmail(customerId, invoice, supabase);
}

async function handleInvoiceCreated(invoice: Stripe.Invoice) {
  console.log('Invoice created:', invoice.id);
  // Invoice creation is handled by Stripe automatically
}

async function sendWelcomeEmail(customerId: string, plan: string, email: string, supabase: any) {
  console.log('Sending welcome email:', { customerId, plan, email });

  // Store email in queue for processing
  const { error } = await supabase
    .from('email_queue')
    .insert({
      customer_id: customerId,
      email: email,
      template: 'welcome_paid',
      data: {
        plan: plan,
        login_url: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      },
      status: 'pending',
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error queueing welcome email:', error);
  }
}

async function sendInvoiceEmail(customerId: string, invoice: Stripe.Invoice, supabase: any) {
  console.log('Sending invoice email:', { customerId, invoiceId: invoice.id });

  const { error } = await supabase
    .from('email_queue')
    .insert({
      customer_id: customerId,
      email: invoice.customer_email || '',
      template: 'invoice_paid',
      data: {
        invoice_number: invoice.number,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        pdf_url: invoice.invoice_pdf,
        hosted_url: invoice.hosted_invoice_url,
      },
      status: 'pending',
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error queueing invoice email:', error);
  }
}

// Disable body parsing for Stripe webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};
