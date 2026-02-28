"""
🧠 PLANNER NODE
Breaks user goals into executable steps using LLM reasoning
"""

from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from ..state import AgentState, AgentStatus
import json

class PlannerNode:
    """🎯 Planner Node - Breaks goals into actionable steps"""
    
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
    
    def _create_planning_prompt(self, state: AgentState) -> str:
        """Create planning prompt with context and memories"""
        relevant_context = ""
        if state.get("relevant_memories"):
            relevant_context = "\\nRelevant Context:\\n"
            for memory in state["relevant_memories"]:
                relevant_context += f"- {memory.get('content', '')}\\n"
        
        prompt = f"""
You are an expert AI task planner. Break down the user's goal into specific, actionable steps.

USER GOAL: {state["user_goal"]}

{relevant_context}

PREVIOUS CONTEXT:
{json.dumps(state.get("context", {}), indent=2)}

CURRENT STEPS COMPLETED: {state["step_count"]}/{state["max_steps"]}

Create a detailed plan with 3-7 steps. Each step should:
1. Be specific and actionable
2. Include what tools might be needed
3. Have clear success criteria

Available tools:
- web_search: Search for real-time information
- file_writer: Create, read, update, delete files

Respond with a JSON object:
{{
    "reasoning": "Your reasoning about how to approach this goal",
    "plan": [
        {{
            "step_id": "step_1",
            "description": "Specific action to take",
            "tools_needed": ["tool1", "tool2"],
            "expected_output": "What this step should produce"
        }}
    ]
}}
"""
        return prompt
    
    async def __call__(self, state: AgentState) -> AgentState:
        """Execute planning node"""
        try:
            # Update status
            state["status"] = AgentStatus.PLANNING
            state["updated_at"] = datetime.now()
            
            # Create planning prompt
            prompt = self._create_planning_prompt(state)
            
            # Get LLM response
            response = await self.llm.ainvoke([
                HumanMessage(content=prompt)
            ])
            
            # Parse response
            try:
                plan_data = json.loads(response.content)
                
                # Update state with plan
                state["plan"] = [step["description"] for step in plan_data["plan"]]
                state["current_plan_index"] = 0
                state["context"]["planning_reasoning"] = plan_data["reasoning"]
                
                # Add planning step to history
                planning_step = {
                    "step_id": "planning",
                    "description": "Created execution plan",
                    "status": AgentStatus.COMPLETED,
                    "tool_calls": [],
                    "reasoning": plan_data["reasoning"],
                    "timestamp": datetime.now()
                }
                state["steps"].append(planning_step)
                
                # Add message to conversation
                state["messages"].append({
                    "role": "assistant",
                    "content": f"📋 **Plan Created**\\n\\n{plan_data['reasoning']}\\n\\n**Steps:**\\n" + 
                              "\\n".join([f"{i+1}. {step}" for i, step in enumerate(state["plan"])])
                })
                
                # Move to first step
                if state["plan"]:
                    state["current_step"] = state["plan"][0]
                    state["status"] = AgentStatus.EXECUTING
                
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                state["plan"] = ["Analyze the goal", "Execute main task", "Verify results"]
                state["current_plan_index"] = 0
                state["current_step"] = state["plan"][0]
                state["status"] = AgentStatus.EXECUTING
                
                state["messages"].append({
                    "role": "assistant", 
                    "content": "📋 Created basic execution plan"
                })
            
            return state
            
        except Exception as e:
            state["status"] = AgentStatus.ERROR
            state["error_message"] = f"Planning failed: {str(e)}"
            state["messages"].append({
                "role": "assistant",
                "content": f"❌ Planning failed: {str(e)}"
            })
            
            return state
