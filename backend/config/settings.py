"""
⚙️ CONFIGURATION SETTINGS
Environment variables and settings for OMEGA-1 Agent
"""

from pydantic import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    """🔧 Application Settings"""
    
    # API Keys
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    tavily_api_key: Optional[str] = os.getenv("TAVILY_API_KEY", None)
    
    # Supabase Configuration
    supabase_url: Optional[str] = os.getenv("SUPABASE_URL", None)
    supabase_key: Optional[str] = os.getenv("SUPABASE_ANON_KEY", None)
    
    # File System
    workspace_path: str = os.getenv("AGENT_WORKSPACE_PATH", "/tmp/agent_workspace")
    
    # Agent Configuration
    max_steps: int = int(os.getenv("AGENT_MAX_STEPS", "10"))
    temperature: float = float(os.getenv("AGENT_TEMPERATURE", "0.1"))
    model: str = os.getenv("AGENT_MODEL", "gpt-4o")
    
    # Server Configuration
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8001"))
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Memory Configuration
    memory_limit: int = int(os.getenv("MEMORY_LIMIT", "1000"))
    similarity_threshold: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.7"))
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()
