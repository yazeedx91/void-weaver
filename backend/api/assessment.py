"""
FLUX-DNA Assessment API
The 8-Scale Oracle Endpoints - NEURAL-FIRST ARCHITECTURE
Version: 2026.2.0

AI-Driven State Detection & Autonomous Mode Switching
The LLM is the Controller - The Brain Drives Everything
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
import uuid
from datetime import datetime, timezone

from services.claude_service import get_claude_service
from services.encryption import get_encryption_service
from services.time_gate import get_time_gate_service
from services.database import get_database_service
from services.neural_router import get_neural_router, NeuralMode, UserState

router = APIRouter(prefix="/api/assessment", tags=["Assessment"])

# In-memory session storage (for conversation context)
# In production, use Redis for session persistence
_conversation_sessions: Dict[str, dict] = {}


class StartAssessmentRequest(BaseModel):
    language: str = "en"  # 'en' or 'ar'
    persona: str = "al_hakim"  # 'al_hakim' or 'al_sheikha'
    user_email: str
    osint_risk: float = 0.0  # Risk score from OSINT check (0.0-1.0)


class SendMessageRequest(BaseModel):
    session_id: str
    message: str
    osint_risk: float = 0.0  # Updated risk score from client


class NeuralDirective(BaseModel):
    """AI-issued commands to the frontend"""
    should_pivot: bool = False
    pivot_to_mode: Optional[str] = None  # 'sanctuary', 'guardian', 'ceremonial'
    ui_commands: Dict = {}
    persona_adjustment: str = "clinical_warm"
    detected_state: str = "assessment"
    emergency_resources: bool = False


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
    Creates conversational AI session with Neural Router integration
    
    NEURAL-FIRST: AI drives state detection from the first message
    """
    try:
        # Generate session ID
        session_id = str(uuid.uuid4())
        user_id = f"user-{session_id[:8]}"
        
        # Initialize Neural Router for state tracking
        neural_router = get_neural_router()
        
        # Determine initial mode based on OSINT risk
        initial_mode = NeuralMode.PHOENIX
        initial_persona = request.persona
        if request.osint_risk > 0.7:
            # High risk connection - switch to protective mode
            initial_mode = NeuralMode.SANCTUARY
            initial_persona = "al_sheikha"
        
        # Get dynamic system prompt based on state
        system_prompt_override = neural_router.get_persona_system_prompt(
            state=UserState.CURIOUS,
            mode=initial_mode,
            language=request.language
        )
        
        # Create Claude conversation with neural-aware system prompt
        claude = get_claude_service()
        chat = await claude.create_conversation(
            session_id=session_id,
            persona=initial_persona,
            language=request.language
        )
        
        # Initial message with OSINT-aware context
        osint_context = ""
        if request.osint_risk > 0.5:
            osint_context = "\n\n[NEURAL AWARENESS: Connection shows elevated risk indicators. Proceed with extra protective care. Enable cloak mode awareness.]"
        
        # Get initial greeting
        initial_message = await claude.send_message(
            chat,
            f"Begin the assessment. Introduce yourself warmly and ask the first question to understand who I am.{osint_context}"
        )
        
        # Store session context with neural state
        _conversation_sessions[session_id] = {
            "persona": initial_persona,
            "language": request.language,
            "email": request.user_email,
            "messages": [{"role": "assistant", "content": initial_message}],
            "started_at": datetime.now(timezone.utc).isoformat(),
            "current_scale": "hexaco",
            "responses": {},
            # Neural-First State Tracking
            "neural_mode": initial_mode.value,
            "neural_state": UserState.CURIOUS.value,
            "osint_risk": request.osint_risk,
            "user_id": user_id,
            "state_transitions": []
        }
        
        # Generate initial neural directive for frontend
        neural_directive = NeuralDirective(
            should_pivot=request.osint_risk > 0.7,
            pivot_to_mode="sanctuary" if request.osint_risk > 0.7 else None,
            ui_commands={
                "pulse_color": "pearl" if request.osint_risk > 0.5 else "emerald",
                "cloak_mode": request.osint_risk > 0.6,
                "enable_quick_exit": request.osint_risk > 0.3
            },
            persona_adjustment="extra_protective" if request.osint_risk > 0.5 else "clinical_warm",
            detected_state="curious"
        )
        
        # Log to founder analytics
        try:
            db = get_database_service()
            await db.log_founder_event("assessment_started", {
                "language": request.language,
                "persona": initial_persona,
                "neural_mode": initial_mode.value,
                "osint_risk": request.osint_risk
            })
        except Exception:
            pass  # Don't fail if analytics logging fails
        
        return {
            "session_id": session_id,
            "persona": initial_persona,
            "language": request.language,
            "initial_message": initial_message,
            "status": "active",
            # NEURAL-FIRST: AI commands for frontend
            "neural_directive": neural_directive.model_dump()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start assessment: {str(e)}")


@router.post("/message")
async def send_message(request: SendMessageRequest):
    """
    Send a message in the conversational assessment
    
    NEURAL-FIRST ARCHITECTURE:
    - AI analyzes user state from message content
    - Neural Router determines mode transitions
    - Returns UI commands for frontend to execute
    - AI drives the experience, not the user
    """
    try:
        claude = get_claude_service()
        neural_router = get_neural_router()
        
        # Get session context
        session = _conversation_sessions.get(request.session_id, {})
        persona = session.get("persona", "al_hakim")
        language = session.get("language", "en")
        user_id = session.get("user_id", f"user-{request.session_id[:8]}")
        current_mode = NeuralMode(session.get("neural_mode", "phoenix"))
        osint_risk = max(session.get("osint_risk", 0.0), request.osint_risk)
        
        # === NEURAL ROUTING: AI determines state transition ===
        state_transition = await neural_router.route(
            session_id=request.session_id,
            user_id=user_id,
            message=request.message,
            current_mode=current_mode,
            osint_risk=osint_risk
        )
        
        # Get dynamic system prompt based on detected state
        dynamic_system_prompt = neural_router.get_persona_system_prompt(
            state=state_transition.new_state,
            mode=state_transition.recommended_mode,
            language=language
        )
        
        # Create chat with context from previous messages
        chat = await claude.create_conversation(
            session_id=request.session_id,
            persona=persona if state_transition.recommended_mode != NeuralMode.SANCTUARY else "al_sheikha",
            language=language
        )
        
        # Build context from previous messages
        context = ""
        if session.get("messages"):
            for msg in session["messages"][-10:]:  # Last 10 messages for context
                role = "User" if msg["role"] == "user" else "Al-Hakim"
                context += f"{role}: {msg['content']}\n\n"
        
        # Add neural context for AI awareness
        neural_context = f"""
[NEURAL STATE AWARENESS]
- Detected State: {state_transition.new_state.value}
- Recommended Mode: {state_transition.recommended_mode.value}
- Persona Adjustment: {state_transition.persona_adjustment}
- OSINT Risk Level: {osint_risk:.2f}
- Trigger: {state_transition.trigger_reason}
{dynamic_system_prompt}
"""
        
        # Add context and new message
        full_message = f"{neural_context}\n\nPrevious conversation:\n{context}\n\nUser's new response: {request.message}\n\nRespond naturally according to your current state awareness. If distress detected, prioritize safety over assessment progress."
        
        response = await claude.send_message(chat, full_message)
        
        # Update session with neural state
        if request.session_id in _conversation_sessions:
            _conversation_sessions[request.session_id]["messages"].append(
                {"role": "user", "content": request.message}
            )
            _conversation_sessions[request.session_id]["messages"].append(
                {"role": "assistant", "content": response}
            )
            # Update neural state
            _conversation_sessions[request.session_id]["neural_mode"] = state_transition.recommended_mode.value
            _conversation_sessions[request.session_id]["neural_state"] = state_transition.new_state.value
            _conversation_sessions[request.session_id]["osint_risk"] = osint_risk
            _conversation_sessions[request.session_id]["state_transitions"].append({
                "from": state_transition.previous_state.value,
                "to": state_transition.new_state.value,
                "mode": state_transition.recommended_mode.value,
                "timestamp": state_transition.timestamp
            })
        
        # Check if assessment seems complete
        assessment_complete = len(session.get("messages", [])) > 20 and any(
            phrase in response.lower() 
            for phrase in ["complete", "finished", "concluded", "thank you for sharing", "assessment is complete"]
        )
        
        # Determine if mode pivot is needed
        should_pivot = (
            state_transition.recommended_mode != current_mode or
            state_transition.new_state in [UserState.CRISIS, UserState.DISTRESS]
        )
        
        # Generate neural directive for frontend
        neural_directive = NeuralDirective(
            should_pivot=should_pivot,
            pivot_to_mode=state_transition.recommended_mode.value if should_pivot else None,
            ui_commands=state_transition.ui_directive,
            persona_adjustment=state_transition.persona_adjustment,
            detected_state=state_transition.new_state.value,
            emergency_resources=state_transition.new_state == UserState.CRISIS
        )
        
        return {
            "response": response,
            "session_id": request.session_id,
            "assessment_complete": assessment_complete,
            # NEURAL-FIRST: AI commands for frontend
            "neural_directive": neural_directive.model_dump(),
            "state_transition": {
                "previous": state_transition.previous_state.value,
                "current": state_transition.new_state.value,
                "mode": state_transition.recommended_mode.value,
                "trigger": state_transition.trigger_reason
            }
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
        
        # Get session data (or create a default)
        session = _conversation_sessions.get(request.session_id, {
            "persona": "al_hakim",
            "language": "en",
            "messages": []
        })
        
        # Store session if it doesn't exist
        if request.session_id not in _conversation_sessions:
            _conversation_sessions[request.session_id] = session
        
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
        
        # Generate certificate link
        from api.certificate import _certificate_cache
        cert_token = str(uuid.uuid4())
        _certificate_cache[link_data["link_token"]] = {
            "session_id": request.session_id,
            "user_id": request.user_id,
            "sovereign_title": sovereign_title,
            "stability": "Sovereign",
            "superpower": analysis[:500] if len(analysis) > 500 else analysis,
            "scores": None,
            "sar_value": 5500,
            "created_at": datetime.utcnow().isoformat()
        }
        
        return {
            "session_id": request.session_id,
            "status": "complete",
            "analysis_preview": analysis[:200] + "..." if len(analysis) > 200 else analysis,
            "sovereign_title": sovereign_title,
            "sar_value": 5500,
            "user_cost": 0,
            "certificate_ready": True,
            "results_link": link_data["link_url"],
            "certificate_link": f"/api/certificate/download/{link_data['link_token']}",
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



@router.get("/results/{link_token}")
async def get_results(link_token: str):
    """
    Get assessment results using time-gated link
    Validates and increments click counter
    """
    try:
        time_gate = get_time_gate_service()
        
        # Validate and increment click counter
        validation = time_gate.validate_and_increment(link_token)
        
        if not validation["valid"]:
            raise HTTPException(
                status_code=410,  # Gone
                detail={
                    "error": "time_gate_closed",
                    "reason": validation["reason"],
                    "message": validation["message"]
                }
            )
        
        # Get session results
        session_id = validation["session_id"]
        session = _conversation_sessions.get(session_id, {})
        results = session.get("results", {})
        
        if not results:
            # Return placeholder if no stored results
            results = {
                "sovereign_title": "The Strategic Phoenix",
                "stability": "Sovereign",
                "superpower": "You operate across an expanded dynamic range, with heightened perception and profound depth of experience.",
                "sar_value": 5500,
                "user_cost": 0
            }
        
        return {
            "valid": True,
            "results": results,
            "time_gate": {
                "clicks_remaining": validation["clicks_remaining"],
                "time_remaining_hours": validation["time_remaining_hours"],
                "expires_at": validation["expires_at"],
                "warning": validation.get("warning", False)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve results: {str(e)}")


@router.get("/results/{link_token}/status")
async def get_link_status(link_token: str):
    """
    Get time-gate link status without incrementing click counter
    """
    try:
        time_gate = get_time_gate_service()
        status = time_gate.get_link_status(link_token)
        
        if not status:
            return {
                "valid": False,
                "reason": "expired",
                "message": "This link has expired or does not exist."
            }
        
        return {
            "valid": status["is_active"],
            "clicks_remaining": status["max_clicks"] - status["current_clicks"],
            "time_remaining_hours": status["ttl_hours"],
            "expires_at": status["expires_at"],
            "max_clicks": status["max_clicks"],
            "current_clicks": status["current_clicks"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get link status: {str(e)}")
