"""
📝 FILE WRITER TOOL
File system operations for the agent with safety checks
"""

import os
import json
from pathlib import Path
from typing import Dict, Any, Union
from .base import BaseTool, ToolResult

class FileWriterTool(BaseTool):
    """📝 File writer tool for creating and modifying files"""
    
    def __init__(self, base_path: str = "/tmp/agent_workspace"):
        super().__init__(
            name="file_writer",
            description="Create, read, update, and delete files in the workspace"
        )
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
        
        # Security: Define allowed directories
        self.allowed_extensions = {'.txt', '.md', '.json', '.py', '.js', '.ts', '.tsx', '.jsx', '.html', '.css'}
        self.max_file_size = 10 * 1024 * 1024  # 10MB
    
    def _get_parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["create", "read", "update", "delete", "list"],
                    "description": "File operation to perform"
                },
                "file_path": {
                    "type": "string",
                    "description": "Relative path to file from workspace root"
                },
                "content": {
                    "type": "string",
                    "description": "Content to write (for create/update)"
                },
                "directory": {
                    "type": "string",
                    "description": "Directory to list (for list action)"
                }
            },
            "required": ["action"]
        }
    
    def _validate_path(self, file_path: str) -> Path:
        """Validate and resolve file path for security"""
        full_path = self.base_path / file_path
        
        # Security: Prevent path traversal
        try:
            full_path.resolve().relative_to(self.base_path.resolve())
        except ValueError:
            raise ValueError(f"Path traversal detected: {file_path}")
        
        return full_path
    
    def _validate_file_type(self, file_path: Path) -> bool:
        """Check if file type is allowed"""
        if file_path.suffix.lower() not in self.allowed_extensions:
            raise ValueError(f"File type not allowed: {file_path.suffix}")
        return True
    
    async def _create_file(self, file_path: str, content: str) -> Dict[str, Any]:
        """Create a new file"""
        path = self._validate_path(file_path)
        self._validate_file_type(path)
        
        if len(content.encode('utf-8')) > self.max_file_size:
            raise ValueError(f"File too large: max {self.max_file_size} bytes")
        
        # Create parent directories if they don't exist
        path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write file
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return {
            "action": "created",
            "file_path": str(path.relative_to(self.base_path)),
            "size": len(content.encode('utf-8')),
            "message": f"File created successfully: {file_path}"
        }
    
    async def _read_file(self, file_path: str) -> Dict[str, Any]:
        """Read file contents"""
        path = self._validate_path(file_path)
        
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        if path.stat().st_size > self.max_file_size:
            raise ValueError(f"File too large to read: {path.stat().st_size} bytes")
        
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return {
            "action": "read",
            "file_path": str(path.relative_to(self.base_path)),
            "content": content,
            "size": len(content.encode('utf-8'))
        }
    
    async def _update_file(self, file_path: str, content: str) -> Dict[str, Any]:
        """Update existing file"""
        path = self._validate_path(file_path)
        self._validate_file_type(path)
        
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        if len(content.encode('utf-8')) > self.max_file_size:
            raise ValueError(f"File too large: max {self.max_file_size} bytes")
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return {
            "action": "updated",
            "file_path": str(path.relative_to(self.base_path)),
            "size": len(content.encode('utf-8')),
            "message": f"File updated successfully: {file_path}"
        }
    
    async def _delete_file(self, file_path: str) -> Dict[str, Any]:
        """Delete a file"""
        path = self._validate_path(file_path)
        
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        path.unlink()
        
        return {
            "action": "deleted",
            "file_path": str(path.relative_to(self.base_path)),
            "message": f"File deleted successfully: {file_path}"
        }
    
    async def _list_directory(self, directory: str = "") -> Dict[str, Any]:
        """List directory contents"""
        if directory:
            path = self._validate_path(directory)
        else:
            path = self.base_path
        
        if not path.exists():
            raise FileNotFoundError(f"Directory not found: {directory}")
        
        items = []
        for item in path.iterdir():
            relative_path = str(item.relative_to(self.base_path))
            
            if item.is_file():
                items.append({
                    "name": item.name,
                    "path": relative_path,
                    "type": "file",
                    "size": item.stat().st_size
                })
            else:
                items.append({
                    "name": item.name,
                    "path": relative_path,
                    "type": "directory"
                })
        
        return {
            "action": "listed",
            "directory": str(path.relative_to(self.base_path)),
            "items": sorted(items, key=lambda x: (x["type"], x["name"]))
        }
    
    async def execute(self, parameters: Dict[str, Any]) -> ToolResult:
        """Execute file operation"""
        action = parameters.get("action")
        
        if not action:
            return ToolResult(success=False, error="Action parameter is required")
        
        try:
            if action == "create":
                file_path = parameters.get("file_path")
                content = parameters.get("content", "")
                if not file_path:
                    return ToolResult(success=False, error="file_path required for create action")
                result = await self._create_file(file_path, content)
                
            elif action == "read":
                file_path = parameters.get("file_path")
                if not file_path:
                    return ToolResult(success=False, error="file_path required for read action")
                result = await self._read_file(file_path)
                
            elif action == "update":
                file_path = parameters.get("file_path")
                content = parameters.get("content", "")
                if not file_path:
                    return ToolResult(success=False, error="file_path required for update action")
                result = await self._update_file(file_path, content)
                
            elif action == "delete":
                file_path = parameters.get("file_path")
                if not file_path:
                    return ToolResult(success=False, error="file_path required for delete action")
                result = await self._delete_file(file_path)
                
            elif action == "list":
                directory = parameters.get("directory", "")
                result = await self._list_directory(directory)
                
            else:
                return ToolResult(success=False, error=f"Unknown action: {action}")
            
            return ToolResult(success=True, data=result)
            
        except Exception as e:
            return ToolResult(success=False, error=f"File operation failed: {str(e)}")
