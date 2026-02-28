"""
🧬 AGENT GRAPH CORE
The main LangGraph ReAct Loop implementation for Level 3 Autonomous Agent
"""

from typing import Dict, Any, Optional, AsyncGenerator
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
import uuid
from datetime import datetime

from .state import AgentState, AgentStatus, create_initial_state
from .nodes.planner import PlannerNode
from .nodes.executor import ExecutorNode
from .nodes.reflector import ReflectorNode
from .tools.web_search import WebSearchTool
from .tools.file_writer import FileWriterTool
from ..memory.manager import MemoryManager

class AgentGraph:
    """🧬 Core Agent Graph - ReAct Loop Implementation"""
    
    def __init__(
        self,
        openai_api_key: str,
        tavily_api_key: Optional[str] = None,
        workspace_path: str = "/tmp/agent_workspace",
        supabase_client: Optional[Any] = None
    ):
        # Initialize LLM
        self.llm = ChatOpenAI(
            api_key=openai_api_key,
            model="gpt-4o",
            temperature=0.1,
            streaming=True
        )
        
        # Initialize tools
        self.web_search_tool = WebSearchTool(tavily_api_key)
        self.file_writer_tool = FileWriterTool(workspace_path)
        
        # Initialize memory manager
        self.memory_manager = MemoryManager(supabase_client) if supabase_client else None
        
        # Initialize nodes
        self.planner = PlannerNode(self.llm)
        self.executor = ExecutorNode(
            self.llm,
            self.web_search_tool,
            self.file_writer_tool
        )
        self.reflector = ReflectorNode(self.llm)
        
        # Build the graph
        self.graph = self._build_graph()
        
        # Initialize checkpointer for conversation memory
        self.checkpointer = MemorySaver()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph with ReAct pattern"""
        
        # Create the graph
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("planner", self.planner)
        workflow.add_node("executor", self.executor)
        workflow.add_node("reflector", self.reflector)
        
        # Define the flow
        workflow.set_entry_point("planner")
        
        # Planner -> Executor (after planning)
        workflow.add_edge("planner", "executor")
        
        # Executor -> Reflector (after execution)
        workflow.add_edge("executor", "reflector")
        
        # Reflector decisions
        def decide_next_step(state: AgentState) -> str:
            """Decide where to go after reflection"""
            status = state.get("status")
            
            if status == AgentStatus.COMPLETED:
                return END
            elif status == AgentStatus.ERROR:
                return END
            elif status == AgentStatus.PLANNING:
                return "planner"
            elif status == AgentStatus.EXECUTING:
                return "executor"
            else:
                return "reflector"
        
        workflow.add_conditional_edges(
            "reflector",
            decide_next_step,
            {
                "planner": "planner",
                "executor": "executor",
                "reflector": "reflector",
                END: END
            }
        )
        
        return workflow.compile(checkpointer=self.checkpointer)
    
    async def _load_memories(self, state: AgentState) -> AgentState:
        """Load relevant memories before execution"""
        if self.memory_manager:
            try:
                memories = await self.memory_manager.get_relevant_memories(
                    query=state["user_goal"],
                    limit=5
                )
                state["relevant_memories"] = memories
            except Exception as e:
                # Continue without memories if there's an error
                print(f"Warning: Failed to load memories: {e}")
                state["relevant_memories"] = []
        
        return state
    
    async def _save_execution_memory(self, state: AgentState) -> None:
        """Save execution results to memory"""
        if self.memory_manager and state.get("status") == AgentStatus.COMPLETED:
            try:
                # Create memory summary
                memory_content = f"""
Goal: {state["user_goal"]}
Steps Completed: {len(state["steps"])}
Status: {state["status"].value}
Results: {state.get("tools_output", {})}
"""
                
                await self.memory_manager.add_memory(
                    content=memory_content,
                    session_id=state["session_id"],
                    metadata={
                        "goal": state["user_goal"],
                        "steps_count": len(state["steps"]),
                        "status": state["status"].value
                    }
                )
            except Exception as e:
                print(f"Warning: Failed to save memory: {e}")
    
    async def run(
        self,
        user_goal: str,
        session_id: Optional[str] = None,
        stream: bool = True
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Run the agent with streaming support"""
        
        # Generate session ID if not provided
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Create initial state
        state = create_initial_state(user_goal, session_id)
        
        # Load relevant memories
        state = await self._load_memories(state)
        
        # Add initial message
        state["messages"].append({
            "role": "user",
            "content": f"🎯 **Goal:** {user_goal}"
        })
        
        # Stream initial state
        yield {
            "type": "state_update",
            "session_id": session_id,
            "state": state
        }
        
        try:
            if stream:
                # Stream execution
                async for event in self.graph.astream(
                    state,
                    config={"configurable": {"thread_id": session_id}}
                ):
                    # Extract the latest state from the event
                    for node_name, node_state in event.items():
                        yield {
                            "type": "node_complete",
                            "node": node_name,
                            "session_id": session_id,
                            "state": node_state
                        }
                        
                        # Stream messages if any
                        for message in node_state.get("messages", []):
                            yield {
                                "type": "message",
                                "session_id": session_id,
                                "message": message
                            }
            else:
                # Run without streaming
                final_state = await self.graph.ainvoke(
                    state,
                    config={"configurable": {"thread_id": session_id}}
                )
                
                yield {
                    "type": "completion",
                    "session_id": session_id,
                    "state": final_state
                }
            
            # Save execution memory
            await self._save_execution_memory(state)
            
        except Exception as e:
            yield {
                "type": "error",
                "session_id": session_id,
                "error": str(e)
            }
    
    async def get_state(self, session_id: str) -> Optional[AgentState]:
        """Get current state for a session"""
        try:
            config = {"configurable": {"thread_id": session_id}}
            checkpoint = await self.checkpointer.aget(config)
            return checkpoint.values if checkpoint else None
        except Exception:
            return None
    
    def get_tool_schemas(self) -> list:
        """Get schemas for all available tools"""
        return [
            self.web_search_tool.get_schema(),
            self.file_writer_tool.get_schema()
        ]
    
    async def reset_session(self, session_id: str) -> bool:
        """Reset a session's memory"""
        try:
            config = {"configurable": {"thread_id": session_id}}
            await self.checkpointer.adelete(config)
            return True
        except Exception:
            return False
