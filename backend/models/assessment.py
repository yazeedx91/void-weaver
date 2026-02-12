"""
FLUX-DNA Assessment Models
Pydantic schemas for the 8-Scale Oracle
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class ScaleType(str, Enum):
    HEXACO = "hexaco"
    DASS = "dass"
    TEIQUE = "teique"
    RAVENS = "ravens"
    SCHWARTZ = "schwartz"
    HITS = "hits"
    PCPTSD = "pcptsd"
    WEB = "web"


class AssessmentSession(BaseModel):
    id: str
    user_id: str
    session_status: str = "in_progress"
    current_scale: Optional[ScaleType] = None
    current_question_index: int = 0
    language: str = "en"
    persona_used: str = "al_hakim"
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None


class ConversationMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AssessmentResponse(BaseModel):
    session_id: str
    scale_type: ScaleType
    responses_encrypted: str  # Client-side encrypted JSON


class StabilityAnalysis(BaseModel):
    session_id: str
    user_id: str
    stability_classification: str  # 'sovereign', 'strategic_hibernation', 'at_risk', 'critical'
    risk_factors: List[str]
    analysis_encrypted: str  # Full Claude analysis (encrypted)
    sovereign_title: str  # e.g., "The Strategic Phoenix"
    superpower_statement: str
    sar_value: int = 5500
    user_cost: int = 0


class NeuralSignature(BaseModel):
    user_id: str
    session_id: str
    personality_vector: Optional[List[float]] = None
    cognitive_vector: Optional[List[float]] = None
    clinical_vector: Optional[List[float]] = None
    values_vector: Optional[List[float]] = None
