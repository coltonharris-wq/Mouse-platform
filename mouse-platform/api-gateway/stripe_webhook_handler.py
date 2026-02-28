"""
Stripe Webhook Handler for Token Purchases
Handles Stripe webhook events for token-based pricing
"""
import os
import stripe
from typing import Dict, Optional
from datetime import datetime

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

class StripeWebhookHandler:
    """Handles Stripe webhook events for token purchases and subscriptions"""
    
    def __init__(self, supabase_client):
        self.supabase = supabase_client
    
    def construct_event(self, payload: bytes, sig_header: str) -> Dict:
        """
        Verify and construct Stripe webhook event
        Raises ValueError or stripe.error.SignatureVerificationError on failure
        """
        return stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    
    async def handle_event(self, event: Dict) -> Dict:
        """
        Route webhook event to appropriate handler
        """
        event_type = event.get("type")
        
        handlers = {
            # Checkout events
            "checkout.session.completed": self.handle_checkout_completed,
            "checkout.session.expired": self.handle_checkout_expired,
            
            # Payment events
            "payment_intent.succeeded": self.handle_payment_intent_succeeded,
            "payment_intent.payment_failed": self.handle_payment_intent_failed,
            
            # Charge events
            "charge.succeeded": self.handle_charge_succeeded,
            "charge.failed": self.handle_charge_failed,
            "charge.refunded": self.handle_charge_refunded,
            
            # Refund events
            "refund.created": self.handle_refund_created,
            
            # Customer events
            "customer.created": self.handle_customer_created,
            "customer.deleted": self.handle_customer_deleted,
        }
        
        handler = handlers.get(event_type)
        if handler:
            return await handler(event)
        
        return {"received": True, "handled": False, "type": event_type}
    
    # ========== CHECKOUT SESSION HANDLERS ==========
    
    async def handle_checkout_completed(self, event: Dict) -> Dict:
        """
        Handle completed checkout session
        This is where we credit tokens after successful payment
        """
        session = event["data"]["object"]
        session_id = session["id"]
        metadata = session.get("metadata", {})
        
        # Check if this is a token purchase
        customer_id = metadata.get("customer_id")
        package_slug = metadata.get("package_slug")
        token_amount = metadata.get("token_amount")
        
        if not all([customer_id, package_slug, token_amount]):
            # Not a token purchase, might be a different product
            return {
                "received": True,
                "handled": False,
                "reason": "Not a token purchase",
                "session_id": session_id
            }
        
        try:
            token_amount = int(token_amount)
        except (ValueError, TypeError):
            return {
                "received": True,
                "handled": False,
                "error": "Invalid token amount",
                "session_id": session_id
            }
        
        # Get payment intent for reference
        payment_intent_id = session.get("payment_intent")
        
        # Check if we already processed this order
        existing_order = await self.supabase.get_token_order_by_session(session_id)
        if existing_order and existing_order.get("status") == "completed":
            return {
                "received": True,
                "handled": True,
                "duplicate": True,
                "order_id": existing_order["id"]
            }
        
        # Credit tokens to customer
        transaction_id = await self.supabase.credit_tokens(
            customer_id=customer_id,
            amount=token_amount,
            description=f"Token purchase - {package_slug}",
            transaction_type="purchase",
            reference_id=payment_intent_id or session_id,
            reference_type="stripe_checkout",
            metadata={
                "session_id": session_id,
                "package_slug": package_slug,
                "amount_paid": session.get("amount_total"),
                "currency": session.get("currency")
            }
        )
        
        # Update order status
        if existing_order:
            await self.supabase.update_token_order(existing_order["id"], {
                "status": "completed",
                "stripe_payment_intent_id": payment_intent_id,
                "completed_at": datetime.utcnow().isoformat()
            })
        
        # Create revenue event for tracking
        await self.supabase.create_revenue_event({
            "type": "token_purchase",
            "customer_id": customer_id,
            "amount": session.get("amount_total", 0),
            "currency": session.get("currency", "usd"),
            "stripe_session_id": session_id,
            "stripe_payment_intent_id": payment_intent_id,
            "tokens_purchased": token_amount,
            "transaction_id": transaction_id,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return {
            "received": True,
            "handled": True,
            "type": "checkout.session.completed",
            "customer_id": customer_id,
            "tokens_credited": token_amount,
            "transaction_id": transaction_id
        }
    
    async def handle_checkout_expired(self, event: Dict) -> Dict:
        """Handle expired checkout session"""
        session = event["data"]["object"]
        session_id = session["id"]
        
        # Update order status to expired
        existing_order = await self.supabase.get_token_order_by_session(session_id)
        if existing_order:
            await self.supabase.update_token_order(existing_order["id"], {
                "status": "expired"
            })
        
        return {
            "received": True,
            "handled": True,
            "type": "checkout.session.expired",
            "session_id": session_id
        }
    
    # ========== PAYMENT INTENT HANDLERS ==========
    
    async def handle_payment_intent_succeeded(self, event: Dict) -> Dict:
        """
        Handle successful payment intent
        Usually redundant with checkout.session.completed but serves as backup
        """
        payment_intent = event["data"]["object"]
        metadata = payment_intent.get("metadata", {})
        
        # Only process if it's a token purchase not already handled by checkout
        if metadata.get("type") == "token_purchase":
            # This is a direct payment intent (not through checkout)
            customer_id = metadata.get("customer_id")
            token_amount = metadata.get("token_amount")
            
            if customer_id and token_amount:
                # Check if already credited via checkout session
                # (This would require additional tracking)
                pass
        
        return {
            "received": True,
            "handled": True,
            "type": "payment_intent.succeeded"
        }
    
    async def handle_payment_intent_failed(self, event: Dict) -> Dict:
        """Handle failed payment intent"""
        payment_intent = event["data"]["object"]
        
        # Log the failure
        await self.supabase.create_revenue_event({
            "type": "payment_failed",
            "stripe_payment_intent_id": payment_intent["id"],
            "amount": payment_intent.get("amount"),
            "currency": payment_intent.get("currency"),
            "failure_message": payment_intent.get("last_payment_error", {}).get("message"),
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return {
            "received": True,
            "handled": True,
            "type": "payment_intent.payment_failed"
        }
    
    # ========== CHARGE HANDLERS ==========
    
    async def handle_charge_succeeded(self, event: Dict) -> Dict:
        """Handle successful charge"""
        # Most processing is done in checkout.session.completed
        return {"received": True, "handled": True, "type": "charge.succeeded"}
    
    async def handle_charge_failed(self, event: Dict) -> Dict:
        """Handle failed charge"""
        charge = event["data"]["object"]
        
        await self.supabase.create_revenue_event({
            "type": "charge_failed",
            "stripe_charge_id": charge["id"],
            "failure_code": charge.get("failure_code"),
            "failure_message": charge.get("failure_message"),
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return {"received": True, "handled": True, "type": "charge.failed"}
    
    async def handle_charge_refunded(self, event: Dict) -> Dict:
        """Handle refunded charge - may need to revoke tokens"""
        charge = event["data"]["object"]
        
        # Find associated transaction
        # This would require storing charge ID with the transaction
        
        return {"received": True, "handled": True, "type": "charge.refunded"}
    
    # ========== REFUND HANDLERS ==========
    
    async def handle_refund_created(self, event: Dict) -> Dict:
        """
        Handle refund creation
        May need to deduct tokens if they haven't been used
        """
        refund = event["data"]["object"]
        
        # Log refund
        await self.supabase.create_revenue_event({
            "type": "refund",
            "stripe_refund_id": refund["id"],
            "stripe_charge_id": refund.get("charge"),
            "amount": refund.get("amount"),
            "reason": refund.get("reason"),
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return {"received": True, "handled": True, "type": "refund.created"}
    
    # ========== CUSTOMER HANDLERS ==========
    
    async def handle_customer_created(self, event: Dict) -> Dict:
        """Handle new Stripe customer creation"""
        stripe_customer = event["data"]["object"]
        
        # Update our customer record with Stripe ID if needed
        # This would require looking up by email
        
        return {"received": True, "handled": True, "type": "customer.created"}
    
    async def handle_customer_deleted(self, event: Dict) -> Dict:
        """Handle Stripe customer deletion"""
        stripe_customer = event["data"]["object"]
        stripe_id = stripe_customer["id"]
        
        # Update our customer record
        customer = await self.supabase.get_customer_by_stripe_id(stripe_id)
        if customer:
            await self.supabase.update_customer(customer["id"], {
                "stripe_customer_id": None,
                "stripe_subscription_status": "cancelled"
            })
        
        return {"received": True, "handled": True, "type": "customer.deleted"}
    
    # ========== UTILITY METHODS ==========
    
    async def verify_session_payment(self, session_id: str) -> bool:
        """Verify that a checkout session was successfully paid"""
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            return session.get("payment_status") == "paid"
        except stripe.error.StripeError:
            return False
    
    async def get_session_details(self, session_id: str) -> Optional[Dict]:
        """Get checkout session details from Stripe"""
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            return {
                "id": session["id"],
                "customer": session.get("customer"),
                "payment_status": session.get("payment_status"),
                "amount_total": session.get("amount_total"),
                "currency": session.get("currency"),
                "metadata": session.get("metadata", {})
            }
        except stripe.error.StripeError:
            return None
