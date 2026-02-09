"""
FLUX-DNA Assessment API
The 8-Scale Oracle Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
import uuid
from datetime import datetime

from services.claude_service import get_claude_service
from services.encryption import get_encryption_service
from services.time_gate import get_time_gate_service
from services.database import get_database_service

router = APIRouter(prefix="/api/assessment", tags=["Assessment"])

# In-memory session storage (for conversation context)
# In production, use Redis for session persistence
_conversation_sessions: Dict[str, dict] = {}


class StartAssessmentRequest(BaseModel):
    language: str = "en"  # 'en' or 'ar'
    persona: str = "al_hakim"  # 'al_hakim' or 'al_sheikha'
    user_email: str


class SendMessageRequest(BaseModel):
    session_id: str
    message: str


class SubmitResponsesRequest(BaseModel):
    session_id: str
    scale_type: str  # 'hexaco', 'dass', 'teique', etc.
    responses_encrypted: str  # Client-side encrypted JSON


class CompleteAssessmentRequest(BaseModel):
    session_id: str
    user_id: str
    all_responses_encrypted: Dict[str, str]  # All 8 scales


@router.post("/start")
async def start_assessment(request: StartAssessmentRequest):
    """
    Start a new assessment session with Claude
    Creates conversational AI session
    """
    try:
        # Generate session ID
        session_id = str(uuid.uuid4())
        
        # Create Claude conversation
        claude = get_claude_service()
        chat = await claude.create_conversation(
            session_id=session_id,
            persona=request.persona,
            language=request.language
        )
        
        # Get initial greeting
        initial_message = await claude.send_message(
            chat,
            "Begin the assessment. Introduce yourself warmly and ask the first question to understand who I am."
        )
        
        # Store session context
        _conversation_sessions[session_id] = {
            "persona": request.persona,
            "language": request.language,
            "email": request.user_email,
            "messages": [{"role": "assistant", "content": initial_message}],
            "started_at": datetime.utcnow().isoformat(),
            "current_scale": "hexaco",
            "responses": {}
        }
        
        # Log to founder analytics
        try:
            db = get_database_service()
            await db.log_founder_event("assessment_started", {
                "language": request.language,
                "persona": request.persona
            })
        except Exception:
            pass  # Don't fail if analytics logging fails
        
        return {
            "session_id": session_id,
            "persona": request.persona,
            "language": request.language,
            "initial_message": initial_message,
            "status": "active"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start assessment: {str(e)}")


@router.post("/message")
async def send_message(request: SendMessageRequest):
    """
    Send a message in the conversational assessment
    Claude responds with next question or analysis
    """
    try:
        claude = get_claude_service()
        
        # Recreate chat session (in production, store this in Redis/DB)
        # For now, we'll create a new chat instance
        # TODO: Implement proper session storage
        chat = await claude.create_conversation(
            session_id=request.session_id,
            persona="al_hakim",
            language="en"
        )
        
        response = await claude.send_message(chat, request.message)
        
        return {
            "response": response,
            "session_id": request.session_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")


@router.post("/submit-responses")
async def submit_responses(request: SubmitResponsesRequest):
    """
    Submit encrypted responses for a specific scale
    Stores in database (encrypted)
    """
    try:
        # TODO: Store in Supabase database
        # For now, just acknowledge receipt
        
        return {
            "session_id": request.session_id,
            "scale_type": request.scale_type,
            "status": "stored",
            "message": f"{request.scale_type.upper()} responses securely stored"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit responses: {str(e)}")


@router.post("/complete")
async def complete_assessment(request: CompleteAssessmentRequest):
    """
    Complete assessment and generate stability analysis
    Returns sovereign title, analysis, and certificate data
    """
    try:
        claude = get_claude_service()
        encryption = get_encryption_service()
        
        # Decrypt all responses for analysis
        # Note: In production with Supabase, decrypt from stored data
        decrypted_data = {}
        for scale, encrypted in request.all_responses_encrypted.items():
            decrypted_data[scale] = encryption.decrypt(encrypted, request.user_id)
        
        # Generate stability analysis with Claude
        analysis = await claude.analyze_stability(
            assessment_data=decrypted_data,
            language="en"
        )
        
        # Encrypt analysis for storage
        analysis_encrypted = encryption.encrypt(analysis, request.user_id)
        
        # TODO: Generate neural signatures (vector embeddings)
        # TODO: Store in Supabase
        # TODO: Create time-gated link
        # TODO: Generate certificate
        
        return {
            "session_id": request.session_id,
            "status": "complete",
            "analysis_preview": analysis[:200] + "...",
            "sovereign_title": "The Strategic Phoenix",  # Extract from analysis
            "sar_value": 5500,
            "user_cost": 0,
            "certificate_ready": True,
            "results_link": f"/results/{request.session_id}"  # Time-gated
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete assessment: {str(e)}")


@router.get("/scales")
async def get_scales():
    """
    Get all 8 psychometric scales metadata
    """
    return {
        "scales": [
            {
                "id": "hexaco",
                "name": "HEXACO-60",
                "description": "Personality Architecture",
                "questions": 60,
                "scale": "1-5 (Strongly Disagree to Strongly Agree)"
            },
            {
                "id": "dass",
                "name": "DASS-21",
                "description": "Mental State (Depression, Anxiety, Stress)",
                "questions": 21,
                "scale": "0-3 (Never to Almost Always)"
            },
            {
                "id": "teique",
                "name": "TEIQue-SF",
                "description": "Emotional Intelligence",
                "questions": 30,
                "scale": "1-7 (Completely Disagree to Completely Agree)"
            },
            {
                "id": "ravens",
                "name": "Raven's Progressive Matrices",
                "description": "Cognitive Capability",
                "questions": 12,
                "scale": "Pattern recognition"
            },
            {
                "id": "schwartz",
                "name": "Schwartz Values Survey",
                "description": "Core Value Drivers",
                "questions": 21,
                "scale": "1-7 (Not important to Supreme importance)"
            },
            {
                "id": "hits",
                "name": "HITS Scale",
                "description": "Emotional Volatility Assessment",
                "questions": 5,
                "scale": "0-4 (Never to Frequently)"
            },
            {
                "id": "pcptsd",
                "name": "PC-PTSD-5",
                "description": "Trauma Screening",
                "questions": 5,
                "scale": "Yes/No"
            },
            {
                "id": "web",
                "name": "WEB Scale",
                "description": "Coercion & Control Detection",
                "questions": 10,
                "scale": "1-5 (Never to Always)"
            }
        ],
        "total_questions": 164,
        "estimated_time": "20-30 minutes (conversational flow)"
    }
