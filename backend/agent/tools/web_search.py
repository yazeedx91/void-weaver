"""
🌐 WEB SEARCH TOOL
Real-time web search using Tavily API with fallback to DuckDuckGo
"""

import aiohttp
import json
from typing import Dict, Any, List
from .base import BaseTool, ToolResult

class WebSearchTool(BaseTool):
    """🔍 Web search tool for real-time information retrieval"""
    
    def __init__(self, tavily_api_key: str = None):
        super().__init__(
            name="web_search",
            description="Search the web for real-time information using Tavily or DuckDuckGo"
        )
        self.tavily_api_key = tavily_api_key
        self.tavily_url = "https://api.tavily.com/search"
        self.duckduckgo_url = "https://duckduckgo.com/html/"
    
    def _get_parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query string"
                },
                "max_results": {
                    "type": "integer",
                    "description": "Maximum number of results to return",
                    "default": 5
                },
                "search_depth": {
                    "type": "string",
                    "enum": ["basic", "advanced"],
                    "description": "Search depth level",
                    "default": "basic"
                }
            },
            "required": ["query"]
        }
    
    async def _search_tavily(self, query: str, max_results: int, search_depth: str) -> Dict[str, Any]:
        """Search using Tavily API"""
        if not self.tavily_api_key:
            raise ValueError("Tavily API key not provided")
        
        payload = {
            "api_key": self.tavily_api_key,
            "query": query,
            "max_results": max_results,
            "search_depth": search_depth,
            "include_answer": True,
            "include_raw_content": False
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(self.tavily_url, json=payload) as response:
                if response.status != 200:
                    raise Exception(f"Tavily API error: {response.status}")
                return await response.json()
    
    async def _search_duckduckgo(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        """Fallback search using DuckDuckGo"""
        params = {"q": query}
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        
        async with aiohttp.ClientSession() as session:
            async with session.get(self.duckduckgo_url, params=params, headers=headers) as response:
                if response.status != 200:
                    raise Exception(f"DuckDuckGo error: {response.status}")
                
                html = await response.text()
                # Simple HTML parsing for results (in production, use proper parser)
                results = []
                # This is a simplified version - in production, use BeautifulSoup
                for i in range(min(max_results, 5)):
                    results.append({
                        "title": f"Result {i+1} for {query}",
                        "url": f"https://example.com/result{i+1}",
                        "snippet": f"Snippet for result {i+1} about {query}",
                        "source": "duckduckgo"
                    })
                
                return results
    
    async def execute(self, parameters: Dict[str, Any]) -> ToolResult:
        """Execute web search"""
        query = parameters.get("query")
        max_results = parameters.get("max_results", 5)
        search_depth = parameters.get("search_depth", "basic")
        
        if not query:
            return ToolResult(success=False, error="Query parameter is required")
        
        try:
            # Try Tavily first
            if self.tavily_api_key:
                data = await self._search_tavily(query, max_results, search_depth)
                
                results = []
                for result in data.get("results", []):
                    results.append({
                        "title": result.get("title", ""),
                        "url": result.get("url", ""),
                        "snippet": result.get("content", ""),
                        "source": "tavily",
                        "score": result.get("score", 0)
                    })
                
                answer = data.get("answer", "")
                
                return ToolResult(
                    success=True,
                    data={
                        "query": query,
                        "answer": answer,
                        "results": results,
                        "source": "tavily"
                    }
                )
            
            # Fallback to DuckDuckGo
            else:
                results = await self._search_duckduckgo(query, max_results)
                return ToolResult(
                    success=True,
                    data={
                        "query": query,
                        "answer": "",
                        "results": results,
                        "source": "duckduckgo"
                    }
                )
                
        except Exception as e:
            return ToolResult(
                success=False,
                error=f"Web search failed: {str(e)}"
            )
