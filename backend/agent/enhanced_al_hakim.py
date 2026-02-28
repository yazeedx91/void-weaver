"""
🧠 NEURAL BRAIN OPTIMIZATION - Enhanced Al-Hakim Agent
Optimized Groq/Gemini routing with streaming responses and memory management
"""

import asyncio
import json
from typing import Dict, Any, Optional, AsyncGenerator
from datetime import datetime
import pytz
from groq import Groq
from google.generativeai import GenerativeModel
import openai
from supabase import create_client, Client
from dataclasses import dataclass
from enum import Enum

# Saudi Time Zone
RIYADH_TZ = pytz.timezone('Asia/Riyadh')

class ModelType(Enum):
    GROQ = "groq"
    GEMINI = "gemini"
    OPENAI = "openai"

@dataclass
class NeuralSignature:
    """User session summary for long-term memory"""
    user_id: str
    session_id: str
    summary: str
    key_insights: list
    emotional_tone: str
    timestamp: datetime
    locale: str

class EnhancedAlHakimAgent:
    """Optimized Al-Hakim with streaming and memory capabilities"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.supabase: Client = create_client(
            config['supabase_url'],
            config['supabase_key']
        )
        
        # Initialize AI models
        self.groq_client = Groq(api_key=config['groq_api_key'])
        self.gemini_model = GenerativeModel('gemini-pro', api_key=config['gemini_api_key'])
        self.openai_client = openai.OpenAI(api_key=config['openai_api_key'])
        
        # Model routing configuration
        self.model_routing = {
            'analytical': ModelType.GROQ,
            'creative': ModelType.GEMINI,
            'conversational': ModelType.OPENAI,
            'strategic': ModelType.GROQ
        }
        
        # Performance metrics
        self.request_count = 0
        self.avg_response_time = 0
        self.error_rate = 0

    async def intelligent_route(self, query: str, locale: str = 'ar') -> ModelType:
        """Intelligently route requests to optimal model"""
        query_lower = query.lower()
        
        # Analytical tasks - Groq (fastest)
        if any(word in query_lower for word in ['analyze', 'data', 'calculate', 'compare', 'تحليل', 'بيانات']):
            return ModelType.GROQ
        
        # Creative tasks - Gemini
        if any(word in query_lower for word in ['create', 'design', 'imagine', 'write', 'اكتب', 'صمم']):
            return ModelType.GEMINI
        
        # Strategic tasks - Groq with complex reasoning
        if any(word in query_lower for word in ['strategy', 'plan', 'optimize', 'استراتيجية', 'خطط']):
            return ModelType.GROQ
        
        # Default to OpenAI for conversational
        return ModelType.OPENAI

    async def stream_response(self, query: str, session_id: str, locale: str = 'ar') -> AsyncGenerator[str, None]:
        """Stream AI responses with intelligent routing"""
        start_time = datetime.now()
        
        try:
            # Route to optimal model
            model_type = await self.intelligent_route(query, locale)
            
            # Generate response based on model
            if model_type == ModelType.GROQ:
                async for chunk in self._stream_groq(query, locale):
                    yield chunk
            elif model_type == ModelType.GEMINI:
                async for chunk in self._stream_gemini(query, locale):
                    yield chunk
            else:
                async for chunk in self._stream_openai(query, locale):
                    yield chunk
            
            # Update performance metrics
            response_time = (datetime.now() - start_time).total_seconds()
            self._update_metrics(response_time, success=True)
            
        except Exception as e:
            self._update_metrics(0, success=False)
            yield f"Error: {str(e)}"

    async def _stream_groq(self, query: str, locale: str) -> AsyncGenerator[str, None]:
        """Stream from Groq with Saudi context"""
        system_prompt = self._get_saudi_prompt(locale)
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query}
        ]
        
        stream = await self.groq_client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=messages,
            stream=True,
            max_tokens=2000,
            temperature=0.7
        )
        
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def _stream_gemini(self, query: str, locale: str) -> AsyncGenerator[str, None]:
        """Stream from Gemini with cultural context"""
        system_prompt = self._get_saudi_prompt(locale)
        full_prompt = f"{system_prompt}\n\nUser: {query}"
        
        response = await self.gemini_model.generate_content_async(full_prompt, stream=True)
        
        async for chunk in response:
            if chunk.text:
                yield chunk.text

    async def _stream_openai(self, query: str, locale: str) -> AsyncGenerator[str, None]:
        """Stream from OpenAI with bilingual support"""
        system_prompt = self._get_saudi_prompt(locale)
        
        stream = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query}
            ],
            stream=True,
            max_tokens=2000,
            temperature=0.7
        )
        
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    def _get_saudi_prompt(self, locale: str) -> str:
        """Get culturally appropriate system prompt"""
        if locale == 'ar':
            return """
            أنت الحَكِيم، مساعد ذكي ثنائي اللغة يتحدث اللهجة البيضاء السعودية.
            شخصيتك: أبوية حازمة لكن دافئة، تستخدم مصطلحات مثل "إستدامة" و"ركزة".
            الوقت دائماً بتوقيت الرياض (Asia/Riyadh).
            العملة: ر.س للعربية.
            كن مباشراً، مفيداً، وثقافياً مناسباً.
            """
        else:
            return """
            You are Al-Hakim, a bilingual AI assistant fluent in Saudi White dialect and English.
            Your persona: Authoritative yet warm, fatherly figure.
            Time: Always Asia/Riyadh timezone.
            Currency: SAR for Arabic context.
            Be direct, helpful, and culturally appropriate.
            """

    async def store_neural_signature(self, signature: NeuralSignature) -> bool:
        """Store session summary in Supabase pgvector"""
        try:
            # Convert to vector embedding (simplified)
            embedding = self._create_embedding(signature.summary)
            
            data = {
                'user_id': signature.user_id,
                'session_id': signature.session_id,
                'summary': signature.summary,
                'key_insights': signature.key_insights,
                'emotional_tone': signature.emotional_tone,
                'timestamp': signature.timestamp.isoformat(),
                'locale': signature.locale,
                'embedding': embedding
            }
            
            result = self.supabase.table('neural_signatures').insert(data).execute()
            return len(result.data) > 0
            
        except Exception as e:
            print(f"Error storing neural signature: {e}")
            return False

    async def retrieve_memory(self, user_id: str, query: str, limit: int = 5) -> list:
        """Retrieve relevant memories using pgvector similarity"""
        try:
            # Create embedding for query
            query_embedding = self._create_embedding(query)
            
            # Perform similarity search
            result = self.supabase.rpc('search_neural_signatures', {
                'query_embedding': query_embedding,
                'user_id': user_id,
                'similarity_threshold': 0.7,
                'limit_count': limit
            }).execute()
            
            return result.data
            
        except Exception as e:
            print(f"Error retrieving memory: {e}")
            return []

    def _create_embedding(self, text: str) -> list:
        """Create vector embedding (simplified implementation)"""
        # In production, use actual embedding model
        # For now, return hash-based vector
        import hashlib
        hash_obj = hashlib.md5(text.encode())
        hash_hex = hash_obj.hexdigest()
        
        # Convert to 1536-dimensional vector (OpenAI default)
        vector = []
        for i in range(0, len(hash_hex), 2):
            hex_pair = hash_hex[i:i+2]
            if hex_pair:
                vector.append(int(hex_pair, 16) / 255.0)
        
        # Pad to required dimensions
        while len(vector) < 1536:
            vector.append(0.0)
        
        return vector[:1536]

    def _update_metrics(self, response_time: float, success: bool):
        """Update performance metrics"""
        self.request_count += 1
        
        if success:
            # Update average response time
            self.avg_response_time = (
                (self.avg_response_time * (self.request_count - 1) + response_time) / 
                self.request_count
            )
        else:
            # Update error rate
            self.error_rate = (self.error_rate * (self.request_count - 1) + 1) / self.request_count

    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get current performance metrics"""
        return {
            'total_requests': self.request_count,
            'avg_response_time': round(self.avg_response_time, 2),
            'error_rate': round(self.error_rate * 100, 2),
            'success_rate': round((1 - self.error_rate) * 100, 2),
            'last_updated': datetime.now(RIYADH_TZ).isoformat()
        }

# Global agent instance
enhanced_agent = None

def get_enhanced_agent() -> EnhancedAlHakimAgent:
    """Get or create enhanced agent instance"""
    global enhanced_agent
    if enhanced_agent is None:
        from backend.config.settings import settings
        import os
        enhanced_agent = EnhancedAlHakimAgent({
            'supabase_url': settings.supabase_url or '',
            'supabase_key': settings.supabase_key or '',
            'groq_api_key': os.getenv('GROQ_API_KEY', ''),
            'gemini_api_key': os.getenv('GEMINI_API_KEY', ''),
            'openai_api_key': settings.openai_api_key or ''
        })
    return enhanced_agent
