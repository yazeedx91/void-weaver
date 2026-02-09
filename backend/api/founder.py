"""
FLUX-DNA Founder Dashboard API
The Intelligence Director
"""
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import os

from services.email_service import get_email_service

router = APIRouter(prefix="/api/founder", tags=["Founder Dashboard"])


def verify_founder_password(authorization: str = Header(None)):
    """
    Verify founder dashboard password
    """
    expected_password = os.environ.get('FOUNDER_DASHBOARD_PASSWORD', 'PhoenixSovereign2026!')
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")
    
    # Simple Bearer token authentication
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    password = authorization.replace("Bearer ", "")
    if password != expected_password:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    return True


@router.get("/metrics")
async def get_founder_metrics(authorized: bool = Depends(verify_founder_password)):
    """
    Get real-time founder dashboard metrics
    Aggregated, anonymized data only
    """
    try:
        # TODO: Query from Supabase
        # For now, return mock data structure
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "metrics": {
                "total_users": 0,  # TODO: Count from users table
                "assessments_completed": 0,  # TODO: Count completed sessions
                "sanctuary_access": 0,  # TODO: Count Sovereigness Sanctuary accesses
                "language_en": 50,
                "language_ar": 50,
                "geo_saudi": 80,
                "geo_global": 20,
                "total_value_delivered": 0,  # total_users * 5500
            },
            "last_24h": {
                "new_users": 0,
                "completed_assessments": 0,
                "certificate_downloads": 0
            },
            "stability_trends": {
                "sovereign": 0,
                "strategic_hibernation": 0,
                "at_risk": 0,
                "critical": 0
            },
            "critical_alerts": "No critical alerts. All systems sovereign."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch metrics: {str(e)}")


@router.post("/send-pulse")
async def send_daily_pulse(authorized: bool = Depends(verify_founder_password)):
    """
    Manually trigger daily pulse email
    (Normally scheduled for 9:00 AM AST automatically)
    """
    try:
        email_service = get_email_service()
        
        # Get current metrics
        metrics = {
            "total_users": 0,
            "assessments_completed": 0,
            "sanctuary_access": 0,
            "language_en": 50,
            "language_ar": 50,
            "geo_saudi": 80,
            "geo_global": 20,
            "critical_alerts": "No critical alerts. All systems sovereign."
        }
        
        today = datetime.utcnow().strftime("%Y-%m-%d")
        
        result = await email_service.send_founder_daily_pulse(today, metrics)
        
        return {
            "status": "sent" if result["success"] else "failed",
            "email_id": result.get("email_id"),
            "error": result.get("error")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send pulse: {str(e)}")


@router.get("/analytics/timeline")
async def get_analytics_timeline(
    days: int = 7,
    authorized: bool = Depends(verify_founder_password)
):
    """
    Get analytics timeline for last N days
    """
    try:
        # TODO: Query founder_analytics table from Supabase
        timeline = []
        
        for i in range(days):
            date = datetime.utcnow() - timedelta(days=i)
            timeline.append({
                "date": date.strftime("%Y-%m-%d"),
                "users": 0,
                "assessments": 0,
                "sanctuary_access": 0
            })
        
        return {
            "timeline": timeline,
            "total_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch timeline: {str(e)}")
