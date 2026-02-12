"""
FLUX-DNA Groq API Endpoints
Ultra-Fast Reasoning Model Integration
Version: 2026.1.0
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone

from services.groq_service import get_groq_service

router = APIRouter(prefix="/api/groq", tags=["Groq Fast Inference"])


class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    model: Optional[str] = "groq/compound"
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    stream: bool = False


class FastReasoningRequest(BaseModel):
    prompt: str
    context: Optional[str] = None
    language: str = "en"


class NeuralAnalysisRequest(BaseModel):
    user_input: str
    assessment_context: Dict
    language: str = "en"


class BenchmarkRequest(BaseModel):
    test_prompts: List[str]


@router.post("/chat")
async def chat_completion(request: ChatRequest):
    """
    Fast chat completion using Groq's compound model
    """
    try:
        groq = get_groq_service()
        
        response = await groq.chat_completion(
            messages=request.messages,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=request.stream
        )
        
        if not response["success"]:
            raise HTTPException(status_code=500, detail=response["error"])
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq chat completion failed: {str(e)}")


@router.post("/reason")
async def fast_reasoning(request: FastReasoningRequest):
    """
    Optimized fast reasoning for complex prompts
    """
    try:
        groq = get_groq_service()
        
        response = await groq.fast_reasoning(
            prompt=request.prompt,
            context=request.context,
            language=request.language
        )
        
        if not response["success"]:
            raise HTTPException(status_code=500, detail=response["error"])
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fast reasoning failed: {str(e)}")


@router.post("/neural-analysis")
async def neural_analysis(request: NeuralAnalysisRequest):
    """
    Fast neural analysis for assessment routing
    """
    try:
        groq = get_groq_service()
        
        response = await groq.neural_analysis(
            user_input=request.user_input,
            assessment_context=request.assessment_context,
            language=request.language
        )
        
        if not response["success"]:
            raise HTTPException(status_code=500, detail=response["error"])
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Neural analysis failed: {str(e)}")


@router.post("/benchmark")
async def benchmark_inference(request: BenchmarkRequest):
    """
    Benchmark Groq's inference speed
    """
    try:
        groq = get_groq_service()
        
        results = await groq.benchmark_inference_speed(request.test_prompts)
        
        return {
            "benchmark_id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark failed: {str(e)}")


@router.get("/models")
async def get_available_models():
    """
    Get available Groq models optimized for FLUX-DNA
    """
    return {
        "available_models": [
            {
                "id": "groq/compound",
                "name": "Groq Compound",
                "description": "Ultra-fast reasoning model",
                "optimized_for": ["reasoning", "analysis", "assessment"],
                "speed": "ultra_fast"
            },
            {
                "id": "llama-3.3-70b-versatile",
                "name": "Llama 3.3 70B Versatile",
                "description": "General purpose fast model",
                "optimized_for": ["chat", "analysis"],
                "speed": "very_fast"
            },
            {
                "id": "mixtral-8x7b-32768",
                "name": "Mixtral 8x7B",
                "description": "Mixture of experts model",
                "optimized_for": ["reasoning", "complex_tasks"],
                "speed": "fast"
            }
        ],
        "recommended_for_flux_dna": "groq/compound",
        "api_version": "2026.1.0"
    }


@router.get("/health")
async def health_check():
    """
    Check Groq service health and performance
    """
    try:
        groq = get_groq_service()
        
        # Quick test with simple prompt
        test_response = await groq.chat_completion(
            messages=[{"role": "user", "content": "test"}],
            max_tokens=10
        )
        
        return {
            "status": "healthy" if test_response["success"] else "unhealthy",
            "service": "Groq Ultra-Fast Inference",
            "model": groq.model,
            "last_check": datetime.now(timezone.utc).isoformat(),
            "inference_time": test_response.get("inference_time_seconds", 0),
            "message": "Groq service operational" if test_response["success"] else "Groq service error"
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "Groq Ultra-Fast Inference",
            "error": str(e),
            "last_check": datetime.now(timezone.utc).isoformat()
        }
