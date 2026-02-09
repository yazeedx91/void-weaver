"""
FLUX-DNA Health Check API
The Sentinel's Heartbeat
"""
from fastapi import APIRouter
from datetime import datetime
import os

router = APIRouter()


@router.get("/")
@router.get("/health")
async def health_check():
    """
    The Sentinel Handshake
    Returns system status for deployment verification
    """
    return {
        "status": "FORTRESS_ACTIVE",
        "mission": "SOVEREIGN_LIBERATION",
        "version": "2026.1.0",
        "timestamp": datetime.utcnow().isoformat(),
        "phoenix": "ASCENDED",
        "guardian": "WATCHING",
        "people": "FREE",
        "environment": os.environ.get('NODE_ENV', 'development'),
        "encryption": "AES-256-GCM",
        "ai_core": "Claude-4-Sonnet"
    }


@router.get("/api/health")
async def api_health_check():
    """API-specific health check"""
    return await health_check()
