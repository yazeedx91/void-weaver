"""
🔧 AGENT TOOLS BASE CLASS
Foundation for all agent tools with error handling and logging
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import logging
from datetime import datetime

class ToolResult:
    """Standardized tool result structure"""
    def __init__(self, success: bool, data: Any = None, error: str = None):
        self.success = success
        self.data = data
        self.error = error
        self.timestamp = datetime.now()

class BaseTool(ABC):
    """🛠️ Base class for all agent tools"""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.logger = logging.getLogger(f"tool.{name}")
    
    @abstractmethod
    async def execute(self, parameters: Dict[str, Any]) -> ToolResult:
        """Execute the tool with given parameters"""
        pass
    
    def get_schema(self) -> Dict[str, Any]:
        """Return JSON schema for tool parameters"""
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self._get_parameters_schema()
        }
    
    @abstractmethod
    def _get_parameters_schema(self) -> Dict[str, Any]:
        """Define the parameter schema for this tool"""
        pass
    
    async def safe_execute(self, parameters: Dict[str, Any]) -> ToolResult:
        """Safe execution with error handling"""
        try:
            self.logger.info(f"Executing {self.name} with parameters: {parameters}")
            result = await self.execute(parameters)
            
            if result.success:
                self.logger.info(f"✅ {self.name} executed successfully")
            else:
                self.logger.error(f"❌ {self.name} failed: {result.error}")
            
            return result
            
        except Exception as e:
            error_msg = f"Unexpected error in {self.name}: {str(e)}"
            self.logger.error(error_msg)
            return ToolResult(success=False, error=error_msg)
