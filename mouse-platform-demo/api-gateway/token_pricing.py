"""
Work Hours Pricing Configuration
Manages work hours pricing tiers and usage rates
"""
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class WorkHoursPackage:
    """Work hours package definition"""
    id: str
    name: str
    slug: str
    price_cents: int
    work_hours: int
    description: str
    features: List[str]
    stripe_price_id: Optional[str] = None
    
    @property
    def display_price(self) -> str:
        """Formatted price string"""
        return f"${self.price_cents / 100:.0f}"
    
    @property
    def price_per_hour(self) -> float:
        """Effective price per work hour"""
        if self.work_hours == 0:
            return 0
        return (self.price_cents / 100) / self.work_hours


@dataclass
class WorkHoursRate:
    """Work hours usage rate for an action"""
    action_type: str
    hours: float
    description: str


class WorkHoursPricingConfig:
    """Work Hours pricing configuration - UPDATED per requirements"""
    
    # Work hours packages per requirements
    PACKAGES = {
        "starter": WorkHoursPackage(
            id="starter",
            name="Starter",
            slug="starter",
            price_cents=9700,  # $97
            work_hours=20,  # 20 work hours
            description="Perfect for small teams getting started",
            features=[
                "20 AI Work Hours",
                "Message with King Mouse",
                "Deploy AI employees",
                "Email support"
            ],
            stripe_price_id=None
        ),
        "growth": WorkHoursPackage(
            id="growth",
            name="Growth",
            slug="growth",
            price_cents=29700,  # $297
            work_hours=70,  # 70 work hours
            description="Best value for growing teams",
            features=[
                "70 AI Work Hours",
                "Everything in Starter",
                "Priority support",
                "API access"
            ],
            stripe_price_id=None
        ),
        "pro": WorkHoursPackage(
            id="pro",
            name="Pro",
            slug="pro",
            price_cents=49700,  # $497
            work_hours=125,  # 125 work hours
            description="Maximum value for power users",
            features=[
                "125 AI Work Hours",
                "Everything in Growth",
                "Dedicated support",
                "Custom integrations"
            ],
            stripe_price_id=None
        ),
        "enterprise": WorkHoursPackage(
            id="enterprise",
            name="Enterprise",
            slug="enterprise",
            price_cents=0,  # Custom pricing
            work_hours=0,  # Custom amount
            description="Custom pricing for large organizations",
            features=[
                "Custom work hours",
                "Volume discounts",
                "Dedicated account manager",
                "SLA guarantees",
                "Custom contracts"
            ],
            stripe_price_id=None
        )
    }
    
    # Work hours costs per action
    RATES = {
        "message_king_mouse": WorkHoursRate(
            action_type="message_king_mouse",
            hours=0.1,
            description="Send a message to King Mouse"
        ),
        "deploy_ai_employee": WorkHoursRate(
            action_type="deploy_ai_employee",
            hours=1,
            description="Deploy a new AI employee"
        ),
        "vm_runtime_1h": WorkHoursRate(
            action_type="vm_runtime_1h",
            hours=1,
            description="1 hour of VM runtime"
        ),
        "process_email": WorkHoursRate(
            action_type="process_email",
            hours=0.05,
            description="Process 1 email"
        ),
        "api_call": WorkHoursRate(
            action_type="api_call",
            hours=0.01,
            description="API call"
        )
    }
    
    # Low balance threshold (in hours)
    LOW_BALANCE_THRESHOLD = 5
    
    @classmethod
    def get_package(cls, slug: str) -> Optional[WorkHoursPackage]:
        """Get a work hours package by slug"""
        return cls.PACKAGES.get(slug)
    
    @classmethod
    def get_all_packages(cls) -> List[WorkHoursPackage]:
        """Get all work hours packages (excluding enterprise)"""
        return [pkg for pkg in cls.PACKAGES.values() if pkg.slug != "enterprise"]
    
    @classmethod
    def get_rate(cls, action_type: str) -> Optional[WorkHoursRate]:
        """Get work hours rate for an action"""
        return cls.RATES.get(action_type)
    
    @classmethod
    def get_all_rates(cls) -> List[WorkHoursRate]:
        """Get all work hours rates"""
        return list(cls.RATES.values())
    
    @classmethod
    def calculate_message_cost(cls, count: int = 1) -> float:
        """Calculate work hours cost for messages"""
        return count * cls.RATES["message_king_mouse"].hours
    
    @classmethod
    def calculate_deploy_cost(cls, count: int = 1) -> float:
        """Calculate work hours cost for deploying employees"""
        return count * cls.RATES["deploy_ai_employee"].hours
    
    @classmethod
    def calculate_vm_cost(cls, hours: float) -> float:
        """Calculate work hours cost for VM runtime (hours)"""
        return hours * cls.RATES["vm_runtime_1h"].hours
    
    @classmethod
    def calculate_email_cost(cls, count: int = 1) -> float:
        """Calculate work hours cost for processing emails"""
        return count * cls.RATES["process_email"].hours
    
    @classmethod
    def calculate_api_cost(cls, count: int = 1) -> float:
        """Calculate work hours cost for API calls"""
        return count * cls.RATES["api_call"].hours
    
    @classmethod
    def is_low_balance(cls, balance: float) -> bool:
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
                "work_hours": f"{pkg.work_hours:,}" if pkg.work_hours > 0 else "Custom",
                "features": pkg.features,
                "popular": pkg.slug == "growth",
                "price_per_hour": f"${pkg.price_per_hour:.2f}" if pkg.work_hours > 0 else "Custom"
            }
            packages.append(pkg_data)
        return packages
    
    @classmethod
    def get_action_costs_table(cls) -> List[Dict]:
        """Get action costs table for UI"""
        return [
            {
                "action": "Message King Mouse",
                "cost": f"{cls.RATES['message_king_mouse'].hours} hours",
                "description": "Each message sent to King Mouse"
            },
            {
                "action": "Deploy AI Employee",
                "cost": f"{cls.RATES['deploy_ai_employee'].hours} hour",
                "description": "One-time cost per AI employee deployment"
            },
            {
                "action": "VM Runtime",
                "cost": f"{cls.RATES['vm_runtime_1h'].hours} hour/hour",
                "description": "Per hour of VM runtime"
            },
            {
                "action": "Process Email",
                "cost": f"{cls.RATES['process_email'].hours} hours",
                "description": "Per email processed"
            },
            {
                "action": "API Call",
                "cost": f"{cls.RATES['api_call'].hours} hours",
                "description": "Per API request"
            }
        ]


# Backward compatibility - keep TokenPricingConfig as alias
TokenPackage = WorkHoursPackage
TokenRate = WorkHoursRate
TokenPricingConfig = WorkHoursPricingConfig