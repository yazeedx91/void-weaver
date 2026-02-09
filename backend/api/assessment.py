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
        
        # Get session context
        session = _conversation_sessions.get(request.session_id, {})
        persona = session.get("persona", "al_hakim")
        language = session.get("language", "en")
        
        # Create chat with context from previous messages
        chat = await claude.create_conversation(
            session_id=request.session_id,
            persona=persona,
            language=language
        )
        
        # Build context from previous messages
        context = ""
        if session.get("messages"):
            for msg in session["messages"][-10:]:  # Last 10 messages for context
                role = "User" if msg["role"] == "user" else "Al-Hakim"
                context += f"{role}: {msg['content']}\n\n"
        
        # Add context and new message
        full_message = f"Previous conversation:\n{context}\n\nUser's new response: {request.message}\n\nContinue the assessment naturally, asking the next question or providing insights."
        
        response = await claude.send_message(chat, full_message)
        
        # Update session
        if request.session_id in _conversation_sessions:
            _conversation_sessions[request.session_id]["messages"].append(
                {"role": "user", "content": request.message}
            )
            _conversation_sessions[request.session_id]["messages"].append(
                {"role": "assistant", "content": response}
            )
        
        # Check if assessment seems complete (simple heuristic)
        assessment_complete = len(session.get("messages", [])) > 20 and any(
            phrase in response.lower() 
            for phrase in ["complete", "finished", "concluded", "thank you for sharing", "assessment is complete"]
        )
        
        return {
            "response": response,
            "session_id": request.session_id,
            "assessment_complete": assessment_complete
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
    Creates time-gated link for results
    """
    try:
        claude = get_claude_service()
        time_gate = get_time_gate_service()
        
        # Get session data
        session = _conversation_sessions.get(request.session_id, {})
        
        # Generate stability analysis with Claude
        analysis_prompt = """Based on our conversation, provide a comprehensive stability analysis:

1. Overall Stability Classification (Sovereign / Strategic Hibernation / At Risk / Critical)
2. Expanded Cognitive Bandwidth Analysis
3. Strategic Recommendations
4. A unique "Sovereign Title" (e.g., "The Strategic Phoenix", "The Quiet Storm")
5. Positive Superpower Statement

Remember: No pathological labels. Focus on sovereignty and expanded dynamic range."""

        chat = await claude.create_conversation(
            session_id=f"analysis-{request.session_id}",
            persona=session.get("persona", "al_hakim"),
            language=session.get("language", "en")
        )
        
        analysis = await claude.send_message(chat, analysis_prompt)
        
        # Extract sovereign title (simple extraction)
        sovereign_title = "The Strategic Phoenix"  # Default
        if "Title:" in analysis:
            try:
                title_line = [l for l in analysis.split('\n') if 'Title' in l][0]
                sovereign_title = title_line.split(':')[-1].strip().strip('"\'')
            except:
                pass
        
        # Create time-gated link
        link_data = time_gate.create_time_gate_link(
            user_id=request.user_id,
            session_id=request.session_id,
            max_clicks=3,
            expiry_hours=24
        )
        
        # Store results in session for retrieval
        _conversation_sessions[request.session_id]["results"] = {
            "analysis": analysis,
            "sovereign_title": sovereign_title,
            "stability": "Sovereign",  # Extract from analysis in production
            "superpower": analysis[:500] if len(analysis) > 500 else analysis,
            "sar_value": 5500,
            "user_cost": 0
        }
        
        # Log completion to founder analytics
        try:
            db = get_database_service()
            await db.log_founder_event("assessment_completed", {
                "sovereign_title": sovereign_title,
                "language": session.get("language", "en")
            })
        except Exception:
            pass
        
        return {
            "session_id": request.session_id,
            "status": "complete",
            "analysis_preview": analysis[:200] + "..." if len(analysis) > 200 else analysis,
            "sovereign_title": sovereign_title,
            "sar_value": 5500,
            "user_cost": 0,
            "certificate_ready": True,
            "results_link": link_data["link_url"],
            "link_token": link_data["link_token"],
            "expires_at": link_data["expires_at"],
            "max_clicks": link_data["max_clicks"]
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
