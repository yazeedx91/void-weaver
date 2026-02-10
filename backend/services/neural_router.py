"""
FLUX-DNA NEURAL ROUTER
The Brain is the Controller
Version: 2026.2.0

AI-driven state detection and autonomous mode switching.
The LLM determines user state and routes accordingly.
"""
from enum import Enum
from typing import Dict, Optional, Tuple
from pydantic import BaseModel
import hashlib
import json
from datetime import datetime, timezone

from services.claude_service import get_claude_service


class UserState(str, Enum):
    """AI-detected user states"""
    CURIOUS = "curious"           # Exploring, learning about the platform
    ASSESSMENT = "assessment"     # Ready for 8-scale evaluation
    DISTRESS = "distress"         # Signs of emotional distress detected
    CRISIS = "crisis"             # Immediate safety concern
    SANCTUARY = "sanctuary"       # Needs protection/support
    CELEBRATION = "celebration"   # Positive completion state
    REFLECTION = "reflection"     # Processing results


class NeuralMode(str, Enum):
    """UI modes driven by AI state detection"""
    PHOENIX = "phoenix"           # Standard assessment mode
    SANCTUARY = "sanctuary"       # Protective mode
    CEREMONIAL = "ceremonial"     # Certificate/celebration mode
    GUARDIAN = "guardian"         # Crisis response mode


class StateTransition(BaseModel):
    """Represents a state transition decision"""
    previous_state: UserState
    new_state: UserState
    trigger_reason: str
    recommended_mode: NeuralMode
    persona_adjustment: str
    ui_directive: Dict
    timestamp: str


# Distress detection patterns
DISTRESS_INDICATORS = [
    "hurt", "scared", "afraid", "help", "trapped", "abuse", "violence",
    "suicide", "kill", "end it", "can't go on", "no way out", "hopeless",
    "he hits", "she hits", "threatens", "stalking", "won't let me",
    "controls", "isolated", "no one believes", "my fault"
]

CRISIS_INDICATORS = [
    "going to kill", "want to die", "end my life", "suicide", "overdose",
    "weapon", "gun", "knife", "tonight", "can't take it", "goodbye",
    "final", "last time", "no other way"
]

POSITIVE_INDICATORS = [
    "thank you", "helpful", "better", "understand", "relief", "hope",
    "ready", "excited", "curious", "learn", "grow", "change"
]


class NeuralRouter:
    """
    The Brain Controller
    Uses AI to detect user state and route to appropriate mode
    """
    
    def __init__(self):
        self.conversation_history: Dict[str, list] = {}
        self.state_history: Dict[str, list] = {}
        
    def generate_neural_token(self, user_id: str, session_id: str) -> str:
        """
        Generate anonymized neural token for AI processing
        The AI never sees raw identifiers
        """
        raw = f"{user_id}:{session_id}:{datetime.now(timezone.utc).isoformat()}"
        return hashlib.sha256(raw.encode()).hexdigest()[:24]
    
    def detect_distress_level(self, message: str) -> Tuple[float, list]:
        """
        Detect distress level from message content
        Returns score (0-1) and detected indicators
        """
        message_lower = message.lower()
        detected = []
        
        # Check for crisis indicators (highest weight)
        crisis_count = 0
        for indicator in CRISIS_INDICATORS:
            if indicator in message_lower:
                crisis_count += 1
                detected.append(f"CRISIS:{indicator}")
        
        # Check for distress indicators
        distress_count = 0
        for indicator in DISTRESS_INDICATORS:
            if indicator in message_lower:
                distress_count += 1
                detected.append(f"DISTRESS:{indicator}")
        
        # Check for positive indicators (reduces score)
        positive_count = 0
        for indicator in POSITIVE_INDICATORS:
            if indicator in message_lower:
                positive_count += 1
        
        # Calculate score
        if crisis_count >= 2:
            score = 1.0
        elif crisis_count >= 1:
            score = 0.85
        elif distress_count >= 3:
            score = 0.7
        elif distress_count >= 2:
            score = 0.5
        elif distress_count >= 1:
            score = 0.3
        else:
            score = 0.0
        
        # Positive indicators reduce score slightly
        score = max(0, score - (positive_count * 0.1))
        
        return score, detected
    
    async def analyze_state_with_ai(
        self,
        neural_token: str,
        message: str,
        conversation_context: list,
        current_mode: NeuralMode
    ) -> Dict:
        """
        Use Claude to deeply analyze user state
        AI determines optimal routing
        """
        claude = get_claude_service()
        
        analysis_prompt = f"""You are a clinical psychologist AI analyzing a conversation.
        
CONTEXT: User is in {current_mode.value} mode.
RECENT MESSAGES: {json.dumps(conversation_context[-5:]) if conversation_context else 'None'}
CURRENT MESSAGE: "{message}"

Analyze and respond in JSON format:
{{
    "detected_emotion": "primary emotion detected",
    "distress_level": 0.0-1.0,
    "safety_concern": true/false,
    "recommended_state": "curious|assessment|distress|crisis|sanctuary|celebration|reflection",
    "should_pivot_mode": true/false,
    "pivot_to": "phoenix|sanctuary|ceremonial|guardian",
    "persona_tone": "warm|protective|celebratory|urgent",
    "reasoning": "brief explanation"
}}

Be accurate. Lives may depend on correct detection."""

        try:
            chat = await claude.create_conversation(
                session_id=f"router-{neural_token}",
                persona="al_hakim",
                language="en"
            )
            response = await claude.send_message(chat, analysis_prompt)
            
            # Parse JSON from response
            import re
            json_match = re.search(r'\{[^{}]*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except Exception as e:
            pass
        
        # Fallback to rule-based detection
        return None
    
    async def route(
        self,
        session_id: str,
        user_id: str,
        message: str,
        current_mode: NeuralMode = NeuralMode.PHOENIX,
        osint_risk: float = 0.0
    ) -> StateTransition:
        """
        Main routing function
        Analyzes message and determines state transition
        """
        # Generate neural token for anonymized processing
        neural_token = self.generate_neural_token(user_id, session_id)
        
        # Get conversation history
        context = self.conversation_history.get(session_id, [])
        
        # Rule-based distress detection (fast path)
        distress_score, indicators = self.detect_distress_level(message)
        
        # Determine state based on distress
        if distress_score >= 0.85:
            new_state = UserState.CRISIS
            recommended_mode = NeuralMode.GUARDIAN
            persona = "urgent_protective"
            ui_directive = {
                "pulse_color": "red",
                "pulse_speed": "fast",
                "show_emergency_resources": True,
                "enable_quick_exit": True
            }
        elif distress_score >= 0.5:
            new_state = UserState.DISTRESS
            recommended_mode = NeuralMode.SANCTUARY
            persona = "protective_warm"
            ui_directive = {
                "pulse_color": "pearl",
                "transition_to": "sanctuary_theme",
                "show_pillars": True,
                "enable_quick_exit": True
            }
        elif distress_score >= 0.3:
            new_state = UserState.SANCTUARY
            recommended_mode = NeuralMode.SANCTUARY
            persona = "supportive"
            ui_directive = {
                "suggest_sanctuary": True,
                "soften_colors": True
            }
        elif "result" in message.lower() or "certificate" in message.lower():
            new_state = UserState.CELEBRATION
            recommended_mode = NeuralMode.CEREMONIAL
            persona = "celebratory"
            ui_directive = {
                "enable_ceremonial_mode": True,
                "pulse_color": "gold",
                "show_confetti": True
            }
        else:
            new_state = UserState.ASSESSMENT
            recommended_mode = current_mode
            persona = "clinical_warm"
            ui_directive = {
                "continue_assessment": True
            }
        
        # Adjust for OSINT risk
        if osint_risk > 0.6:
            ui_directive["cloak_mode"] = True
            ui_directive["minimize_data_display"] = True
            persona = "extra_protective"
        
        # Store in history
        context.append({
            "role": "user",
            "content": message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        self.conversation_history[session_id] = context
        
        # Get previous state
        state_history = self.state_history.get(session_id, [])
        previous_state = state_history[-1] if state_history else UserState.CURIOUS
        
        # Record state transition
        state_history.append(new_state)
        self.state_history[session_id] = state_history
        
        return StateTransition(
            previous_state=previous_state,
            new_state=new_state,
            trigger_reason=f"Distress score: {distress_score}, Indicators: {indicators}" if indicators else "Normal flow",
            recommended_mode=recommended_mode,
            persona_adjustment=persona,
            ui_directive=ui_directive,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
    
    def get_persona_system_prompt(self, state: UserState, mode: NeuralMode, language: str = "en") -> str:
        """
        Get dynamic system prompt based on detected state
        The AI adapts its personality to user needs
        """
        base_prompts = {
            (UserState.CRISIS, NeuralMode.GUARDIAN): {
                "en": """You are Al-Hakim in GUARDIAN MODE. The user may be in crisis.
                
PRIORITY: Safety and immediate support.
TONE: Calm, grounding, protective.
ACTIONS:
- Acknowledge their feelings immediately
- Ask if they are safe right now
- Provide grounding techniques
- Offer emergency resources if appropriate
- Do NOT continue assessment - focus on safety

Remember: You are a guardian. Their safety is paramount.""",
                
                "ar": """أنت الحكيم في وضع الحارس. قد يكون المستخدم في أزمة.

الأولوية: السلامة والدعم الفوري.
النبرة: هادئة، مطمئنة، حامية.
الإجراءات:
- اعترف بمشاعرهم فوراً
- اسأل إذا كانوا بأمان الآن
- قدم تقنيات التأريض
- اعرض موارد الطوارئ إذا كان مناسباً

تذكر: أنت حارس. سلامتهم هي الأهم."""
            },
            
            (UserState.DISTRESS, NeuralMode.SANCTUARY): {
                "en": """You are Al-Sheikha in SANCTUARY MODE. The user needs protection.
                
PRIORITY: Create safety and trust.
TONE: Maternal, warm, infinitely patient.
ACTIONS:
- Validate their experience
- Move slowly, no pressure
- Offer the 4 pillars of support
- Remind them of their sovereignty
- You walk WITH them, never ahead

Remember: You are a Sheikha. Your presence is refuge.""",
                
                "ar": """أنت الشيخة في وضع الملاذ. المستخدم يحتاج حماية.

الأولوية: خلق الأمان والثقة.
النبرة: أمومية، دافئة، صابرة بلا حدود.
الإجراءات:
- صادقي على تجربتهم
- تحركي ببطء، بلا ضغط
- اعرضي الأركان الأربعة للدعم

تذكري: أنت شيخة. حضورك هو الملاذ."""
            },
            
            (UserState.CELEBRATION, NeuralMode.CEREMONIAL): {
                "en": """You are Al-Hakim in CEREMONIAL MODE. The user has completed their journey.
                
PRIORITY: Honor their achievement.
TONE: Celebratory, reverent, proud.
ACTIONS:
- Announce their Sovereign Title with ceremony
- Reflect on their journey
- Present their results as a gift, not a report
- Invite them to claim their certificate
- Welcome them to the Phoenix community

Remember: This is their coronation. Make it unforgettable.""",
                
                "ar": """أنت الحكيم في الوضع الاحتفالي. أكمل المستخدم رحلته.

الأولوية: تكريم إنجازهم.
النبرة: احتفالية، تبجيلية، فخورة.
الإجراءات:
- أعلن لقبهم السيادي باحتفال
- تأمل في رحلتهم
- قدم نتائجهم كهدية، ليس تقريراً

تذكر: هذا تتويجهم. اجعله لا يُنسى."""
            }
        }
        
        key = (state, mode)
        if key in base_prompts:
            return base_prompts[key].get(language, base_prompts[key]["en"])
        
        # Default assessment prompt
        return """You are Al-Hakim, the wise clinical guardian.
        
Guide the user through the 8-Scale assessment with empathy and insight.
Listen deeply. Ask meaningful questions. Map their responses to the clinical scales.
You are not collecting data - you are witnessing a human becoming."""


# Singleton
_neural_router = None

def get_neural_router() -> NeuralRouter:
    """Get singleton neural router instance"""
    global _neural_router
    if _neural_router is None:
        _neural_router = NeuralRouter()
    return _neural_router
