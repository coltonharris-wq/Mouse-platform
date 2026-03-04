/**
 * White-Label Email Templates
 * 
 * These templates use reseller branding to customize emails sent to customers.
 */

import { ResellerBranding } from "@/lib/reseller-customer-manager";

interface EmailTemplateData {
  ownerName: string;
  businessName: string;
  paymentLink?: string;
  tempPassword?: string;
  loginUrl?: string;
  branding: Partial<ResellerBranding> & { fromEmail?: string };
}

export function generateWelcomeEmail(data: EmailTemplateData): { html: string; text: string } {
  const { ownerName, businessName, paymentLink, tempPassword, branding } = data;
  
  const companyName = branding.companyName || "Automio";
  const primaryColor = branding.primaryColor || "#0F6B6E";
  const logoUrl = branding.logoUrl;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${companyName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: ${primaryColor}; padding: 40px 30px; text-align: center; }
    .header img { max-height: 50px; margin-bottom: 15px; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .content h2 { color: #1a1a1a; font-size: 20px; margin: 0 0 20px 0; }
    .content p { color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; }
    .button { display: inline-block; background: ${primaryColor}; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .details { background: #f7fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .details-row:last-child { border-bottom: none; }
    .details-label { color: #718096; font-size: 14px; }
    .details-value { color: #1a1a1a; font-weight: 500; font-size: 14px; }
    .password-box { background: #1a202c; color: white; padding: 15px 20px; border-radius: 8px; font-family: monospace; font-size: 18px; text-align: center; margin: 15px 0; }
    .footer { background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { color: #718096; font-size: 14px; margin: 0; }
    .footer a { color: ${primaryColor}; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" />` : ""}
      <h1>Welcome to ${companyName}</h1>
    </div>
    
    <div class="content">
      <h2>Hi ${ownerName},</h2>
      <p>
        Thanks for choosing <strong>${companyName}</strong> to power your AI workforce! 
        Your account for <strong>${businessName}</strong> has been created and is ready to go.
      </p>
      
      <div class="details">
        <div class="details-row">
          <span class="details-label">Business</span>
          <span class="details-value">${businessName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Plan</span>
          <span class="details-value">Starter Plan ($997/month)</span>
        </div>
      </div>
      
      <p>To activate your account, please complete your subscription:</p>
      
      <center>
        <a href="${paymentLink}" class="button">Complete Payment</a>
      </center>
      
      <p style="font-size: 14px; color: #718096;">
        Your temporary password is below. You'll use this to log in after payment is complete:
      </p>
      
      <div class="password-box">${tempPassword}</div>
      
      <p style="font-size: 14px; color: #718096;">
        <strong>Next steps:</strong>
      </p>
      <ol style="color: #4a5568; font-size: 15px; line-height: 1.8; padding-left: 20px;">
        <li>Click the button above to complete payment</li>
        <li>You'll receive login credentials after payment confirmation</li>
        <li>Log in and start building your AI workforce</li>
      </ol>
    </div>
    
    <div class="footer">
      <p>Questions? Reply to this email or contact us at <a href="mailto:${branding.fromEmail || 'support@automio.com'}">${branding.fromEmail || 'support@automio.com'}</a></p>
      ${branding.emailFooter ? `<p style="margin-top: 10px;">${branding.emailFooter}</p>` : ""}
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Welcome to ${companyName}!

Hi ${ownerName},

Thanks for choosing ${companyName} to power your AI workforce! Your account for ${businessName} has been created.

BUSINESS DETAILS:
- Business: ${businessName}
- Plan: Starter Plan ($997/month)
- Temporary Password: ${tempPassword}

To activate your account, please complete your subscription:
${paymentLink}

Next steps:
1. Click the link above to complete payment
2. You'll receive login credentials after payment confirmation
3. Log in and start building your AI workforce

Questions? Contact us at ${branding.fromEmail || 'support@automio.com'}
${branding.emailFooter || ""}
  `;

  return { html, text };
}

export function generateActivationEmail(data: EmailTemplateData): { html: string; text: string } {
  const { ownerName, businessName, loginUrl, tempPassword, branding } = data;
  
  const companyName = branding.companyName || "Automio";
  const primaryColor = branding.primaryColor || "#0F6B6E";
  const logoUrl = branding.logoUrl;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ${companyName} Account is Active!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: ${primaryColor}; padding: 40px 30px; text-align: center; }
    .header img { max-height: 50px; margin-bottom: 15px; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .content h2 { color: #1a1a1a; font-size: 20px; margin: 0 0 20px 0; }
    .content p { color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; }
    .button { display: inline-block; background: ${primaryColor}; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .credentials { background: #f0fff4; border: 2px solid #48bb78; border-radius: 8px; padding: 25px; margin: 25px 0; }
    .credentials h3 { color: #22543d; margin: 0 0 15px 0; font-size: 16px; }
    .cred-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .cred-label { color: #276749; font-size: 14px; }
    .cred-value { color: #1a202c; font-weight: 600; font-size: 14px; }
    .password-box { background: #1a202c; color: white; padding: 15px 20px; border-radius: 8px; font-family: monospace; font-size: 18px; text-align: center; margin: 15px 0; }
    .footer { background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { color: #718096; font-size: 14px; margin: 0; }
    .footer a { color: ${primaryColor}; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" />` : ""}
      <h1>Payment Confirmed! 🎉</h1>
    </div>
    
    <div class="content">
      <h2>Hi ${ownerName},</h2>
      <p>
        Great news! Your payment has been confirmed and your <strong>${companyName}</strong> account 
        for <strong>${businessName}</strong> is now active.
      </p>
      
      <div class="credentials">
        <h3>🔐 Your Login Credentials</h3>
        <div class="cred-row">
          <span class="cred-label">Login URL:</span>
          <span class="cred-value"><a href="${loginUrl}">${loginUrl}</a></span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Temporary Password:</span>
          <span class="cred-value" style="font-family: monospace;">${tempPassword}</span>
        </div>
      </div>
      
      <center>
        <a href="${loginUrl}" class="button">Log In Now</a>
      </center>
      
      <p style="font-size: 14px; color: #718096;">
        <strong>Important:</strong> For security, please change your password after your first login.
      </p>
      
      <p style="font-size: 14px; color: #718096;">
        <strong>Getting Started:</strong>
      </p>
      <ol style="color: #4a5568; font-size: 15px; line-height: 1.8; padding-left: 20px;">
        <li>Log in using the button above</li>
        <li>Set up your first AI employee</li>
        <li>Connect your tools and integrations</li>
        <li>Start automating your workflows</li>
      </ol>
    </div>
    
    <div class="footer">
      <p>Need help getting started? Contact us at <a href="mailto:${branding.fromEmail || 'support@automio.com'}">${branding.fromEmail || 'support@automio.com'}</a></p>
      ${branding.emailFooter ? `<p style="margin-top: 10px;">${branding.emailFooter}</p>` : ""}
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Payment Confirmed! Your ${companyName} Account is Active! 🎉

Hi ${ownerName},

Great news! Your payment has been confirmed and your ${companyName} account for ${businessName} is now active.

LOGIN CREDENTIALS:
- Login URL: ${loginUrl}
- Temporary Password: ${tempPassword}

Important: For security, please change your password after your first login.

Getting Started:
1. Log in using the link above
2. Set up your first AI employee
3. Connect your tools and integrations
4. Start automating your workflows

Need help getting started? Contact us at ${branding.fromEmail || 'support@automio.com'}
${branding.emailFooter || ""}
  `;

  return { html, text };
}

export function generatePaymentReminderEmail(data: EmailTemplateData): { html: string; text: string } {
  const { ownerName, businessName, paymentLink, branding } = data;
  
  const companyName = branding.companyName || "Automio";
  const primaryColor = branding.primaryColor || "#0F6B6E";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Complete Your ${companyName} Setup</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: ${primaryColor}; padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 22px; }
    .content { padding: 30px; }
    .content p { color: #4a5568; font-size: 16px; line-height: 1.6; }
    .button { display: inline-block; background: ${primaryColor}; color: white; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; margin: 15px 0; }
    .footer { background: #f7fafc; padding: 20px; text-align: center; }
    .footer p { color: #718096; font-size: 14px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Don't Miss Out!</h1>
    </div>
    <div class="content">
      <p>Hi ${ownerName},</p>
      <p>We noticed you haven't completed your ${companyName} setup for ${businessName} yet. Your AI workforce is waiting!</p>
      <center><a href="${paymentLink}" class="button">Complete Payment Now</a></center>
      <p style="font-size: 14px; color: #718096;">Questions? Just reply to this email.</p>
    </div>
    <div class="footer">
      <p>${companyName}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Hi ${ownerName},

We noticed you haven't completed your ${companyName} setup for ${businessName} yet. Your AI workforce is waiting!

Complete your payment: ${paymentLink}

Questions? Just reply to this email.

${companyName}
  `;

  return { html, text };
}
