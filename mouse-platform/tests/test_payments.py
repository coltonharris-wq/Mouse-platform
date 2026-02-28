"""
Stripe Payment Integration Tests
Tests for webhooks, subscription handling, and payment processing
"""
import pytest
from unittest.mock import patch, MagicMock
import stripe

def test_stripe_webhook_subscription_created(client, mock_stripe_webhook_payload):
    """Handle subscription created webhook"""
    with patch('stripe.Webhook.construct_event') as mock_construct:
        mock_construct.return_value = {
            "type": "customer.subscription.created",
            "data": {
                "object": {
                    "id": "sub_test",
                    "customer": "cus_test123",
                    "status": "active"
                }
            }
        }
        
        response = client.post(
            "/webhooks/stripe",
            json=mock_stripe_webhook_payload,
            headers={"Stripe-Signature": "sig_test"}
        )
        
        assert response.status_code == 200
        assert response.json()["received"] is True

def test_stripe_webhook_payment_succeeded(client):
    """Handle payment succeeded webhook"""
    with patch('stripe.Webhook.construct_event') as mock_construct, \
         patch('main.platform.supabase') as mock_supabase:
        
        mock_construct.return_value = {
            "type": "invoice.payment_succeeded",
            "data": {
                "object": {
                    "id": "inv_test",
                    "customer": "cus_test123",
                    "amount_paid": 9900,
                    "subscription": "sub_test"
                }
            }
        }
        
        response = client.post(
            "/webhooks/stripe",
            json={},
            headers={"Stripe-Signature": "sig_test"}
        )
        
        assert response.status_code == 200

def test_stripe_webhook_payment_failed(client):
    """Handle payment failed webhook"""
    with patch('stripe.Webhook.construct_event') as mock_construct, \
         patch('main.platform.supabase') as mock_supabase:
        
        mock_construct.return_value = {
            "type": "invoice.payment_failed",
            "data": {
                "object": {
                    "id": "inv_test",
                    "customer": "cus_test123"
                }
            }
        }
        
        response = client.post(
            "/webhooks/stripe",
            json={},
            headers={"Stripe-Signature": "sig_test"}
        )
        
        assert response.status_code == 200

def test_stripe_webhook_subscription_cancelled(client):
    """Handle subscription cancelled webhook"""
    with patch('stripe.Webhook.construct_event') as mock_construct, \
         patch('main.platform.supabase') as mock_supabase:
        
        mock_construct.return_value = {
            "type": "customer.subscription.deleted",
            "data": {
                "object": {
                    "id": "sub_test",
                    "customer": "cus_test123",
                    "status": "cancelled"
                }
            }
        }
        
        response = client.post(
            "/webhooks/stripe",
            json={},
            headers={"Stripe-Signature": "sig_test"}
        )
        
        assert response.status_code == 200

def test_stripe_webhook_invalid_signature(client):
    """Reject webhook with invalid signature"""
    with patch('stripe.Webhook.construct_event') as mock_construct:
        mock_construct.side_effect = stripe.error.SignatureVerificationError(
            "Invalid signature", "sig"
        )
        
        response = client.post(
            "/webhooks/stripe",
            json={"type": "test"},
            headers={"Stripe-Signature": "invalid"}
        )
        
        assert response.status_code == 400

def test_stripe_webhook_missing_signature(client):
    """Reject webhook without signature"""
    response = client.post("/webhooks/stripe", json={"type": "test"})
    
    assert response.status_code in [400, 401, 422]

def test_stripe_webhook_malformed_payload(client):
    """Handle malformed webhook payload"""
    with patch('stripe.Webhook.construct_event') as mock_construct:
        mock_construct.side_effect = ValueError("Invalid payload")
        
        response = client.post(
            "/webhooks/stripe",
            data="not-json",
            headers={"Stripe-Signature": "sig", "Content-Type": "text/plain"}
        )
        
        assert response.status_code == 400

def test_payment_success_updates_customer_status(client):
    """Payment success should update customer subscription status"""
    with patch('stripe.Webhook.construct_event') as mock_construct, \
         patch('main.platform.supabase') as mock_supabase:
        
        mock_construct.return_value = {
            "type": "invoice.payment_succeeded",
            "data": {
                "object": {
                    "customer": "cus_test123",
                    "amount_paid": 9900
                }
            }
        }
        
        client.post(
            "/webhooks/stripe",
            json={},
            headers={"Stripe-Signature": "sig"}
        )
        
        # Should update customer status
        mock_supabase.update_customer_by_stripe_id.assert_called_once()

def test_payment_failure_updates_customer_status(client):
    """Payment failure should update customer to past_due"""
    with patch('stripe.Webhook.construct_event') as mock_construct, \
         patch('main.platform.supabase') as mock_supabase:
        
        mock_construct.return_value = {
            "type": "invoice.payment_failed",
            "data": {
                "object": {"customer": "cus_test123"}
            }
        }
        
        client.post(
            "/webhooks/stripe",
            json={},
            headers={"Stripe-Signature": "sig"}
        )
        
        call_args = mock_supabase.update_customer_by_stripe_id.call_args
        assert call_args[1]["stripe_subscription_status"] == "past_due"

def test_revenue_event_logged(client):
    """Successful payment should log revenue event"""
    with patch('stripe.Webhook.construct_event') as mock_construct, \
         patch('main.platform.supabase') as mock_supabase:
        
        mock_construct.return_value = {
            "type": "invoice.payment_succeeded",
            "data": {
                "object": {
                    "customer": "cus_test123",
                    "amount_paid": 9900,
                    "id": "inv_test123"
                }
            }
        }
        
        client.post(
            "/webhooks/stripe",
            json={},
            headers={"Stripe-Signature": "sig"}
        )
        
        mock_supabase.create_revenue_event.assert_called_once()

def test_stripe_webhook_idempotency(client):
    """Same webhook should be handled idempotently"""
    with patch('stripe.Webhook.construct_event') as mock_construct, \
         patch('main.platform.supabase') as mock_supabase:
        
        mock_construct.return_value = {
            "id": "evt_same_id",
            "type": "invoice.payment_succeeded",
            "data": {
                "object": {
                    "customer": "cus_test123",
                    "amount_paid": 9900
                }
            }
        }
        
        # Send same webhook twice
        client.post("/webhooks/stripe", json={}, headers={"Stripe-Signature": "sig"})
        client.post("/webhooks/stripe", json={}, headers={"Stripe-Signature": "sig"})
        
        # Should only create one revenue event
        assert mock_supabase.create_revenue_event.call_count == 1
