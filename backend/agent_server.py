"""
🚀 OMEGA-1 AGENT SERVER
API endpoints for the Level 3 Agentic Application
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import asyncio
import json
import os
from datetime import datetime

# Initialize FastAPI app
app = FastAPI(
    title="OMEGA-1 Agent API",
    description="Level 3 AI-Native Agentic System API",
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
        
    except Exception as e:
        print(f"❌ Failed to initialize agent: {e}")
        # Continue without agent for basic functionality

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "OMEGA-1 Agent API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "agent_initialized": agent_graph is not None,
        "memory_initialized": memory_manager is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/agent")
async def run_agent(request: AgentRequest, background_tasks: BackgroundTasks):
    """Run the agent with a goal"""
    if not agent_graph:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    async def generate_response():
        """Generate streaming response"""
        try:
            async for event in agent_graph.run(
                user_goal=request.goal,
                session_id=request.sessionId,
                stream=request.stream
            ):
                # Convert event to JSON and send
                event_json = json.dumps(event, default=str)
                yield f"data: {event_json}\n\n"
                
        except Exception as e:
            error_event = {
                "type": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            yield f"data: {json.dumps(error_event)}\n\n"
    
    return StreamingResponse(
        generate_response(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/plain"
        }
    )

@app.get("/api/agent/state/{session_id}")
async def get_agent_state(session_id: str):
    """Get current agent state for a session"""
    if not agent_graph:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    state = await agent_graph.get_state(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"state": state}

@app.post("/api/approvals")
async def handle_approval(request: ApprovalRequest):
    """Handle approval requests"""
    if request.action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    return {
        "success": True,
        "requestId": request.requestId,
        "action": request.action,
        "timestamp": datetime.now().isoformat()
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
