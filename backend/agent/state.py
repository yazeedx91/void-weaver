"""
🧠 AGENT STATE DEFINITION
Core state structure for Level 3 Autonomous Agent
"""

from typing import TypedDict, List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class AgentStatus(Enum):
    THINKING = "thinking"
    PLANNING = "planning"
    EXECUTING = "executing"
    REFLECTING = "reflecting"
    COMPLETED = "completed"
    ERROR = "error"

class ToolCall(TypedDict):
    tool_name: str
    parameters: Dict[str, Any]
    result: Optional[Any]
    error: Optional[str]
    timestamp: datetime

class AgentStep(TypedDict):
    step_id: str
    description: str
    status: AgentStatus
    tool_calls: List[ToolCall]
    reasoning: str
    timestamp: datetime

class AgentState(TypedDict):
    """🎯 Core Agent State - The Brain's Memory"""
    
    # Core conversation
    messages: List[Dict[str, Any]]
    user_goal: str
    
    # Current execution state
    current_step: str
    step_count: int
    max_steps: int
    
    # Planning
    plan: List[str]
    current_plan_index: int
    
    # Execution tracking
    steps: List[AgentStep]
    tools_output: Dict[str, Any]
    
    # Memory and context
    relevant_memories: List[Dict[str, Any]]
    context: Dict[str, Any]
    
    # Status and control
    status: AgentStatus
    error_message: Optional[str]
    
    # Metadata
    session_id: str
    created_at: datetime
    updated_at: datetime

def create_initial_state(user_goal: str, session_id: str) -> AgentState:
    """Create fresh agent state for new session"""
    return AgentState(
        messages=[],
        user_goal=user_goal,
        current_step="",
        step_count=0,
        max_steps=10,
        plan=[],
        current_plan_index=0,
        steps=[],
        tools_output={},
        relevant_memories=[],
        context={},
        status=AgentStatus.THINKING,
        error_message=None,
        session_id=session_id,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
