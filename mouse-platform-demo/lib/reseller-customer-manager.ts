import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import crypto from 'crypto';
import { generateWelcomeEmail, generateActivationEmail } from './email-templates';
import { kingMouseService } from './king-mouse-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

export interface CustomerData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  resellerId: string;
}

export interface OnboardedCustomer {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  status: 'pending_payment' | 'active' | 'cancelled';
  mrr: number;
  commissionEarned: number;
  commissionRate: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  temporaryPassword?: string;
  createdAt: string;
  activatedAt?: string;
  paymentLink?: string;
  planTier: 'starter' | 'pro' | 'enterprise';
  resellerId: string;
}

export interface ResellerBranding {
  resellerId: string;
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  domain?: string;
  fromEmail?: string;
  emailFooter?: string;
}

export class ResellerCustomerManager {
  private supabase: ReturnType<typeof createClient> | null = null;
  private commissionRate: number = 0.40; // 40% commission

  private getSupabase(): any {
    if (!this.supabase) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
      if (!url || !key) {
        throw new Error('Supabase credentials not configured');
      }
      this.supabase = createClient(url, key);
    }
    return this.supabase;
  }

  /**
   * Generate a secure temporary password
   */
  private generateTempPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  /**
   * Generate a unique customer ID
   */
  private generateCustomerId(): string {
    return `cust_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Get reseller branding settings
   */
  async getResellerBranding(resellerId: string): Promise<ResellerBranding | null> {
    const { data, error } = await this.getSupabase()
      .from('resellers')
      .select('id, name, logo_url, brand_primary, brand_navy, email, domain')
      .eq('id', resellerId)
      .single() as { data: any, error: any };

    if (error || !data) {
      console.error('Error fetching reseller branding:', error);
      return null;
    }

    return {
      resellerId: data.id,
      companyName: data.name,
      logoUrl: data.logo_url,
      primaryColor: data.brand_primary || '#0F6B6E',
      secondaryColor: data.brand_navy || '#0B1F3B',
      accentColor: '#14B8A6',
      domain: data.domain,
      fromEmail: data.email,
    };
  }

  /**
   * Create a new customer and generate Stripe payment link
   */
  async addCustomer(customerData: CustomerData): Promise<{
    success: boolean;
    customer?: OnboardedCustomer;
    paymentLink?: string;
    error?: string;
  }> {
    try {
      // 1. Generate temporary password
      const tempPassword = this.generateTempPassword();
      const customerId = this.generateCustomerId();

      // 2. Create Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: customerData.email,
        name: customerData.ownerName,
        phone: customerData.phone,
        metadata: {
          business_name: customerData.businessName,
          reseller_id: customerData.resellerId,
          customer_id: customerId,
        },
      });

      // 3. Get reseller branding for white-label checkout
      const branding = await this.getResellerBranding(customerData.resellerId);

      // 4. Create Stripe checkout session with custom branding
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'AI Workforce Platform - Starter Plan',
                description: `Monthly subscription for ${customerData.businessName}`,
              },
              unit_amount: 99700, // $997.00
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboard/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboard/cancel`,
        subscription_data: {
          metadata: {
            customer_id: customerId,
            reseller_id: customerData.resellerId,
            business_name: customerData.businessName,
          },
        },
        custom_text: {
          submit: {
            message: branding 
              ? `You'll be subscribed to ${branding.companyName}'s AI Workforce Platform`
              : 'You\'ll be subscribed to the AI Workforce Platform',
          },
        },
      });

      // 5. Create customer record in database
      const { data: customer, error } = await this.getSupabase()
        .from('customers')
        .insert({
          id: customerId,
          reseller_id: customerData.resellerId,
          company_name: customerData.businessName,
          email: customerData.email,
          stripe_customer_id: stripeCustomer.id,
          stripe_subscription_status: 'incomplete',
          status: 'pending_payment',
          plan_tier: 'starter',
          metadata: {
            owner_name: customerData.ownerName,
            phone: customerData.phone,
            temporary_password: tempPassword,
            checkout_session_id: session.id,
          },
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // 6. Create auth user for customer
      const { error: authError } = await this.getSupabase().auth.admin.createUser({
        email: customerData.email,
        password: tempPassword,
        email_confirm: false,
        user_metadata: {
          customer_id: customerId,
          business_name: customerData.businessName,
          owner_name: customerData.ownerName,
        },
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
        // Continue - customer can reset password later
      }

      // 7. Create profile linking
      const { error: profileError } = await this.getSupabase()
        .from('profiles')
        .insert({
          role: 'customer',
          reseller_id: customerData.resellerId,
          customer_id: customerId,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      // 8. Send welcome email with payment link
      await this.sendWelcomeEmail({
        email: customerData.email,
        ownerName: customerData.ownerName,
        businessName: customerData.businessName,
        paymentLink: session.url!,
        tempPassword,
        resellerId: customerData.resellerId,
      });

      const onboardedCustomer: OnboardedCustomer = {
        id: customerId,
        businessName: customerData.businessName,
        ownerName: customerData.ownerName,
        email: customerData.email,
        phone: customerData.phone,
        status: 'pending_payment',
        mrr: 997,
        commissionEarned: 0,
        commissionRate: this.commissionRate,
        stripeCustomerId: stripeCustomer.id,
        temporaryPassword: tempPassword,
        createdAt: new Date().toISOString(),
        paymentLink: session.url!,
        planTier: 'starter',
        resellerId: customerData.resellerId,
      };

      return {
        success: true,
        customer: onboardedCustomer,
        paymentLink: session.url!,
      };

    } catch (error) {
      console.error('Error adding customer:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Send welcome email with white-label branding
   */
  private async sendWelcomeEmail(params: {
    email: string;
    ownerName: string;
    businessName: string;
    paymentLink: string;
    tempPassword: string;
    resellerId: string;
  }): Promise<void> {
    const branding = await this.getResellerBranding(params.resellerId);
    
    // Generate email content using templates
    const { html, text } = generateWelcomeEmail({
      ownerName: params.ownerName,
      businessName: params.businessName,
      paymentLink: params.paymentLink,
      tempPassword: params.tempPassword,
      branding: branding || {
        companyName: 'Automio',
        primaryColor: '#0F6B6E',
        secondaryColor: '#0B1F3B',
        fromEmail: 'support@automio.com',
      },
    });

    // Send via the onboard API
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${appUrl}/api/customers/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: params.email,
          customerName: params.ownerName,
          company: params.businessName,
          resellerName: branding?.companyName || 'Your Account Manager',
          resellerCompany: branding?.companyName || 'Automio',
          // Additional fields for direct email sending
          subject: branding 
            ? `Welcome to ${branding.companyName}'s AI Workforce Platform`
            : 'Welcome to the AI Workforce Platform',
          html,
          text,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send welcome email:', await response.text());
      } else {
        console.log('Welcome email sent successfully to:', params.email);
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw - allow customer creation to succeed even if email fails
    }
  }

  /**
   * Activate customer after successful payment
   */
  async activateCustomer(
    customerId: string,
    stripeSubscriptionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Get customer data
      const { data: customer, error: fetchError } = await this.getSupabase()
        .from('customers')
        .select('*, metadata')
        .eq('id', customerId)
        .single();

      if (fetchError || !customer) {
        throw new Error(`Customer not found: ${fetchError?.message}`);
      }

      // 2. Update customer status
      const { error: updateError } = await this.getSupabase()
        .from('customers')
        .update({
          stripe_subscription_id: stripeSubscriptionId,
          stripe_subscription_status: 'active',
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerId);

      if (updateError) {
        throw new Error(`Update error: ${updateError.message}`);
      }

      // 3. Calculate commission (40% of $997 = $398.80)
      const mrr = 997;
      const commissionAmount = mrr * this.commissionRate;

      // 4. Create revenue event for commission tracking
      const { error: revenueError } = await this.getSupabase()
        .from('revenue_events')
        .insert({
          reseller_id: customer.reseller_id,
          customer_id: customerId,
          stripe_event_id: stripeSubscriptionId,
          gross_amount: mrr * 100, // Convert to cents
          platform_fee_amount: (mrr * (1 - this.commissionRate)) * 100,
          reseller_amount: commissionAmount * 100,
          type: 'subscription_activated',
          timestamp: new Date().toISOString(),
        });

      if (revenueError) {
        console.error('Revenue event creation error:', revenueError);
      }

      // 5. Provision King Mouse (OpenClaw instance) for customer
      console.log(`🤖 Provisioning King Mouse for customer: ${customerId}`);
      const kingMouseResult = await kingMouseService.provisionKingMouse({
        customerId,
        customerEmail: customer.email,
        companyName: customer.company_name,
        planTier: customer.plan_tier || 'starter',
        resellerId: customer.reseller_id,
      });

      if (kingMouseResult.success) {
        console.log(`✅ King Mouse provisioned: ${kingMouseResult.instance?.id}`);
      } else {
        console.error(`❌ King Mouse provisioning failed: ${kingMouseResult.error}`);
        // Don't fail activation - customer can still use web dashboard
      }

      // 6. Send activation email with login credentials
      await this.sendActivationEmail({
        email: customer.email,
        customerId,
        tempPassword: customer.metadata?.temporary_password,
        resellerId: customer.reseller_id,
      });

      return { success: true };

    } catch (error) {
      console.error('Error activating customer:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Send activation email with login credentials
   */
  private async sendActivationEmail(params: {
    email: string;
    customerId: string;
    tempPassword?: string;
    resellerId: string;
  }): Promise<void> {
    const branding = await this.getResellerBranding(params.resellerId);
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;

    // Get customer details for the email
    const { data: customer } = await this.getSupabase()
      .from('customers')
      .select('company_name, metadata')
      .eq('id', params.customerId)
      .single();

    // Generate email content using templates
    const { html, text } = generateActivationEmail({
      ownerName: customer?.metadata?.owner_name || 'Valued Customer',
      businessName: customer?.company_name || 'Your Business',
      loginUrl,
      tempPassword: params.tempPassword || '',
      branding: branding || {
        companyName: 'Automio',
        primaryColor: '#0F6B6E',
        secondaryColor: '#0B1F3B',
        fromEmail: 'support@automio.com',
      },
    });

    // Send via the onboard API
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${appUrl}/api/customers/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: params.email,
          customerName: customer?.metadata?.owner_name || 'Valued Customer',
          company: customer?.company_name || 'Your Business',
          resellerName: branding?.companyName || 'Your Account Manager',
          resellerCompany: branding?.companyName || 'Automio',
          subject: branding
            ? `Your ${branding.companyName} AI Workforce is Ready!`
            : 'Your AI Workforce is Ready!',
          html,
          text,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send activation email:', await response.text());
      } else {
        console.log('Activation email sent successfully to:', params.email);
      }
    } catch (error) {
      console.error('Error sending activation email:', error);
      // Don't throw - allow activation to succeed even if email fails
    }
  }

  /**
   * Get all customers for a reseller with dashboard data
   */
  async getResellerCustomers(resellerId: string): Promise<OnboardedCustomer[]> {
    const { data: customers, error } = await this.getSupabase()
      .from('customers')
      .select(`
        *,
        revenue_events (
          gross_amount,
          reseller_amount,
          timestamp
        )
      `)
      .eq('reseller_id', resellerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }

    return customers.map((customer: any) => {
      // Calculate total commission earned
      const totalCommission = customer.revenue_events?.reduce(
        (sum: number, event: any) => sum + (event.reseller_amount || 0),
        0
      ) / 100; // Convert cents to dollars

      // Calculate MRR based on plan
      const mrr = customer.plan_tier === 'starter' ? 997 : 
                  customer.plan_tier === 'pro' ? 1997 : 4997;

      return {
        id: customer.id,
        businessName: customer.company_name,
        ownerName: customer.metadata?.owner_name || '',
        email: customer.email,
        phone: customer.metadata?.phone || '',
        status: customer.status === 'active' ? 'active' : 
                customer.status === 'cancelled' ? 'cancelled' : 'pending_payment',
        mrr: customer.stripe_subscription_status === 'active' ? mrr : 0,
        commissionEarned: totalCommission,
        commissionRate: this.commissionRate,
        stripeCustomerId: customer.stripe_customer_id,
        stripeSubscriptionId: customer.stripe_subscription_id,
        createdAt: customer.created_at,
        activatedAt: customer.stripe_subscription_status === 'active' 
          ? customer.updated_at 
          : undefined,
        planTier: customer.plan_tier || 'starter',
        resellerId: customer.reseller_id,
      };
    });
  }

  /**
   * Get customer dashboard statistics
   */
  async getDashboardStats(resellerId: string): Promise<{
    totalCustomers: number;
    pendingPayment: number;
    activeCustomers: number;
    cancelledCustomers: number;
    totalMrr: number;
    totalCommission: number;
  }> {
    const customers = await this.getResellerCustomers(resellerId);

    const stats = {
      totalCustomers: customers.length,
      pendingPayment: customers.filter(c => c.status === 'pending_payment').length,
      activeCustomers: customers.filter(c => c.status === 'active').length,
      cancelledCustomers: customers.filter(c => c.status === 'cancelled').length,
      totalMrr: customers.reduce((sum, c) => sum + (c.status === 'active' ? c.mrr : 0), 0),
      totalCommission: customers.reduce((sum, c) => sum + c.commissionEarned, 0),
    };

    return stats;
  }

  /**
   * Resend welcome email with payment link
   */
  async resendWelcomeEmail(customerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: customer, error } = await this.getSupabase()
        .from('customers')
        .select('*, metadata')
        .eq('id', customerId)
        .single();

      if (error || !customer) {
        throw new Error(`Customer not found: ${error?.message}`);
      }

      // Create new checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customer.stripe_customer_id,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'AI Workforce Platform - Starter Plan',
                description: `Monthly subscription for ${customer.company_name}`,
              },
              unit_amount: 99700,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboard/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboard/cancel`,
      });

      // Send welcome email again
      await this.sendWelcomeEmail({
        email: customer.email,
        ownerName: customer.metadata?.owner_name || '',
        businessName: customer.company_name,
        paymentLink: session.url!,
        tempPassword: customer.metadata?.temporary_password,
        resellerId: customer.reseller_id,
      });

      // Update checkout session ID
      await this.getSupabase()
        .from('customers')
        .update({
          metadata: {
            ...customer.metadata,
            checkout_session_id: session.id,
          },
        })
        .eq('id', customerId);

      return { success: true };

    } catch (error) {
      console.error('Error resending welcome email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Update customer status (for cancellations, etc.)
   */
  async updateCustomerStatus(
    customerId: string,
    status: 'active' | 'cancelled'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.getSupabase()
        .from('customers')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerId);

      if (error) {
        throw new Error(`Update error: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating customer status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleStripeWebhook(event: Stripe.Event): Promise<{ success: boolean }> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.metadata?.customer_id;
        const subscriptionId = session.subscription as string;

        if (customerId && subscriptionId) {
          await this.activateCustomer(customerId, subscriptionId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string | undefined;
        
        // Calculate and record commission for recurring payment
        if (subscriptionId) {
          await this.recordRecurringCommission(subscriptionId, invoice.amount_paid);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.metadata?.customer_id;

        if (customerId) {
          await this.updateCustomerStatus(customerId, 'cancelled');
          
          // Deprovision King Mouse
          console.log(`🗑️ Deprovisioning King Mouse for cancelled customer: ${customerId}`);
          const deprovisionResult = await kingMouseService.deprovisionKingMouse(customerId);
          
          if (deprovisionResult.success) {
            console.log(`✅ King Mouse deprovisioned for: ${customerId}`);
          } else {
            console.error(`❌ King Mouse deprovisioning failed: ${deprovisionResult.error}`);
          }
        }
        break;
      }
    }

    return { success: true };
  }

  /**
   * Record commission for recurring payment
   */
  private async recordRecurringCommission(
    subscriptionId: string,
    amountPaid: number
  ): Promise<void> {
    // Get customer from subscription
    const { data: customers } = await this.getSupabase()
      .from('customers')
      .select('id, reseller_id')
      .eq('stripe_subscription_id', subscriptionId);

    if (!customers || customers.length === 0) return;

    const customer = customers[0];
    const commissionAmount = (amountPaid / 100) * this.commissionRate;

    await this.getSupabase().from('revenue_events').insert({
      reseller_id: customer.reseller_id,
      customer_id: customer.id,
      gross_amount: amountPaid,
      platform_fee_amount: amountPaid * (1 - this.commissionRate),
      reseller_amount: commissionAmount * 100,
      type: 'subscription_renewal',
      timestamp: new Date().toISOString(),
    });
  }
}

// Singleton instance
export const resellerCustomerManager = new ResellerCustomerManager();
