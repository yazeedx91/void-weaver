"""
HyperPay Payment Gateway Implementation
Modular design for future integration
"""

import httpx
import hashlib
import hmac
import json
import time
from typing import Dict, Any, Optional
from . import PaymentGateway, PaymentRequest, PaymentResponse, PaymentStatus, PaymentProvider
import logging

logger = logging.getLogger(__name__)

class HyperpayGateway(PaymentGateway):
    """HyperPay payment gateway implementation"""
    
    def __init__(self):
        self.config = PAYMENT_CONFIG["hyperpay"]
        self.entity_id = self.config["entity_id"]
        self.access_token = self.config["access_token"]
        self.base_url = self.config["base_url"]
        self.webhook_secret = self.config["webhook_secret"]
    
    async def create_payment_session(self, request: PaymentRequest) -> PaymentResponse:
        """Create a HyperPay payment session"""
        try:
            # Prepare HyperPay payment request
            payload = {
                "entityId": self.entity_id,
                "amount": str(request.amount),
                "currency": request.currency,
                "paymentType": "DB",
                "merchantTransactionId": f"txn_{request.tier}_{int(time.time())}",
                "customer.email": request.customer_email,
                "customer.name": request.customer_name,
                "notificationUrl": request.webhook_url,
                "returnUrl": request.callback_url,
                "customParameters": {
                    "tier": request.tier,
                    "description": request.description
                }
            }
            
            # Make API request
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/checkouts",
                    data=payload,
                    headers={
                        "Authorization": f"Bearer {self.access_token}"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return PaymentResponse(
                        success=True,
                        payment_id=data.get("id"),
                        checkout_url=data.get("redirectUrl"),
                        status=PaymentStatus.PENDING,
                        metadata=data
                    )
                else:
                    error_data = response.json()
                    return PaymentResponse(
                        success=False,
                        error=error_data.get("result", {}).get("description", "Unknown error")
                    )
                    
        except Exception as e:
            logger.error(f"Error creating HyperPay payment session: {str(e)}")
            return PaymentResponse(
                success=False,
                error=f"Payment gateway error: {str(e)}"
            )
    
    async def verify_payment(self, payment_id: str) -> PaymentResponse:
        """Verify HyperPay payment status"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/payments/{payment_id}",
                    headers={
                        "Authorization": f"Bearer {self.access_token}"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    status = self._map_hyperpay_status(data.get("result", {}).get("code"))
                    
                    return PaymentResponse(
                        success=True,
                        payment_id=data.get("id"),
                        status=status,
                        metadata=data
                    )
                else:
                    return PaymentResponse(
                        success=False,
                        error="Payment verification failed"
                    )
                    
        except Exception as e:
            logger.error(f"Error verifying HyperPay payment: {str(e)}")
            return PaymentResponse(
                success=False,
                error=f"Payment verification error: {str(e)}"
            )
    
    async def verify_webhook(self, payload: Dict[str, Any], signature: str) -> bool:
        """Verify HyperPay webhook signature"""
        try:
            # HyperPay uses different signature method
            # Implementation would depend on HyperPay's webhook signature format
            expected_signature = hashlib.sha256(
                json.dumps(payload, separators=(',', ':')).encode() + self.webhook_secret.encode()
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, signature)
            
        except Exception as e:
            logger.error(f"Error verifying HyperPay webhook: {str(e)}")
            return False
    
    def get_provider_name(self) -> PaymentProvider:
        """Get provider name"""
        return PaymentProvider.HYPERPAY
    
    def _map_hyperpay_status(self, hyperpay_code: str) -> PaymentStatus:
        """Map HyperPay status code to PaymentStatus enum"""
        status_mapping = {
            "000.100.110": PaymentStatus.SUCCESS,  # Successfully authorized
            "000.100.111": PaymentStatus.SUCCESS,  # Successfully authorized
            "000.200.100": PaymentStatus.SUCCESS,  # Successfully captured
            "000.300.000": PaymentStatus.FAILED,   # Transaction declined
            "000.300.100": PaymentStatus.FAILED,   # Transaction declined
            "000.300.110": PaymentStatus.FAILED,   # Transaction declined
            "000.400.000": PaymentStatus.FAILED,   # Validation error
            "000.400.100": PaymentStatus.FAILED,   # Validation error
            "000.400.200": PaymentStatus.FAILED,   # Validation error
            "800.400.100": PaymentStatus.FAILED,   # Invalid request
        }
        return status_mapping.get(hyperpay_code, PaymentStatus.PENDING)
    
    def get_supported_card_types(self) -> Dict[str, Any]:
        """Get supported card types"""
        return {
            "mada": {
                "name": "Mada",
                "priority": 1,
                "logo": "/static/images/mada-logo.png",
                "supported": True,
                "saudi_priority": True
            },
            "visa": {
                "name": "Visa",
                "priority": 2,
                "logo": "/static/images/visa-logo.png",
                "supported": True,
                "saudi_priority": False
            },
            "mastercard": {
                "name": "Mastercard",
                "priority": 3,
                "logo": "/static/images/mastercard-logo.png",
                "supported": True,
                "saudi_priority": False
            }
        }
