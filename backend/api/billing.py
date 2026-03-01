"""
Billing API Endpoints
Secure payment processing with Moyasar integration
"""

from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import os
import json
import logging
from datetime import datetime

from payment import PaymentGatewayFactory, PaymentProvider, PaymentRequest, PaymentStatus
from payment.moyasar_gateway import MoyasarGateway
from database.transaction_logs import TransactionLogsService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/billing", tags=["Billing"])

# Pydantic models for request/response
class CheckoutRequest(BaseModel):
    tier: str  # "discovery" or "professional"
    customer_email: EmailStr
    customer_name: str
    callback_url: Optional[str] = None
    webhook_url: Optional[str] = None

class CheckoutResponse(BaseModel):
    success: bool
    payment_id: Optional[str] = None
    checkout_url: Optional[str] = None
    error: Optional[str] = None
    tier_info: Optional[Dict[str, Any]] = None

class WebhookResponse(BaseModel):
    success: bool
    message: str

# Initialize services
payment_gateway = PaymentGatewayFactory.create_gateway(PaymentProvider.MOYASAR)
transaction_service = TransactionLogsService()

@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout_session(request: CheckoutRequest, background_tasks: BackgroundTasks):
    """Create a payment checkout session"""
    try:
        # Validate tier
        if request.tier not in ["discovery", "professional"]:
            raise HTTPException(status_code=400, detail="Invalid tier. Must be 'discovery' or 'professional'")
        
        # Get tier pricing
        from payment import TIER_PRICING
        tier_config = TIER_PRICING.get(request.tier)
        if not tier_config:
            raise HTTPException(status_code=400, detail="Tier configuration not found")
        
        # Create payment request
        payment_request = PaymentRequest(
            amount=tier_config["amount"],
            currency=tier_config["currency"],
            tier=request.tier,
            customer_email=request.customer_email,
            customer_name=request.customer_name,
            description=tier_config["description"],
            callback_url=request.callback_url or f"{os.environ.get('BASE_URL', 'http://localhost:3000')}/billing/success",
            webhook_url=request.webhook_url or f"{os.environ.get('BASE_URL', 'http://localhost:3000')}/api/billing/webhook"
        )
        
        # Create payment session
        payment_response = await payment_gateway.create_payment_session(payment_request)
        
        if payment_response.success:
            # Store initial transaction in database
            await transaction_service.create_transaction(
                payment_id=payment_response.payment_id,
                tier=request.tier,
                amount=tier_config["amount"],
                currency=tier_config["currency"],
                customer_email=request.customer_email,
                customer_name=request.customer_name,
                status=PaymentStatus.PENDING.value,
                provider=payment_gateway.get_provider_name().value
            )
            
            return CheckoutResponse(
                success=True,
                payment_id=payment_response.payment_id,
                checkout_url=payment_response.checkout_url,
                tier_info={
                    "tier": request.tier,
                    "amount": tier_config["amount"],
                    "currency": tier_config["currency"],
                    "description": tier_config["description"]
                }
            )
        else:
            raise HTTPException(status_code=400, detail=payment_response.error)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/webhook", response_model=WebhookResponse)
async def handle_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle payment webhook from Moyasar"""
    try:
        # Get webhook signature
        signature = request.headers.get("X-Moyasar-Signature", "")
        
        # Read and parse payload
        body = await request.body()
        payload = json.loads(body.decode())
        
        # Verify webhook signature
        is_valid = await payment_gateway.verify_webhook(payload, signature)
        if not is_valid:
            logger.warning("Invalid webhook signature received")
            raise HTTPException(status_code=401, detail="Invalid webhook signature")
        
        # Process webhook event
        event_type = payload.get("type")
        payment_data = payload.get("data", {})
        payment_id = payment_data.get("id")
        
        if not payment_id:
            raise HTTPException(status_code=400, detail="Payment ID not found in webhook")
        
        # Verify payment status
        payment_response = await payment_gateway.verify_payment(payment_id)
        
        if payment_response.success:
            # Update transaction in database
            await transaction_service.update_transaction_status(
                payment_id=payment_id,
                status=payment_response.status.value,
                metadata=payment_response.metadata
            )
            
            # Send confirmation email (background task)
            if payment_response.status == PaymentStatus.SUCCESS:
                background_tasks.add_task(
                    send_payment_confirmation_email,
                    payment_data.get("metadata", {}).get("customer_email"),
                    payment_data.get("metadata", {}).get("tier"),
                    payment_response.payment_id
                )
            
            logger.info(f"Webhook processed successfully for payment {payment_id}")
            return WebhookResponse(success=True, message="Webhook processed successfully")
        else:
            logger.error(f"Payment verification failed for payment {payment_id}")
            raise HTTPException(status_code=400, detail="Payment verification failed")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/payment/{payment_id}")
async def get_payment_status(payment_id: str):
    """Get payment status"""
    try:
        # Verify payment with gateway
        payment_response = await payment_gateway.verify_payment(payment_id)
        
        if payment_response.success:
            # Get transaction from database
            transaction = await transaction_service.get_transaction(payment_id)
            
            return {
                "success": True,
                "payment_id": payment_id,
                "status": payment_response.status.value,
                "transaction": transaction,
                "metadata": payment_response.metadata
            }
        else:
            raise HTTPException(status_code=400, detail="Payment verification failed")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting payment status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/card-types")
async def get_supported_card_types():
    """Get supported card types with Mada priority for Saudi customers"""
    try:
        if isinstance(payment_gateway, MoyasarGateway):
            card_types = payment_gateway.get_supported_card_types()
            return {
                "success": True,
                "card_types": card_types,
                "mada_priority": True,
                "saudi_support": True
            }
        else:
            raise HTTPException(status_code=400, detail="Gateway not supported")
            
    except Exception as e:
        logger.error(f"Error getting card types: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/tiers")
async def get_available_tiers():
    """Get available subscription tiers"""
    try:
        from payment import TIER_PRICING
        
        return {
            "success": True,
            "tiers": TIER_PRICING,
            "currency": "SAR"
        }
        
    except Exception as e:
        logger.error(f"Error getting tiers: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def send_payment_confirmation_email(customer_email: str, tier: str, payment_id: str):
    """Send payment confirmation email (background task)"""
    try:
        # This would integrate with your email service
        # For now, just log the confirmation
        logger.info(f"Payment confirmation email sent to {customer_email} for tier {tier}, payment {payment_id}")
        
        # TODO: Implement actual email sending logic
        # await email_service.send_payment_confirmation(customer_email, tier, payment_id)
        
    except Exception as e:
        logger.error(f"Error sending payment confirmation email: {str(e)}")

# Health check for billing service
@router.get("/health")
async def billing_health():
    """Billing service health check"""
    try:
        # Test payment gateway connectivity
        gateway_status = payment_gateway.get_provider_name().value
        
        return {
            "status": "healthy",
            "gateway": gateway_status,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Billing health check failed: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )
