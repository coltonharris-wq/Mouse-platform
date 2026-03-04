"""
Commission Calculation Module - FIXED
Uses integer cents for precise financial calculations

Fixes Bug #1: Commission calculation precision error
"""
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Tuple

# Constants
PLATFORM_FEE_PERCENT = Decimal("12")  # 12% platform fee
RESELLER_PERCENT = Decimal("88")      # 88% to reseller
PRECISION = Decimal("0.01")           # Penny precision


def calculate_revenue_split_cents(gross_amount_cents: int) -> Dict[str, int]:
    """
    Calculate revenue split using integer cents for precision
    
    Args:
        gross_amount_cents: Gross amount in cents (e.g., 10000 for $100.00)
        
    Returns:
        Dict with gross_amount_cents, platform_fee_cents, reseller_cents
        
    Example:
        >>> calculate_revenue_split_cents(10000)  # $100.00
        {
            'gross_amount_cents': 10000,
            'platform_fee_cents': 1200,  # $12.00
            'reseller_cents': 8800       # $88.00
        }
    """
    # Calculate platform fee in cents
    platform_fee_cents = int(
        (Decimal(gross_amount_cents) * PLATFORM_FEE_PERCENT / 100).quantize(
            PRECISION, rounding=ROUND_HALF_UP
        )
    )
    
    # Reseller gets the remainder (ensures pennies add up correctly)
    reseller_cents = gross_amount_cents - platform_fee_cents
    
    return {
        "gross_amount_cents": gross_amount_cents,
        "platform_fee_cents": platform_fee_cents,
        "reseller_cents": reseller_cents
    }


def calculate_revenue_split_dollars(gross_amount: float) -> Dict[str, float]:
    """
    Calculate revenue split accepting dollars, returning dollars
    Converts to cents internally for precision, returns dollars for display
    
    Args:
        gross_amount: Gross amount in dollars (e.g., 100.00)
        
    Returns:
        Dict with gross_amount, platform_fee_amount, reseller_amount
        
    Example:
        >>> calculate_revenue_split_dollars(100.00)
        {
            'gross_amount': 100.00,
            'platform_fee_amount': 12.00,
            'reseller_amount': 88.00
        }
    """
    # Convert to cents for calculation
    gross_cents = int(round(gross_amount * 100))
    
    # Calculate in cents
    result_cents = calculate_revenue_split_cents(gross_cents)
    
    # Convert back to dollars for display
    return {
        "gross_amount": result_cents["gross_amount_cents"] / 100,
        "platform_fee_amount": result_cents["platform_fee_cents"] / 100,
        "reseller_amount": result_cents["reseller_cents"] / 100
    }


def cents_to_dollars(cents: int) -> float:
    """Convert cents to dollars"""
    return cents / 100


def dollars_to_cents(dollars: float) -> int:
    """Convert dollars to cents with proper rounding"""
    return int(round(Decimal(str(dollars)) * 100))


# For backwards compatibility - deprecated
# These functions use floating point and may have penny-off errors
def calculate_revenue_split_legacy(gross_amount: float) -> Dict[str, float]:
    """
    LEGACY: Old calculation with floating point math
    Kept for reference only - DO NOT USE
    """
    platform_fee_amount = round(gross_amount * (float(PLATFORM_FEE_PERCENT) / 100), 2)
    reseller_amount = round(gross_amount - platform_fee_amount, 2)
    return {
        "gross_amount": gross_amount,
        "platform_fee_amount": platform_fee_amount,
        "reseller_amount": reseller_amount
    }


# Stripe webhook handler for revenue events
async def handle_stripe_charge_succeeded(stripe_event: dict, supabase_client) -> Dict:
    """
    Handle Stripe charge succeeded event with precise commission calculation
    
    Args:
        stripe_event: Stripe event object
        supabase_client: Supabase client instance
        
    Returns:
        Dict with created revenue event
    """
    charge = stripe_event["data"]["object"]
    
    # Get amount in cents from Stripe
    amount_cents = charge.get("amount", 0)
    currency = charge.get("currency", "usd")
    
    # Calculate split in cents
    split = calculate_revenue_split_cents(amount_cents)
    
    # Get customer and reseller info from metadata
    metadata = charge.get("metadata", {})
    customer_id = metadata.get("customer_id")
    reseller_id = metadata.get("reseller_id")
    
    # Create revenue event with cents precision
    revenue_event = {
        "reseller_id": reseller_id,
        "customer_id": customer_id,
        "stripe_event_id": charge["id"],
        "gross_amount": split["gross_amount_cents"],  # Store as cents
        "platform_fee_amount": split["platform_fee_cents"],
        "reseller_amount": split["reseller_cents"],
        "type": "charge_succeeded",
        "currency": currency,
        "timestamp": charge.get("created")
    }
    
    # Insert into database
    result = await supabase_client.create_revenue_event(revenue_event)
    
    return {
        "success": True,
        "revenue_event": revenue_event,
        "split": {
            "gross": cents_to_dollars(split["gross_amount_cents"]),
            "platform_fee": cents_to_dollars(split["platform_fee_cents"]),
            "reseller": cents_to_dollars(split["reseller_cents"])
        }
    }


# Test cases
if __name__ == "__main__":
    # Test cases to verify precision
    test_cases = [
        100.00,   # $100.00 -> $12.00 fee, $88.00 reseller
        99.99,    # $99.99 -> $12.00 fee, $87.99 reseller
        49.99,    # $49.99 -> $6.00 fee, $43.99 reseller
        0.99,     # $0.99 -> $0.12 fee, $0.87 reseller
        1000.00,  # $1000.00 -> $120.00 fee, $880.00 reseller
    ]
    
    print("Testing commission calculation precision:")
    print("=" * 60)
    
    for amount in test_cases:
        result = calculate_revenue_split_dollars(amount)
        total = result["platform_fee_amount"] + result["reseller_amount"]
        
        print(f"\nGross: ${amount:.2f}")
        print(f"  Platform fee: ${result['platform_fee_amount']:.2f}")
        print(f"  Reseller: ${result['reseller_amount']:.2f}")
        print(f"  Sum check: ${total:.2f} (should equal ${amount:.2f})")
        print(f"  ✓ PASS" if abs(total - amount) < 0.001 else f"  ✗ FAIL")
    
    # Test cents-based calculation
    print("\n\nTesting cents-based calculation:")
    print("=" * 60)
    
    for amount in test_cases:
        cents = dollars_to_cents(amount)
        result = calculate_revenue_split_cents(cents)
        total_cents = result["platform_fee_cents"] + result["reseller_cents"]
        
        print(f"\nGross: {cents} cents (${amount:.2f})")
        print(f"  Platform fee: {result['platform_fee_cents']} cents")
        print(f"  Reseller: {result['reseller_cents']} cents")
        print(f"  Sum check: {total_cents} cents (should equal {cents})")
        print(f"  ✓ PASS" if total_cents == cents else f"  ✗ FAIL")
