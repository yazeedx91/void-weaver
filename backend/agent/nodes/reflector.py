"""
🔍 REFLECTOR NODE
Checks output quality and decides whether to continue or loop back
"""

from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from ..state import AgentState, AgentStatus
import json
from datetime import datetime

class ReflectorNode:
    """🔍 Reflector Node - Self-correction and quality control"""
    
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
    
    def _create_reflection_prompt(self, state: AgentState) -> str:
        """Create reflection prompt for quality assessment"""
        prompt = f"""
You are an AI quality controller. Your job is to reflect on the execution results and decide next steps.

USER GOAL: {state["user_goal"]}

CURRENT STATUS:
- Step {state["current_plan_index"]} of {len(state["plan"])} completed
- Total steps executed: {state["step_count"]}

LAST EXECUTED STEP: {state["current_step"] if state.get("current_step") else "No current step"}

EXECUTION RESULTS:
{json.dumps(state.get("tools_output", {}), indent=2)}

PLAN PROGRESS:
{json.dumps(state["plan"], indent=2)}

Analyze the results and decide:
1. Was the last step successful?
2. Are we making good progress toward the goal?
3. Should we continue, retry, or adjust the plan?

Respond with a JSON object:
{{
    "assessment": "Your assessment of the current progress",
    "success_quality": "high/medium/low - how well was the last step executed?",
    "goal_progress": "high/medium/low - how close are we to the goal?",
    "next_action": "continue/retry/adjust_plan/complete",
    "reasoning": "Detailed reasoning for your decision",
    "suggestions": "Any suggestions for improvement"
}}

Criteria:
- "continue": Step was successful, proceed to next step
- "retry": Step failed, retry the same step
- "adjust_plan": Current approach isn't working, need new plan
- "complete": Goal has been achieved
"""
        return prompt
    
    async def __call__(self, state: AgentState) -> AgentState:
        """Execute reflection and decision making"""
        try:
            # Update status
            state["status"] = AgentStatus.REFLECTING
            state["updated_at"] = datetime.now()
            
            # Create reflection prompt
            prompt = self._create_reflection_prompt(state)
            
            # Get LLM response
            response = await self.llm.ainvoke([
                HumanMessage(content=prompt)
            ])
            
            # Parse response
            try:
                reflection_data = json.loads(response.content)
                next_action = reflection_data["next_action"]
                
                # Format reflection message
                reflection_content = f"🔍 **Reflection**\\n\\n"
                reflection_content += f"📊 **Assessment:** {reflection_data['assessment']}\\n\\n"
                reflection_content += f"✅ **Success Quality:** {reflection_data['success_quality']}\\n"
                reflection_content += f"🎯 **Goal Progress:** {reflection_data['goal_progress']}\\n\\n"
                reflection_content += f"🧠 **Reasoning:** {reflection_data['reasoning']}\\n\\n"
                
                if reflection_data.get("suggestions"):
                    reflection_content += f"💡 **Suggestions:** {reflection_data['suggestions']}\\n\\n"
                
                # Decision logic
                if next_action == "continue":
                    reflection_content += "➡️ **Decision:** Continue to next step"
                    state["status"] = AgentStatus.EXECUTING
                    
                elif next_action == "retry":
                    reflection_content += "🔄 **Decision:** Retry current step"
                    state["status"] = AgentStatus.EXECUTING
                    # Move back one step to retry
                    if state["current_plan_index"] > 0:
                        state["current_plan_index"] -= 1
                        state["current_step"] = state["plan"][state["current_plan_index"]]
                    
                elif next_action == "adjust_plan":
                    reflection_content += "🔧 **Decision:** Adjust plan - going back to planning"
                    state["status"] = AgentStatus.PLANNING
                    state["current_plan_index"] = 0
                    
                elif next_action == "complete":
                    reflection_content += "🎉 **Decision:** Goal achieved - completing"
                    state["status"] = AgentStatus.COMPLETED
                    state["current_step"] = ""
                    
                else:
                    reflection_content += f"❓ **Decision:** Unknown action '{next_action}' - continuing"
                    state["status"] = AgentStatus.EXECUTING
                
                state["messages"].append({
                    "role": "assistant",
                    "content": reflection_content
                })
                
                # Store reflection in context
                state["context"]["last_reflection"] = reflection_data
                
                # Check step limits
                state["step_count"] += 1
                if state["step_count"] >= state["max_steps"]:
                    state["status"] = AgentStatus.COMPLETED
                    state["messages"].append({
                        "role": "assistant",
                        "content": f"⏰ **Step limit reached** ({state["max_steps"]} steps). Completing current progress."
                    })
                
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                state["status"] = AgentStatus.EXECUTING
                state["messages"].append({
                    "role": "assistant",
                    "content": "🔍 Reflection completed - continuing to next step"
                })
            
            return state
            
        except Exception as e:
            state["status"] = AgentStatus.ERROR
            state["error_message"] = f"Reflection failed: {str(e)}"
            state["messages"].append({
                "role": "assistant",
                "content": f"❌ Reflection failed: {str(e)}"
            })
            
            return state
