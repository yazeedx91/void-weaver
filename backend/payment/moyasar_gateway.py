"""
Moyasar Payment Gateway Implementation
Sandbox integration with Mada card support
"""

import httpx
import hashlib
import hmac
import json
from typing import Dict, Any, Optional
from . import PaymentGateway, PaymentRequest, PaymentResponse, PaymentStatus, PaymentProvider
import logging

logger = logging.getLogger(__name__)

class MoyasarGateway(PaymentGateway):
    """Moyasar payment gateway implementation"""
    
    def __init__(self):
        self.config = PAYMENT_CONFIG["moyasar"]
        self.api_key = self.config["api_key"]
        self.secret_key = self.config["secret_key"]
        self.base_url = self.config["base_url"]
        self.webhook_secret = self.config["webhook_secret"]
    
    async def create_payment_session(self, request: PaymentRequest) -> PaymentResponse:
        """Create a Moyasar payment session"""
        try:
            # Prepare Moyasar payment request
            payload = {
                "amount": int(request.amount * 100),  # Convert to halala (cents)
                "currency": request.currency,
                "description": request.description,
                "callback_url": request.callback_url,
                "webhook_url": request.webhook_url,
                "metadata": {
                    "tier": request.tier,
                    "customer_email": request.customer_email,
                    "customer_name": request.customer_name
                },
                "source": {
                    "type": "creditcard",
                    "company": "mada" if self._is_mada_card(request.customer_email) else "default"
                }
            }
            
            # Make API request
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/invoices",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code == 201:
                    data = response.json()
                    return PaymentResponse(
                        success=True,
                        payment_id=data.get("id"),
                        checkout_url=data.get("url"),
                        status=PaymentStatus.PENDING,
                        metadata=data
                    )
                else:
                    error_data = response.json()
                    return PaymentResponse(
                        success=False,
                        error=error_data.get("message", "Unknown error")
                    )
                    
        except Exception as e:
            logger.error(f"Error creating Moyasar payment session: {str(e)}")
            return PaymentResponse(
                success=False,
                error=f"Payment gateway error: {str(e)}"
            )
    
    async def verify_payment(self, payment_id: str) -> PaymentResponse:
        """Verify Moyasar payment status"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/invoices/{payment_id}",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    status = self._map_moyasar_status(data.get("status"))
                    
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
            logger.error(f"Error verifying Moyasar payment: {str(e)}")
            return PaymentResponse(
                success=False,
                error=f"Payment verification error: {str(e)}"
            )
    
    async def verify_webhook(self, payload: Dict[str, Any], signature: str) -> bool:
        """Verify Moyasar webhook signature"""
        try:
            # Moyasar uses HMAC-SHA256 for webhook signatures
            expected_signature = hmac.new(
                self.webhook_secret.encode(),
                json.dumps(payload, separators=(',', ':')).encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, signature)
            
        except Exception as e:
            logger.error(f"Error verifying Moyasar webhook: {str(e)}")
            return False
    
    def get_provider_name(self) -> PaymentProvider:
        """Get provider name"""
        return PaymentProvider.MOYASAR
    
    def _is_mada_card(self, customer_email: str) -> bool:
        """
        Detect if customer is likely to use Mada card
        Based on Saudi domain detection
        """
        saudi_domains = ['.sa', '.com.sa', '.org.sa', '.net.sa']
        return any(domain in customer_email.lower() for domain in saudi_domains)
    
    def _map_moyasar_status(self, moyasar_status: str) -> PaymentStatus:
        """Map Moyasar status to PaymentStatus enum"""
        status_mapping = {
            "paid": PaymentStatus.SUCCESS,
            "pending": PaymentStatus.PENDING,
            "failed": PaymentStatus.FAILED,
            "canceled": PaymentStatus.CANCELLED
        }
        return status_mapping.get(moyasar_status, PaymentStatus.PENDING)
    
    def get_supported_card_types(self) -> Dict[str, Any]:
        """Get supported card types with Mada priority"""
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
            },
            "amex": {
                "name": "American Express",
                "priority": 4,
                "logo": "/static/images/amex-logo.png",
                "supported": True,
                "saudi_priority": False
            }
        }
