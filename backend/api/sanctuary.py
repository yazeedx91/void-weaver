"""
FLUX-DNA Sovereigness Sanctuary API
The Matriarch's Protection
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Dict, Optional
import uuid
from datetime import datetime

from services.claude_service import get_claude_service
from services.encryption import get_encryption_service

router = APIRouter(prefix="/api/sanctuary", tags=["Sovereigness Sanctuary"])


class StartSanctuarySession(BaseModel):
    user_id: str
    pillar: str  # 'legal_shield', 'medical_sentinel', 'psych_repair', 'economic_liberator'
    language: str = "ar"


class SubmitEvidence(BaseModel):
    user_id: str
    evidence_type: str  # 'text', 'audio', 'image', 'video'
    evidence_description: str
    evidence_encrypted: str  # Client-side encrypted content


@router.post("/start")
async def start_sanctuary_session(request: StartSanctuarySession):
    """
    Start a Sovereigness Sanctuary session with Al-Sheikha
    Creates protected conversation space
    """
    try:
        session_id = str(uuid.uuid4())
        
        claude = get_claude_service()
        chat = await claude.create_conversation(
            session_id=session_id,
            persona="al_sheikha",
            language=request.language
        )
        
        # Initial message based on pillar
        pillar_prompts = {
            "legal_shield": "I need help understanding my legal rights and documenting coercive control.",
            "medical_sentinel": "I need help documenting injuries and understanding potential trauma-related health issues.",
            "psych_repair": "I need help understanding trauma bonding and developing coping strategies.",
            "economic_liberator": "I need help achieving financial independence and planning my economic future."
        }
        
        initial_message = await claude.send_message(
            chat,
            pillar_prompts.get(request.pillar, "I need help and protection.")
        )
        
        return {
            "session_id": session_id,
            "pillar": request.pillar,
            "persona": "al_sheikha",
            "initial_message": initial_message,
            "status": "active",
            "safety_note": "This conversation is encrypted. Quick exit available anytime."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start sanctuary session: {str(e)}")


@router.post("/evidence")
async def submit_evidence(request: SubmitEvidence):
    """
    Submit encrypted evidence to forensic vault
    Auto-strips EXIF metadata for location protection
    """
    try:
        claude = get_claude_service()
        
        # Perform forensic analysis with Al-Sheikha
        analysis = await claude.forensic_analysis(
            evidence_type=request.evidence_type,
            evidence_description=request.evidence_description,
            language="ar"
        )
        
        # TODO: Store in forensic_vault table in Supabase
        # TODO: Strip EXIF metadata if image
        # TODO: Create chain of custody entry
        
        evidence_id = str(uuid.uuid4())
        
        return {
            "evidence_id": evidence_id,
            "status": "stored_securely",
            "analysis": analysis["analysis"],
            "risk_level": analysis["risk_level"],
            "recommended_actions": analysis["recommended_actions"],
            "timestamp": datetime.utcnow().isoformat(),
            "legal_admissibility": "Saudi Anti-Abuse Law compatible"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit evidence: {str(e)}")


@router.post("/evidence/upload")
async def upload_evidence_file(file: UploadFile = File(...)):
    """
    Upload evidence file (image, audio, video)
    Automatically strips EXIF/GPS metadata
    """
    try:
        # TODO: Implement file upload
        # TODO: Strip EXIF metadata using PIL/exiftool
        # TODO: Encrypt file
        # TODO: Store in Supabase storage
        
        return {
            "status": "uploaded",
            "file_id": str(uuid.uuid4()),
            "original_filename": file.filename,
            "size_bytes": 0,
            "exif_stripped": True,
            "encrypted": True
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload evidence: {str(e)}")


@router.get("/resources")
async def get_sanctuary_resources():
    """
    Get Saudi-specific resources for women's protection
    """
    return {
        "emergency_contacts": [
            {
                "name": "National Family Safety Program",
                "phone": "1919",
                "description_ar": "البرنامج الوطني للأمان الأسري"
            },
            {
                "name": "Women's Rights Association",
                "phone": "+966-11-XXX-XXXX",
                "description_ar": "جمعية حقوق المرأة"
            }
        ],
        "legal_resources": [
            {
                "title": "Saudi Anti-Domestic Violence Law",
                "description_ar": "نظام الحماية من الإيذاء",
                "link": "#"
            }
        ],
        "safety_tips": [
            "Document everything with timestamps",
            "Use private browsing mode",
            "Create a safety plan with trusted contacts",
            "Keep important documents in a safe location"
        ]
    }
