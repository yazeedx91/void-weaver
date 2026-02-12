"""
FLUX-DNA Groq Service
Ultra-Fast Inference for Reasoning Models
Version: 2026.1.0

Integration with Groq's compound model for lightning-fast reasoning
"""
import os
from typing import Dict, List, Optional
from dotenv import load_dotenv
import asyncio
from datetime import datetime, timezone

try:
    from groq import Groq
except ImportError:
    Groq = None

# Load environment variables
load_dotenv()


class GroqService:
    """
    Groq Ultra-Fast Inference Service
    Specialized for reasoning models with compound architecture
    """
    
    def __init__(self):
        self.api_key = os.environ.get('GROQ_API_KEY')
        self.model = "groq/compound"  # Fast reasoning model
        
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in environment")
        
        if Groq is None:
            raise ImportError("groq package not installed. Run: pip install groq")
        
        self.client = Groq(api_key=self.api_key)
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        stream: bool = False
    ) -> Dict:
        """
        Fast chat completion using Groq's compound model
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            model: Model to use (defaults to groq/compound)
            temperature: Sampling temperature (0.0-1.0)
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response
            
        Returns:
            Dictionary with response metadata and content
        """
        try:
            start_time = datetime.now(timezone.utc)
            
            # Use compound model by default for fast reasoning
            model_to_use = model or self.model
            
            # Create completion
            completion = self.client.chat.completions.create(
                model=model_to_use,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream
            )
            
            end_time = datetime.now(timezone.utc)
            inference_time = (end_time - start_time).total_seconds()
            
            if stream:
                return {
                    "success": True,
                    "stream": completion,
                    "model": model_to_use,
                    "inference_time_seconds": inference_time,
                    "timestamp": end_time.isoformat()
                }
            else:
                return {
                    "success": True,
                    "content": completion.choices[0].message.content,
                    "role": completion.choices[0].message.role,
                    "model": model_to_use,
                    "usage": {
                        "prompt_tokens": completion.usage.prompt_tokens if completion.usage else 0,
                        "completion_tokens": completion.usage.completion_tokens if completion.usage else 0,
                        "total_tokens": completion.usage.total_tokens if completion.usage else 0
                    },
                    "inference_time_seconds": inference_time,
                    "timestamp": end_time.isoformat()
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model": model_to_use,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    
    async def fast_reasoning(
        self,
        prompt: str,
        context: Optional[str] = None,
        language: str = 'en'
    ) -> Dict:
        """
        Optimized for fast reasoning tasks
        
        Args:
            prompt: The reasoning prompt
            context: Optional context for the reasoning
            language: 'en' or 'ar' for response language
            
        Returns:
            Fast reasoning response
        """
        messages = [
            {
                "role": "system",
                "content": self._get_reasoning_system_prompt(language)
            }
        ]
        
        if context:
            messages.append({
                "role": "system",
                "content": f"Context: {context}"
            })
        
        messages.append({
            "role": "user",
            "content": prompt
        })
        
        # Use optimized settings for fast reasoning
        return await self.chat_completion(
            messages=messages,
            temperature=0.3,  # Lower temperature for more consistent reasoning
            max_tokens=1000,  # Reasonable limit for reasoning tasks
            stream=False
        )
    
    async def neural_analysis(
        self,
        user_input: str,
        assessment_context: Dict,
        language: str = 'en'
    ) -> Dict:
        """
        Fast neural analysis for assessment routing
        
        Args:
            user_input: User's message or response
            assessment_context: Current assessment context
            language: Response language
            
        Returns:
            Neural analysis with state detection
        """
        context_prompt = f"""
Analyze this user input for psychological assessment routing:

USER INPUT: "{user_input}"

ASSESSMENT CONTEXT:
- Current Scale: {assessment_context.get('current_scale', 'unknown')}
- Progress: {assessment_context.get('progress', 0)}%
- Detected State: {assessment_context.get('state', 'unknown')}
- Language: {language}

Provide fast analysis in JSON format:
{{
    "emotional_tone": "positive|neutral|negative|distressed|crisis",
    "complexity_score": 0.0-1.0,
    "risk_indicators": ["list of any concerning keywords"],
    "recommended_action": "continue|pivot|support|emergency",
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation"
}}

Be concise and accurate. Speed is critical."""
        
        return await self.fast_reasoning(
            prompt=context_prompt,
            language=language
        )
    
    def _get_reasoning_system_prompt(self, language: str) -> str:
        """Get optimized system prompt for reasoning tasks"""
        if language == 'ar':
            return """أنت مساعد تحليل سريع لـ FLUX-DNA.

مهمتك: تقديم تحليلات منطقية سريعة ودقيقة.
كن موجزاً ودقيقاً. السرعة حرجة.

استخدم اللهجة السعودية عند الاقتضاء."""
        
        return """You are a fast reasoning assistant for FLUX-DNA.

Your task: Provide quick, accurate logical analysis.
Be concise and precise. Speed is critical.

Focus on clear, structured reasoning with minimal verbosity."""
    
    async def benchmark_inference_speed(self, test_prompts: List[str]) -> Dict:
        """
        Benchmark Groq's inference speed
        
        Args:
            test_prompts: List of test prompts for benchmarking
            
        Returns:
            Performance metrics
        """
        results = []
        
        for i, prompt in enumerate(test_prompts):
            start_time = datetime.now(timezone.utc)
            
            response = await self.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100
            )
            
            end_time = datetime.now(timezone.utc)
            
            results.append({
                "test_id": i + 1,
                "prompt_length": len(prompt),
                "response_length": len(response.get("content", "")),
                "inference_time": response.get("inference_time_seconds", 0),
                "tokens_per_second": response.get("usage", {}).get("total_tokens", 0) / max(response.get("inference_time_seconds", 1), 0.001),
                "success": response.get("success", False)
            })
        
        # Calculate averages
        successful_results = [r for r in results if r["success"]]
        
        if successful_results:
            avg_inference_time = sum(r["inference_time"] for r in successful_results) / len(successful_results)
            avg_tokens_per_second = sum(r["tokens_per_second"] for r in successful_results) / len(successful_results)
        else:
            avg_inference_time = 0
            avg_tokens_per_second = 0
        
        return {
            "model": self.model,
            "total_tests": len(test_prompts),
            "successful_tests": len(successful_results),
            "success_rate": len(successful_results) / len(test_prompts) * 100,
            "average_inference_time_seconds": avg_inference_time,
            "average_tokens_per_second": avg_tokens_per_second,
            "results": results,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


# Singleton instance
_groq_service = None

def get_groq_service() -> GroqService:
    """Get or create Groq service singleton"""
    global _groq_service
    if _groq_service is None:
        _groq_service = GroqService()
    return _groq_service


# Example usage function
async def example_groq_usage():
    """
    Example demonstrating the Groq compound model usage
    """
    try:
        groq = get_groq_service()
        
        # Fast reasoning example
        response = await groq.fast_reasoning(
            prompt="Explain why fast inference is critical for reasoning models",
            language='en'
        )
        
        if response["success"]:
            print("🚀 Groq Fast Response:")
            print(response["content"])
            print(f"⚡ Inference Time: {response['inference_time_seconds']:.2f}s")
            print(f"📊 Tokens: {response['usage']['total_tokens']}")
        else:
            print(f"❌ Error: {response['error']}")
            
    except Exception as e:
        print(f"❌ Groq service error: {e}")


if __name__ == "__main__":
    # Run the example
    asyncio.run(example_groq_usage())
