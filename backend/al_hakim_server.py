"""
🧬 OMEGA-1 AGENT SERVER - BILINGUAL EDITION
API endpoints for Level 3 Agentic Application with Saudi/English Support
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import asyncio
import json
import os
from datetime import datetime
import pytz

# Initialize FastAPI app
app = FastAPI(
    title="OMEGA-1 Agent API",
    description="Level 3 AI-Native Agentic System API - Bilingual Edition",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Next.js dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
agent_graph = None
memory_manager = None

# Pydantic models
class AgentRequest(BaseModel):
    goal: str
    sessionId: Optional[str] = None
    stream: bool = True

class ApprovalRequest(BaseModel):
    requestId: str
    action: str  # 'approve' or 'reject'

# Saudi Time Zone Setup
RIYADH_TZ = pytz.timezone('Asia/Riyadh')

def format_saudi_time(dt: datetime, locale: str = 'en') -> str:
    """Format datetime for Saudi context"""
    sa_time = dt.astimezone(RIYADH_TZ)
    
    if locale == 'ar':
        # Arabic format with Eastern Arabic numerals
        sa_time_str = sa_time.strftime('%Y-%m-%d %H:%M:%S')
        # Convert to Eastern Arabic numerals
        eastern_arabic = sa_time_str.translate(str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩'))
        return eastern_arabic
    else:
        # English format
        return sa_time.strftime('%Y-%m-%d %H:%M:%S')

def format_currency(amount: float, locale: str = 'en') -> str:
    """Format currency for Saudi context"""
    if locale == 'ar':
        return f"{amount:,.2f} ر.س"
    else:
        return f"SAR {amount:,.2f}"

def get_al_hakim_prompt(locale: str) -> str:
    """Get Al-Hakim's persona prompt based on locale"""
    if locale == 'ar':
        return """
        أنت الحَكِيم، مستشار تقني سعودي يتحدث بالعربية البيضاء الفصحى.
        تستخدم اللهجة السعودية العصرية (مثل "هين" بدلاً من "ماذا"، "شلونك" بدلاً من "كيف حالك").
        شخصيتك: أبوية حازمة لكن دافئة.
        المفردات العالية: استخدم كلمات مثل "الاستدامة" و "الرقابة" للمفاهيم التقنية.
        تجنب اللهجات المصرية والشامية.
        """
    else:
        return """
        You are Al-Hakim, a Saudi technical advisor speaking fluent English.
        Your tone is authoritative yet warm (mentor/father figure).
        You provide technical guidance with cultural context.
        """

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize agent and memory manager on startup"""
    global agent_graph, memory_manager
    
    try:
        # Import here to avoid circular imports
        import sys
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        
        from agent.agent_graph import AgentGraph
        from memory.manager import MemoryManager
        from config.settings import Settings
        
        settings = Settings()
        
        # Initialize Supabase client if credentials are available
        supabase_client = None
        if settings.supabase_url and settings.supabase_key:
            from supabase import create_client
            supabase_client = create_client(
                settings.supabase_url,
                settings.supabase_key
            )
            memory_manager = MemoryManager(supabase_client)
        
        # Initialize agent graph
        agent_graph = AgentGraph(
            openai_api_key=settings.openai_api_key,
            tavily_api_key=settings.tavily_api_key,
            workspace_path=settings.workspace_path,
            supabase_client=supabase_client
        )
        
        print("🚀 OMEGA-1 Agent API initialized successfully")
        print("🇸🇦 الحَكِيم جاهز للخدمة")
        
    except Exception as e:
        print(f"❌ Failed to initialize agent: {e}")
        # Continue without agent for basic functionality

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "OMEGA-1 Agent API",
        "version": "1.0.0",
        "status": "running",
        "bilingual": True,
        "supported_locales": ["en", "ar"]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "agent_initialized": agent_graph is not None,
        "memory_initialized": memory_manager is not None,
        "timestamp": format_saudi_time(datetime.now()),
        "timezone": "Asia/Riyadh"
    }

@app.post("/api/agent")
async def run_agent(request: AgentRequest, background_tasks: BackgroundTasks, http_request: Request):
    """Run agent with a goal - Bilingual Edition"""
    if not agent_graph:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    # Get locale from Accept-Language header
    accept_language = http_request.headers.get("accept-language", "en")
    locale = "ar" if "ar" in accept_language.lower() else "en"
    
    # Update agent prompt based on locale
    al_hakim_prompt = get_al_hakim_prompt(locale)
    
    async def generate_response():
        """Generate streaming response with cultural context"""
        try:
            async for event in agent_graph.run(
                user_goal=request.goal,
                session_id=request.sessionId,
                stream=request.stream
            ):
                # Add locale and cultural context to events
                if isinstance(event, dict):
                    event["locale"] = locale
                    event["timestamp"] = format_saudi_time(datetime.now(), locale)
                    if "message" in event:
                        event["message"]["timestamp"] = format_saudi_time(
                            datetime.now(), locale
                        )
                
                # Convert event to JSON and send
                event_json = json.dumps(event, default=str)
                yield f"data: {event_json}\n\n"
                
        except Exception as e:
            error_event = {
                "type": "error",
                "error": str(e),
                "timestamp": format_saudi_time(datetime.now(), locale),
                "locale": locale
            }
            yield f"data: {json.dumps(error_event)}\n\n"
    
    return StreamingResponse(
        generate_response(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/plain",
            "X-Locale": locale
        }
    )

@app.get("/api/agent/state/{session_id}")
async def get_agent_state(session_id: str, http_request: Request):
    """Get current agent state for a session"""
    if not agent_graph:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    # Get locale from request
    accept_language = http_request.headers.get("accept-language", "en")
    locale = "ar" if "ar" in accept_language.lower() else "en"
    
    state = await agent_graph.get_state(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Format timestamps and add cultural context
    if isinstance(state, dict):
        state["timestamp"] = format_saudi_time(datetime.now(), locale)
        state["locale"] = locale
    
    return {"state": state}

@app.post("/api/approvals")
async def handle_approval(request: ApprovalRequest, http_request: Request):
    """Handle approval requests with cultural context"""
    # Get locale from request
    accept_language = http_request.headers.get("accept-language", "en")
    locale = "ar" if "ar" in accept_language.lower() else "en"
    
    if request.action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    # Localized response messages
    if locale == 'ar':
        message = "تمت معالجة الطلب بنجاح" if request.action == "approve" else "تم رفض الطلب"
    else:
        message = "Request processed successfully" if request.action == "approve" else "Request rejected"
    
    return {
        "success": True,
        "requestId": request.requestId,
        "action": request.action,
        "message": message,
        "timestamp": format_saudi_time(datetime.now(), locale),
        "locale": locale
    }

@app.get("/api/currency/{amount}")
async def format_currency_endpoint(amount: float, http_request: Request):
    """Currency formatting endpoint"""
    accept_language = http_request.headers.get("accept-language", "en")
    locale = "ar" if "ar" in accept_language.lower() else "en"
    
    return {
        "amount": amount,
        "formatted": format_currency(amount, locale),
        "currency": "SAR",
        "locale": locale
    }

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "agent_server:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
