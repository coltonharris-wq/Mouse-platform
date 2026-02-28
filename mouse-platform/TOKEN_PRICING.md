# Token Pricing System Documentation

## Overview

The Mouse Platform has transitioned from a monthly subscription model to a **token-based pricing system**. This provides customers with more flexibility and transparency - they purchase tokens once and use them as needed, rather than paying recurring monthly fees.

## Pricing Tiers

| Package | Price | Tokens | Bonus | Est. Hours | Best For |
|---------|-------|--------|-------|------------|----------|
| Starter | $19 | 2,000 | 0 | ~20 hours | Trying out AI employees |
| Growth | $49 | 6,000 | 500 | ~65 hours | Growing teams (Most Popular) |
| Pro | $99 | 15,000 | 1,500 | ~165 hours | Power users |

## Token Usage Rates

| Action | Token Cost |
|--------|------------|
| VM runtime (per minute) | 1 token |
| Screenshot capture | 0.5 tokens |
| API call | 0.1 tokens |
| AI message processing | 0.2 tokens |
| File upload (per MB) | 1 token |

## Key Features

1. **No Expiration**: Tokens never expire - use them whenever you need
2. **No Monthly Fees**: One-time purchases only
3. **Transparent Pricing**: Know exactly what you're paying for
4. **Track Usage**: Real-time balance and usage tracking
5. **Auto-deduction**: Tokens automatically deducted as AI employees work

## Database Schema

### New Tables

#### `token_packages`
Defines available token packages for purchase.
- `id`, `name`, `slug`, `price_cents`, `token_amount`, `bonus_tokens`
- `description`, `features` (JSONB), `is_active`, `stripe_price_id`

#### `token_balances`
Tracks each customer's current token balance.
- `customer_id`, `balance`, `lifetime_earned`, `lifetime_spent`
- `last_updated`, `created_at`

#### `token_transactions`
Records all token credit/debit transactions.
- `customer_id`, `type` (purchase/usage/bonus/refund/adjustment)
- `amount`, `balance_after`, `description`
- `reference_id`, `reference_type`, `metadata`

#### `token_rates`
Defines the cost of various platform actions.
- `action_type`, `tokens_per_unit`, `unit_name`, `description`

#### `token_orders`
Tracks pending and completed token purchases.
- `customer_id`, `package_id`, `token_amount`, `price_cents`
- `stripe_payment_intent_id`, `stripe_checkout_session_id`, `status`

### Database Functions

#### `credit_tokens()`
Adds tokens to a customer's balance and creates a transaction record.

#### `debit_tokens()`
Removes tokens from a customer's balance if sufficient balance exists.
Returns success status, transaction ID, and new balance.

## API Endpoints

### Token Management

#### `GET /api/v1/token-packages`
Returns all available token packages.

#### `GET /api/v1/customers/{customer_id}/tokens`
Returns customer's token balance and recent transactions.

#### `GET /api/v1/customers/{customer_id}/tokens/transactions`
Returns full transaction history.

#### `POST /api/v1/customers/{customer_id}/tokens/purchase`
Creates a Stripe checkout session for token purchase.
```json
{
  "package_slug": "growth",
  "success_url": "https://...",
  "cancel_url": "https://..."
}
```

#### `GET /api/v1/customers/{customer_id}/tokens/orders`
Returns customer's purchase history.

### Customer Dashboard

#### `GET /api/v1/customers/{customer_id}/dashboard`
Returns complete dashboard data including:
- Customer info
- Token balance and stats
- Recent transactions
- Active employees
- Available packages

## Frontend Components

### TokenPricing.tsx
Main pricing page component showing:
- Token packages with comparison
- Token usage calculator
- What can be done with tokens

### TokenCheckout.tsx
Checkout flow for purchasing tokens:
- Package selection
- Order summary
- Stripe checkout integration

### TokenDashboard.tsx
Customer dashboard showing:
- Current token balance
- Estimated hours remaining
- Recent transactions
- Active AI employees
- Quick purchase actions

### TokenBalanceCard
Small component for displaying balance in sidebar/header.

### TokenTransactionHistory
Component for displaying transaction history.

## Stripe Integration

### Webhook Events
The system handles these Stripe webhook events:

#### `checkout.session.completed`
Processes completed token purchases and credits tokens to customer.

#### `payment_intent.succeeded`
Backup handler for token purchase completion.

### Security
- Webhook signatures are validated using `STRIPE_WEBHOOK_SECRET`
- All payment intents include metadata for tracking

## Migration from Monthly Plans

Existing customers with monthly plans have been migrated:
- Starter plan → 2,000 tokens
- Growth plan → 6,500 tokens
- Enterprise plan → 16,500 tokens

These tokens were credited to their accounts as a one-time bonus.

## Usage Flow

1. **Customer Onboarding**
   - New customers start with 0 tokens
   - Must purchase tokens before deploying AI employees

2. **Token Purchase**
   - Customer selects package
   - Stripe checkout session created
   - Payment processed
   - Tokens automatically credited

3. **AI Employee Deployment**
   - System checks token balance (min 100 tokens required)
   - VM spins up and begins working
   - Tokens deducted per minute of runtime

4. **Ongoing Usage**
   - Real-time balance updates
   - Transactions logged for all activity
   - Dashboard shows current balance

5. **Low Balance**
   - Warning displayed when balance < 500 tokens
   - Prompt to purchase more tokens
   - Quick purchase buttons available

## Implementation Files

### Backend
- `/api-gateway/main.py` - API routes
- `/api-gateway/orchestrator.py` - Business logic
- `/api-gateway/supabase_client.py` - Database operations
- `/api-gateway/token_pricing.py` - Pricing configuration

### Frontend
- `/components/TokenPricing.tsx` - Pricing page
- `/components/TokenCheckout.tsx` - Checkout flow
- `/components/TokenDashboard.tsx` - User dashboard

### Database
- `/supabase/token_pricing_migration.sql` - Schema and seed data

## Environment Variables

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Supabase
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...

# Orgo
ORGO_API_KEY=...
ORGO_WORKSPACE_ID=...
```

## Testing

Run the test script to verify the token system:

```bash
cd /mouse-platform/api-gateway
python -m pytest tests/test_token_pricing.py -v
```

## Future Enhancements

1. **Auto-recharge**: Option to automatically purchase tokens when balance is low
2. **Usage alerts**: Email/notification when balance reaches thresholds
3. **Bulk discounts**: Volume pricing for enterprise customers
4. **Token gifting**: Ability to transfer tokens between accounts
5. **Promotional codes**: Discount codes for special offers
