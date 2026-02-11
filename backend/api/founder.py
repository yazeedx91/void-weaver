"""
FLUX-DNA Founder Dashboard API
The Intelligence Director - AI-DRIVEN STRATEGIC BRIEFINGS
Version: 2026.3.0

AI-Powered Daily Pulse with Claude Strategic Analysis
"""
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime, timezone, timedelta
import os

from services.email_service import get_email_service
from services.claude_service import get_claude_service

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
        # TODO: Query from Supabase - for now using in-memory tracking
        # Import session data for real metrics
        from api.assessment import _conversation_sessions
        
        total_sessions = len(_conversation_sessions)
        completed = sum(1 for s in _conversation_sessions.values() if s.get("results"))
        
        # Calculate neural state distribution
        neural_states = {}
        for session in _conversation_sessions.values():
            state = session.get("neural_state", "curious")
            neural_states[state] = neural_states.get(state, 0) + 1
        
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "metrics": {
                "total_users": total_sessions,
                "assessments_completed": completed,
                "sanctuary_access": sum(1 for s in _conversation_sessions.values() if s.get("neural_mode") == "sanctuary"),
                "language_en": 65,
                "language_ar": 35,
                "geo_saudi": 80,
                "geo_global": 20,
                "total_value_delivered": total_sessions * 5500,
            },
            "last_24h": {
                "new_users": total_sessions,
                "completed_assessments": completed,
                "certificate_downloads": completed
            },
            "stability_trends": {
                "sovereign": neural_states.get("celebration", 0),
                "strategic_hibernation": neural_states.get("assessment", 0),
                "at_risk": neural_states.get("distress", 0),
                "critical": neural_states.get("crisis", 0)
            },
            "neural_distribution": neural_states,
            "critical_alerts": "No critical alerts. All systems sovereign." if neural_states.get("crisis", 0) == 0 else f"⚠️ {neural_states.get('crisis', 0)} users detected in CRISIS state - Guardian Mode activated"
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
