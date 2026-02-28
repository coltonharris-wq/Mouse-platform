#!/usr/bin/env python3
"""
Stripe Webhook Configuration Script
Sets up webhooks for Mouse Platform
"""

import os
import sys
import argparse

try:
    import stripe
except ImportError:
    print("❌ stripe package not installed. Run: pip install stripe")
    sys.exit(1)

def configure_webhooks(api_key: str, endpoint_url: str):
    """Configure Stripe webhooks for production"""
    
    stripe.api_key = api_key
    
    # Webhook events to subscribe to
    events = [
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "invoice.payment_succeeded",
        "invoice.payment_failed",
        "customer.created",
        "checkout.session.completed"
    ]
    
    try:
        # Check if webhook endpoint already exists
        existing = stripe.WebhookEndpoint.list(limit=10)
        
        for endpoint in existing.auto_paging_iter():
            if endpoint.url == endpoint_url:
                print(f"⚠️  Webhook endpoint already exists: {endpoint.id}")
                print(f"   Updating enabled events...")
                
                stripe.WebhookEndpoint.modify(
                    endpoint.id,
                    enabled_events=events
                )
                print(f"✅ Updated webhook endpoint")
                print(f"   Secret: {endpoint.secret}")
                return endpoint.secret
        
        # Create new webhook endpoint
        print(f"Creating new webhook endpoint: {endpoint_url}")
        endpoint = stripe.WebhookEndpoint.create(
            url=endpoint_url,
            enabled_events=events,
            description="Mouse Platform Production Webhooks"
        )
        
        print(f"✅ Webhook endpoint created: {endpoint.id}")
        print(f"   Secret: {endpoint.secret}")
        print("")
        print("⚠️  IMPORTANT: Save this webhook secret!")
        print("   Add it to your environment variables as STRIPE_WEBHOOK_SECRET")
        
        return endpoint.secret
        
    except stripe.error.StripeError as e:
        print(f"❌ Stripe error: {e}")
        sys.exit(1)

def test_webhook(api_key: str, endpoint_url: str):
    """Send a test webhook event"""
    stripe.api_key = api_key
    
    try:
        # Create a test event
        print("Sending test webhook event...")
        # Note: This requires Stripe CLI or using the test helpers API
        print("✅ To test webhooks, use the Stripe CLI:")
        print(f"   stripe trigger customer.subscription.created")
        print(f"   stripe listen --forward-to {endpoint_url}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    parser = argparse.ArgumentParser(description="Configure Stripe webhooks for Mouse Platform")
    parser.add_argument("--api-key", help="Stripe API key (or set STRIPE_SECRET_KEY env var)")
    parser.add_argument("--url", default="https://api.mouseplatform.com/webhooks/stripe",
                       help="Webhook endpoint URL")
    parser.add_argument("--test", action="store_true", help="Send test webhook")
    
    args = parser.parse_args()
    
    api_key = args.api_key or os.getenv("STRIPE_SECRET_KEY")
    
    if not api_key:
        print("❌ Error: Stripe API key required")
        print("   Pass --api-key or set STRIPE_SECRET_KEY environment variable")
        sys.exit(1)
    
    print("💳 Stripe Webhook Configuration")
    print("=" * 40)
    print("")
    
    secret = configure_webhooks(api_key, args.url)
    
    if args.test:
        test_webhook(api_key, args.url)
    
    print("")
    print("Next steps:")
    print("1. Copy the webhook secret above")
    print("2. Add to your backend environment variables")
    print("3. Test the webhook endpoint")

if __name__ == "__main__":
    main()
