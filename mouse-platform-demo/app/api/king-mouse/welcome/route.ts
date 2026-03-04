export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

/**
 * King Mouse Welcome Email API
 * Sends welcome email with Telegram bot link to new customers
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerEmail, companyName, botLink, botUsername, planTier } = body;

    if (!customerEmail || !botLink) {
      return NextResponse.json(
        { error: 'Missing required fields: customerEmail, botLink' },
        { status: 400 }
      );
    }

    // Generate welcome email content
    const emailHtml = generateKingMouseWelcomeEmail({
      companyName: companyName || 'Your Business',
      botLink,
      botUsername: botUsername || 'MouseKingBot',
      planTier: planTier || 'starter',
    });

    // In production, integrate with your email service (Resend, SendGrid, etc.)
    // For now, log the email content
    console.log(`📧 King Mouse welcome email prepared for: ${customerEmail}`);
    console.log(`   Bot Link: ${botLink}`);

    // TODO: Integrate with actual email service
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'Mouse Platform <welcome@mouseplatform.com>',
    //   to: customerEmail,
    //   subject: 'Your King Mouse AI Assistant is Ready!',
    //   html: emailHtml,
    // });

    return NextResponse.json({
      success: true,
      message: 'Welcome email prepared',
      emailPreview: {
        to: customerEmail,
        subject: 'Your King Mouse AI Assistant is Ready!',
        botLink,
      },
    });

  } catch (error) {
    console.error('King Mouse welcome email error:', error);
    return NextResponse.json(
      { error: 'Failed to process welcome email' },
      { status: 500 }
    );
  }
}

/**
 * Generate King Mouse welcome email HTML
 */
function generateKingMouseWelcomeEmail(params: {
  companyName: string;
  botLink: string;
  botUsername: string;
  planTier: string;
}): string {
  const planFeatures: Record<string, string[]> = {
    free: ['1 AI Employee', '20 work hours/month', 'Basic chat support'],
    starter: ['1 AI Employee', '160 work hours/month', 'Email & CRM automation', 'ROI dashboard'],
    growth: ['3 AI Employees', '500 work hours/month', 'Priority support', 'Voice/video calls'],
    pro: ['5 AI Employees', 'Unlimited work hours', 'Custom workflows', 'API access'],
    enterprise: ['10+ AI Employees', 'Unlimited everything', 'White label options', 'Dedicated infrastructure'],
  };

  const features = planFeatures[params.planTier] || planFeatures.starter;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your King Mouse is Ready!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0B1F3B; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #0F6B6E; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .features { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .feature-item { padding: 8px 0; border-bottom: 1px solid #eee; }
    .feature-item:last-child { border-bottom: none; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐭 Your King Mouse is Ready!</h1>
      <p>Your personal AI workforce orchestrator</p>
    </div>
    
    <div class="content">
      <h2>Welcome to Mouse Platform, ${params.companyName}!</h2>
      
      <p>Your King Mouse AI assistant has been activated and is ready to help you deploy and manage your AI workforce.</p>
      
      <div style="text-align: center;">
        <a href="${params.botLink}" class="button">Start Chatting with King Mouse</a>
      </div>
      
      <p style="text-align: center; font-size: 14px; color: #666;">
        Or search for <strong>@${params.botUsername}</strong> on Telegram
      </p>
      
      <div class="features">
        <h3>Your ${params.planTier.charAt(0).toUpperCase() + params.planTier.slice(1)} Plan Includes:</h3>
        ${features.map(f => `<div class="feature-item">✓ ${f}</div>`).join('')}
      </div>
      
      <h3>What can King Mouse do?</h3>
      <ul>
        <li>Deploy AI employees with simple text commands</li>
        <li>Monitor your AI workforce in real-time</li>
        <li>Manage tasks and track ROI</li>
        <li>Get insights and recommendations</li>
        <li>Access your account from anywhere</li>
      </ul>
      
      <h3>Getting Started</h3>
      <ol>
        <li>Click the button above to open King Mouse on Telegram</li>
        <li>Send "/start" to activate your bot</li>
        <li>Type "deploy sales employee" to hire your first AI worker</li>
        <li>Watch your AI employee start working!</li>
      </ol>
      
      <p>Questions? Reply to this email or contact us at support@mouseplatform.com</p>
    </div>
    
    <div class="footer">
      <p>Mouse Platform - AI Workforce Operating System</p>
      <p style="font-size: 12px; color: #999;">
        You're receiving this because you signed up for Mouse Platform.<br>
        If you didn't sign up, please ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
