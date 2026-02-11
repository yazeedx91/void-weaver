"""
FLUX-DNA Certificate API
The Artefact Delivery System
Version: 2026.1.0

Endpoints for generating and downloading sovereign certificates
with Redis Time-Gate integration for self-destructing links
"""
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime, timezone
import uuid
import hashlib

from services.certificate_engine import get_certificate_engine
from services.time_gate import get_time_gate_service

router = APIRouter(prefix="/api/certificate", tags=["Certificate"])


class GenerateCertificateRequest(BaseModel):
    """Request to generate a new certificate"""
    session_id: str
    user_id: str
    sovereign_title: str
    stability: str = "Sovereign"
    superpower: str = "You operate across an expanded dynamic range, with heightened perception and profound depth of experience."
    scores: Optional[Dict[str, int]] = None
    sar_value: int = 5500


class CertificateLinkResponse(BaseModel):
    """Response with time-gated download link"""
    download_token: str
    download_url: str
    expires_at: str
    max_clicks: int
    message: str


# In-memory certificate data cache (for time-gated retrieval)
# In production, use Redis to store encrypted certificate data
_certificate_cache: Dict[str, dict] = {}


@router.post("/generate", response_model=CertificateLinkResponse)
async def generate_certificate(request: GenerateCertificateRequest):
    """
    Generate a Sovereign Certificate and return a time-gated download link
    
    The certificate is generated in-memory and cached for retrieval.
    The download link self-destructs after 24 hours or 3 clicks.
    """
    try:
        # Generate unique download token
        download_token = str(uuid.uuid4())
        
        # Store certificate data in cache for later retrieval
        _certificate_cache[download_token] = {
            "session_id": request.session_id,
            "user_id": request.user_id,
            "sovereign_title": request.sovereign_title,
            "stability": request.stability,
            "superpower": request.superpower,
            "scores": request.scores,
            "sar_value": request.sar_value,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Create time-gated link in Redis
        time_gate = get_time_gate_service()
        link_data = time_gate.create_time_gate_link(
            user_id=request.user_id,
            session_id=request.session_id,
            max_clicks=3,
            expiry_hours=24,
            link_type="certificate"
        )
        
        # Store the mapping between time-gate token and certificate token
        _certificate_cache[link_data["link_token"]] = _certificate_cache[download_token]
        
        return CertificateLinkResponse(
            download_token=link_data["link_token"],
            download_url=f"/api/certificate/download/{link_data['link_token']}",
            expires_at=link_data["expires_at"],
            max_clicks=link_data["max_clicks"],
            message="Certificate ready for download. Link self-destructs after 24 hours or 3 accesses."
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate certificate: {str(e)}")


@router.get("/download/{token}")
async def download_certificate(token: str):
    """
    Download the Sovereign Certificate PDF
    
    This endpoint validates the time-gate and streams the PDF directly.
    The PDF is generated in-memory - it never touches the disk.
    """
    try:
        # Validate time-gate
        time_gate = get_time_gate_service()
        validation = time_gate.validate_and_increment(token)
        
        if not validation["valid"]:
            raise HTTPException(
                status_code=410,  # Gone
                detail={
                    "error": "time_gate_closed",
                    "reason": validation["reason"],
                    "message": validation["message"]
                }
            )
        
        # Get certificate data from cache
        cert_data = _certificate_cache.get(token)
        
        if not cert_data:
            # If not in cache, generate with default data
            cert_data = {
                "session_id": token,
                "user_id": "anonymous",
                "sovereign_title": "The Strategic Phoenix",
                "stability": "Sovereign",
                "superpower": "You operate across an expanded dynamic range, with heightened perception and profound depth of experience.",
                "scores": None,
                "sar_value": 5500
            }
        
        # Generate certificate PDF in-memory
        engine = get_certificate_engine()
        pdf_buffer = engine.generate_certificate(
            session_id=cert_data["session_id"],
            user_id=cert_data["user_id"],
            sovereign_title=cert_data["sovereign_title"],
            stability=cert_data["stability"],
            superpower=cert_data["superpower"],
            scores=cert_data.get("scores"),
            sar_value=cert_data["sar_value"]
        )
        
        # Generate filename
        safe_title = cert_data["sovereign_title"].replace(" ", "_").lower()
        filename = f"FLUX-DNA_Sovereign_Certificate_{safe_title}.pdf"
        
        # Return streaming response (in-memory, no disk write)
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "X-Time-Gate-Clicks-Remaining": str(validation["clicks_remaining"]),
                "X-Time-Gate-Expires": validation["expires_at"],
                "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download certificate: {str(e)}")


@router.get("/status/{token}")
async def get_certificate_status(token: str):
    """
    Check the status of a certificate download link
    Does NOT increment the click counter
    """
    try:
        time_gate = get_time_gate_service()
        status = time_gate.get_link_status(token)
        
        if not status:
            return {
                "valid": False,
                "reason": "expired",
                "message": "This certificate link has expired or does not exist."
            }
        
        return {
            "valid": status["is_active"],
            "clicks_remaining": status["max_clicks"] - status["current_clicks"],
            "time_remaining_hours": status["ttl_hours"],
            "expires_at": status["expires_at"],
            "message": "Certificate ready for download" if status["is_active"] else "Link has expired"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get certificate status: {str(e)}")


@router.post("/preview")
async def preview_certificate(request: GenerateCertificateRequest):
    """
    Generate a preview/test certificate (returns PDF directly)
    This endpoint is for testing only and does not create time-gated links
    """
    try:
        engine = get_certificate_engine()
        pdf_buffer = engine.generate_certificate(
            session_id=request.session_id,
            user_id=request.user_id,
            sovereign_title=request.sovereign_title,
            stability=request.stability,
            superpower=request.superpower,
            scores=request.scores,
            sar_value=request.sar_value
        )
        
        safe_title = request.sovereign_title.replace(" ", "_").lower()
        filename = f"FLUX-DNA_Preview_{safe_title}.pdf"
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Cache-Control": "no-store"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate preview: {str(e)}")
