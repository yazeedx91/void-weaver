"""
Payment Gateway Abstraction Layer
Modular design to support multiple payment providers
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

class PaymentProvider(Enum):
    """Supported payment providers"""
    MOYASAR = "moyasar"
    HYPERPAY = "hyperpay"

class PaymentStatus(Enum):
    """Payment status enumeration"""
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class PaymentRequest:
    """Payment request data structure"""
    amount: float
    currency: str
    tier: str
    customer_email: str
    customer_name: str
    description: str
    callback_url: str
    webhook_url: str

@dataclass
class PaymentResponse:
    """Payment response data structure"""
    success: bool
    payment_id: Optional[str] = None
    checkout_url: Optional[str] = None
    status: Optional[PaymentStatus] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class PaymentGateway(ABC):
    """Abstract payment gateway interface"""
    
    @abstractmethod
    async def create_payment_session(self, request: PaymentRequest) -> PaymentResponse:
        """Create a payment session"""
        pass
    
    @abstractmethod
    async def verify_payment(self, payment_id: str) -> PaymentResponse:
        """Verify a payment status"""
        pass
    
    @abstractmethod
    async def verify_webhook(self, payload: Dict[str, Any], signature: str) -> bool:
        """Verify webhook signature"""
        pass
    
    @abstractmethod
    def get_provider_name(self) -> PaymentProvider:
        """Get provider name"""
        pass

class PaymentGatewayFactory:
    """Factory for creating payment gateway instances"""
    
    @staticmethod
    def create_gateway(provider: PaymentProvider) -> PaymentGateway:
        """Create payment gateway instance"""
        if provider == PaymentProvider.MOYASAR:
            from .moyasar_gateway import MoyasarGateway
            return MoyasarGateway()
        elif provider == PaymentProvider.HYPERPAY:
            from .hyperpay_gateway import HyperpayGateway
            return HyperpayGateway()
        else:
            raise ValueError(f"Unsupported payment provider: {provider}")

# Configuration
PAYMENT_CONFIG = {
    "moyasar": {
        "api_key": "pk_live_fp5R9CDvB9pi8KKfkW8uw5fyibJzY1o6swAmsKRr",
        "secret_key": "sk_live_placeholder",  # Add your secret key here
        "base_url": "https://api.moyasar.com/v1",
        "webhook_secret": "moyasar_webhook_secret_shaheenpulse_2026"
    },
    "hyperpay": {
        "entity_id": "8ac9a7ca7e1b4c0d017e1b5e5a1c017e",
        "access_token": "OGFjOWE3Y2E3ZTFiNGMwZDAxN2UxYjVlNWEwYzAxN2UxYjVlNWEwYzAxN2UxYjVl",
        "base_url": "https://test.oppwa.com/v1",
        "webhook_secret": "hyperpay_webhook_secret"
    }
}

# Tier pricing
TIER_PRICING = {
    "discovery": {
        "amount": 4900.00,  # SAR 4,900
        "currency": "SAR",
        "description": "Discovery Tier - Advanced AI Analytics"
    },
    "professional": {
        "amount": 12500.00,  # SAR 12,500
        "currency": "SAR",
        "description": "Professional Tier - Enterprise AI Solutions"
    }
}
