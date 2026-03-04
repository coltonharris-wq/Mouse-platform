import { NextResponse } from 'next/server';
import { generateWelcomeEmail } from '@/lib/email-templates';

// Email API integration (using Resend or similar)
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@mouseplatform.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      customerEmail, 
      customerName, 
      company, 
      resellerName, 
      resellerCompany,
      subject,
      html: providedHtml,
      text: providedText
    } = body;

    if (!customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Customer email and name are required' },
        { status: 400 }
      );
    }

    // Use provided content or generate default
    let emailHtml = providedHtml;
    let emailText = providedText;

    if (!emailHtml) {
      // Generate default welcome email
      const { html, text } = generateWelcomeEmail({
        ownerName: customerName,
        businessName: company || 'Your Business',
        paymentLink: body.paymentLink || '#',
        tempPassword: body.tempPassword,
        branding: {
          companyName: resellerCompany || 'Automio',
          primaryColor: '#0F6B6E',
          fromEmail: FROM_EMAIL,
        },
      });
      emailHtml = html;
      emailText = text;
    }

    const emailSubject = subject || `Welcome to ${resellerCompany || 'Automio'}'s AI Workforce Platform`;

    // If no API key, simulate success for development
    if (!RESEND_API_KEY) {
      console.log('========================================');
      console.log('EMAIL WOULD BE SENT (Resend not configured):');
      console.log('To:', customerEmail);
      console.log('Subject:', emailSubject);
      console.log('From:', `${resellerCompany || 'Automio'} <${FROM_EMAIL}>`);
      console.log('========================================');
      
      return NextResponse.json({
        success: true,
        message: 'Onboarding email queued (simulated - add RESEND_API_KEY for real emails)',
        preview: {
          to: customerEmail,
          subject: emailSubject,
        }
      });
    }

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${resellerCompany || 'Automio'} <${FROM_EMAIL}>`,
        to: customerEmail,
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Email API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send email', details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Onboarding email sent successfully',
      emailId: data.id,
    });

  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for API health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    emailConfigured: !!RESEND_API_KEY,
    fromEmail: FROM_EMAIL,
    timestamp: new Date().toISOString(),
  });
}
