"""
⚡ EXECUTOR NODE
Executes tools and performs actions based on plan
"""

from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from ..state import AgentState, AgentStatus, ToolCall
from ..tools.web_search import WebSearchTool
from ..tools.file_writer import FileWriterTool
import json
from datetime import datetime

class ExecutorNode:
    """⚡ Executor Node - Calls tools and performs actions"""
    
    def __init__(self, llm: ChatOpenAI, web_search_tool: WebSearchTool, file_writer_tool: FileWriterTool):
        self.llm = llm
        self.tools = {
            "web_search": web_search_tool,
            "file_writer": file_writer_tool
        }
    
    def _create_execution_prompt(self, state: AgentState) -> str:
        """Create execution prompt for current step"""
        current_step = state["current_step"]
        plan_index = state["current_plan_index"]
        
        prompt = f"""
You are an AI task executor. Your job is to execute the current step of the plan.

CURRENT STEP: {current_step}
STEP {plan_index + 1} of {len(state["plan"])}

USER GOAL: {state["user_goal"]}

CONTEXT:
{json.dumps(state.get("context", {}), indent=2)}

PREVIOUS TOOL OUTPUTS:
{json.dumps(state.get("tools_output", {}), indent=2)}

Available tools:
- web_search: Search for real-time information
- file_writer: Create, read, update, delete files

Analyze the current step and determine what tools to use. If no tools are needed, explain what you'll do instead.

Respond with a JSON object:
{{
    "reasoning": "Your analysis of what needs to be done for this step",
    "tool_calls": [
        {{
            "tool_name": "tool_name",
            "parameters": {{"param": "value"}},
            "purpose": "Why this tool call is needed"
        }}
    ],
    "expected_result": "What you expect to achieve"
}}

If no tools are needed, set "tool_calls" to [] and explain your approach in "reasoning".
"""
        return prompt
    
    async def _execute_tool_calls(self, tool_calls: List[Dict[str, Any]]) -> List[ToolCall]:
        """Execute multiple tool calls"""
        results = []
        
        for call in tool_calls:
            tool_name = call["tool_name"]
            parameters = call["parameters"]
            
            if tool_name not in self.tools:
                results.append(ToolCall(
                    tool_name=tool_name,
                    parameters=parameters,
                    result=None,
                    error=f"Unknown tool: {tool_name}",
                    timestamp=datetime.now()
                ))
                continue
            
            tool = self.tools[tool_name]
            result = await tool.safe_execute(parameters)
            
            results.append(ToolCall(
                tool_name=tool_name,
                parameters=parameters,
                result=result.data if result.success else None,
                error=result.error if not result.success else None,
                timestamp=datetime.now()
            ))
        
        return results
    
    async def __call__(self, state: AgentState) -> AgentState:
        """Execute current step"""
        try:
            # Update status
            state["status"] = AgentStatus.EXECUTING
            state["updated_at"] = datetime.now()
            
            # Check if we have a current step
            if not state.get("current_step"):
                state["status"] = AgentStatus.COMPLETED
                state["messages"].append({
                    "role": "assistant",
                    "content": "✅ All steps completed successfully!"
                })
                return state
            
            # Create execution prompt
            prompt = self._create_execution_prompt(state)
            
            # Get LLM response
            response = await self.llm.ainvoke([
                HumanMessage(content=prompt)
            ])
            
            # Parse response
            try:
                execution_data = json.loads(response.content)
                tool_calls = execution_data.get("tool_calls", [])
                
                # Execute tools
                executed_calls = await self._execute_tool_calls(tool_calls)
                
                # Store tool outputs
                for i, call in enumerate(executed_calls):
                    tool_name = call["tool_name"]
                    if call["result"]:
                        state["tools_output"][f"{tool_name}_{i}"] = call["result"]
                    if call["error"]:
                        state["tools_output"][f"{tool_name}_{i}_error"] = call["error"]
                
                # Create execution step record
                execution_step = {
                    "step_id": f"step_{state['current_plan_index'] + 1}",
                    "description": state["current_step"],
                    "status": AgentStatus.COMPLETED,
                    "tool_calls": executed_calls,
                    "reasoning": execution_data["reasoning"],
                    "timestamp": datetime.now()
                }
                state["steps"].append(execution_step)
                
                # Format response message
                response_content = f"⚡ **Executing:** {state['current_step']}\\n\\n"
                response_content += f"🧠 **Reasoning:** {execution_data['reasoning']}\\n\\n"
                
                if tool_calls:
                    response_content += "**🔧 Tool Calls:**\\n"
                    for i, call in enumerate(tool_calls):
                        response_content += f"- {call['tool_name']}: {call.get('purpose', 'No purpose specified')}\\n"
                    
                    response_content += "\\n**📊 Results:**\\n"
                    for i, call in enumerate(executed_calls):
                        if call["result"]:
                            response_content += f"✅ {call['tool_name']}: Success\\n"
                        if call["error"]:
                            response_content += f"❌ {call['tool_name']}: {call['error']}\\n"
                else:
                    response_content += "🤔 **No tools needed** - proceeding with reasoning\\n"
                
                state["messages"].append({
                    "role": "assistant",
                    "content": response_content
                })
                
                # Move to next step
                state["current_plan_index"] += 1
                if state["current_plan_index"] < len(state["plan"]):
                    state["current_step"] = state["plan"][state["current_plan_index"]]
                    state["status"] = AgentStatus.REFLECTING  # Move to reflection
                else:
                    state["status"] = AgentStatus.COMPLETED
                    state["current_step"] = ""
                    state["messages"].append({
                        "role": "assistant",
                        "content": "🎉 **All steps completed!** Ready for reflection."
                    })
                
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                state["status"] = AgentStatus.ERROR
                state["error_message"] = "Failed to parse execution plan"
                state["messages"].append({
                    "role": "assistant",
                    "content": "❌ Failed to parse execution plan"
                })
            
            return state
            
        except Exception as e:
            state["status"] = AgentStatus.ERROR
            state["error_message"] = f"Execution failed: {str(e)}"
            state["messages"].append({
                "role": "assistant",
                "content": f"❌ Execution failed: {str(e)}"
            })
            
            return state
