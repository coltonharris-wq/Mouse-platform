import { NextRequest, NextResponse } from 'next/server';
import { telegramProvisioner } from '@/lib/telegram-provisioner';

/**
 * Telegram Webhook API
 * Receives messages from Telegram bots
 */

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    
    // Log the update
    console.log('📨 Telegram webhook received:', {
      update_id: update.update_id,
      message: update.message?.text,
      from: update.message?.from?.username,
    });

    // Process the webhook
    await telegramProvisioner.handleWebhook(update);

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

// Also handle GET for webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customer = searchParams.get('customer');
  
  console.log(`🔌 Telegram webhook verification for customer: ${customer}`);
  
  return NextResponse.json({ 
    status: 'webhook_active',
    customer: customer || 'unknown',
  });
}
