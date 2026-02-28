"""
Token Pricing Configuration
Manages token pricing tiers and usage rates
"""
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class TokenPackage:
    """Token package definition"""
    id: str
    name: str
    slug: str
    price_cents: int
    token_amount: int
    description: str
    features: List[str]
    stripe_price_id: Optional[str] = None
    
    @property
    def total_tokens(self) -> int:
        """Total tokens"""
        return self.token_amount
    
    @property
    def display_price(self) -> str:
        """Formatted price string"""
        return f"${self.price_cents / 100:.0f}"
    
    @property
    def price_per_token(self) -> float:
        """Effective price per token in cents"""
        if self.total_tokens == 0:
            return 0
        return self.price_cents / self.total_tokens
    
    @property
    def price_per_1000_tokens(self) -> float:
        """Price per 1000 tokens"""
        return (self.price_cents / 100) / (self.total_tokens / 1000)


@dataclass
class TokenRate:
    """Token usage rate for an action"""
    action_type: str
    tokens: int
    description: str


class TokenPricingConfig:
    """Token pricing configuration - UPDATED per requirements"""
    
    # Token packages per requirements
    PACKAGES = {
        "starter": TokenPackage(
            id="starter",
            name="Starter",
            slug="starter",
            price_cents=1900,  # $19
            token_amount=4000,  # 4,000 tokens
            description="Perfect for small teams getting started",
            features=[
                "4,000 tokens",
                "Message with King Mouse",
                "Deploy AI employees",
                "Email support"
            ],
            stripe_price_id=None
        ),
        "growth": TokenPackage(
            id="growth",
            name="Growth",
            slug="growth",
            price_cents=4900,  # $49
            token_amount=12000,  # 12,000 tokens
            description="Best value for growing teams",
            features=[
                "12,000 tokens",
                "Everything in Starter",
                "Priority support",
                "API access"
            ],
            stripe_price_id=None
        ),
        "pro": TokenPackage(
            id="pro",
            name="Pro",
            slug="pro",
            price_cents=9900,  # $99
            token_amount=30000,  # 30,000 tokens
            description="Maximum value for power users",
            features=[
                "30,000 tokens",
                "Everything in Growth",
                "Dedicated support",
                "Custom integrations"
            ],
            stripe_price_id=None
        ),
        "enterprise": TokenPackage(
            id="enterprise",
            name="Enterprise",
            slug="enterprise",
            price_cents=0,  # Custom pricing
            token_amount=0,  # Custom amount
            description="Custom pricing for large organizations",
            features=[
                "Custom token amount",
                "Volume discounts",
                "Dedicated account manager",
                "SLA guarantees",
                "Custom contracts"
            ],
            stripe_price_id=None
        )
    }
    
    # Token costs per requirements
    RATES = {
        "message_king_mouse": TokenRate(
            action_type="message_king_mouse",
            tokens=10,
            description="Send a message to King Mouse"
        ),
        "deploy_ai_employee": TokenRate(
            action_type="deploy_ai_employee",
            tokens=100,
            description="Deploy a new AI employee"
        ),
        "vm_runtime_1h": TokenRate(
            action_type="vm_runtime_1h",
            tokens=500,
            description="1 hour of VM runtime"
        ),
        "process_email": TokenRate(
            action_type="process_email",
            tokens=5,
            description="Process 1 email"
        ),
        "api_call": TokenRate(
            action_type="api_call",
            tokens=1,
            description="API call"
        )
    }
    
    # Low balance threshold
    LOW_BALANCE_THRESHOLD = 500
    
    @classmethod
    def get_package(cls, slug: str) -> Optional[TokenPackage]:
        """Get a token package by slug"""
        return cls.PACKAGES.get(slug)
    
    @classmethod
    def get_all_packages(cls) -> List[TokenPackage]:
        """Get all token packages (excluding enterprise)"""
        return [pkg for pkg in cls.PACKAGES.values() if pkg.slug != "enterprise"]
    
    @classmethod
    def get_rate(cls, action_type: str) -> Optional[TokenRate]:
        """Get token rate for an action"""
        return cls.RATES.get(action_type)
    
    @classmethod
    def get_all_rates(cls) -> List[TokenRate]:
        """Get all token rates"""
        return list(cls.RATES.values())
    
    @classmethod
    def calculate_message_cost(cls, count: int = 1) -> int:
        """Calculate token cost for messages"""
        return count * cls.RATES["message_king_mouse"].tokens
    
    @classmethod
    def calculate_deploy_cost(cls, count: int = 1) -> int:
        """Calculate token cost for deploying employees"""
        return count * cls.RATES["deploy_ai_employee"].tokens
    
    @classmethod
    def calculate_vm_cost(cls, hours: float) -> int:
        """Calculate token cost for VM runtime (hours)"""
        return int(hours * cls.RATES["vm_runtime_1h"].tokens)
    
    @classmethod
    def calculate_email_cost(cls, count: int = 1) -> int:
        """Calculate token cost for processing emails"""
        return count * cls.RATES["process_email"].tokens
    
    @classmethod
    def calculate_api_cost(cls, count: int = 1) -> int:
        """Calculate token cost for API calls"""
        return count * cls.RATES["api_call"].tokens
    
    @classmethod
    def is_low_balance(cls, balance: int) -> bool:
        """Check if balance is low"""
        return balance < cls.LOW_BALANCE_THRESHOLD
    
    @classmethod
    def get_comparison_table(cls) -> List[Dict]:
        """Get pricing comparison table for UI"""
        packages = []
        for pkg in cls.PACKAGES.values():
            pkg_data = {
                "id": pkg.slug,
                "name": pkg.name,
                "price": pkg.display_price if pkg.price_cents > 0 else "Custom",
                "tokens": f"{pkg.total_tokens:,}" if pkg.token_amount > 0 else "Custom",
                "features": pkg.features,
                "popular": pkg.slug == "growth",
                "price_per_1000": f"${pkg.price_per_1000_tokens:.2f}" if pkg.token_amount > 0 else "Custom"
            }
            packages.append(pkg_data)
        return packages
    
    @classmethod
    def get_action_costs_table(cls) -> List[Dict]:
        """Get action costs table for UI"""
        return [
            {
                "action": "Message King Mouse",
                "cost": f"{cls.RATES['message_king_mouse'].tokens} tokens",
                "description": "Each message sent to King Mouse"
            },
            {
                "action": "Deploy AI Employee",
                "cost": f"{cls.RATES['deploy_ai_employee'].tokens} tokens",
                "description": "One-time cost per AI employee deployment"
            },
            {
                "action": "VM Runtime",
                "cost": f"{cls.RATES['vm_runtime_1h'].tokens} tokens/hour",
                "description": "Per hour of VM runtime"
            },
            {
                "action": "Process Email",
                "cost": f"{cls.RATES['process_email'].tokens} tokens",
                "description": "Per email processed"
            },
            {
                "action": "API Call",
                "cost": f"{cls.RATES['api_call'].tokens} token",
                "description": "Per API request"
            }
        ]
