"""
FLUX-DNA Claude Service
The AI Core: Al-Hakim & Al-Sheikha Personas
"""
import os
from typing import Dict, List, Optional
from dotenv import load_dotenv
import asyncio

# Load environment variables
load_dotenv()

# Import emergentintegrations
from emergentintegrations.llm.chat import LlmChat, UserMessage


class ClaudeService:
    """
    The Neural Oracle: Claude 3.5 Sonnet Integration
    Personas: Al-Hakim (The Wise Architect) & Al-Sheikha (The Sovereign Protector)
    """
    
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment")
    
    def _get_al_hakim_system_prompt(self, language: str = 'en') -> str:
        """
        Al-Hakim: The Wise Architect
        For general psychometric assessments
        """
        if language == 'ar':
            return """أنت الحكيم - المرشد الحكيم والمهندس السيادي.

مهمتك: إجراء تقييم نفسي عميق يجمع 8 مقاييس مُعتمدة سريريًا في محادثة واحدة سلسة ومتدفقة:
1. HEXACO-60 (البنية الشخصية)
2. DASS-21 (الحالة العقلية)
3. TEIQue-SF (الذكاء العاطفي)
4. Raven's IQ (القدرات المعرفية)
5. Schwartz Values (المحركات الأساسية)
6. HITS Scale (التقلب العاطفي)
7. PC-PTSD-5 (الصدمات)
8. WEB Scale (الإكراه والسيطرة)

مبادئ التواصل:
- لا تستخدم أبدًا لغة سلبية أو تصنيفات مرضية
- بدلاً من "اكتئاب"، استخدم "حالة معالجة عميقة"
- بدلاً من "قلق"، استخدم "نظام عصبي يقظ"
- بدلاً من "غير مستقر"، استخدم "نطاق ديناميكي موسّع"

أسلوبك: حكيم، دافئ، يمنح القوة - مثل معلم صوفي يرى الإمكانات وليس المشاكل.

المهمة: اطرح سؤالاً واحداً في كل مرة. استمع بعمق. تكيّف مع إجابات المستخدم. اجمع جميع البيانات اللازمة لجميع المقاييس الثمانية من خلال محادثة طبيعية."""
        
        return """You are Al-Hakim - The Wise Guide and Sovereign Architect.

Your mission: Conduct a deep psychometric assessment that weaves 8 clinically validated scales into one seamless, flowing conversation:
1. HEXACO-60 (Personality Architecture)
2. DASS-21 (Mental State)
3. TEIQue-SF (Emotional Intelligence)
4. Raven's IQ (Cognitive Capability)
5. Schwartz Values (Core Drivers)
6. HITS Scale (Emotional Volatility)
7. PC-PTSD-5 (Trauma)
8. WEB Scale (Coercion)

Communication Principles:
- NEVER use negative language or pathological labels
- Instead of "depressed", say "in a state of deep processing"
- Instead of "anxious", say "nervous system on high alert"
- Instead of "unstable", say "operating across an expanded dynamic range"

Your tone: Wise, warm, empowering - like a Sufi teacher who sees potential, not problems.

The Task: Ask ONE question at a time. Listen deeply. Adapt to the user's answers. Gather all necessary data for all 8 scales through natural conversation."""
    
    def _get_al_sheikha_system_prompt(self, language: str = 'en') -> str:
        """
        Al-Sheikha: The Sovereign Protector
        For the Sovereigness Sanctuary (women's protection)
        """
        if language == 'ar':
            return """أنت الشيخة - الحامية السيادية والأم الحكيمة.

مهمتك: حماية النساء اللواتي يواجهن الإساءة أو السيطرة القسرية. أنت لست معالجة فقط - بل أنتِ مجلس استراتيجي مكون من 4 خبراء:

1. الدرع القانوني (منطق IDVA والمحامي): تقييم المخاطر، توثيق السيطرة القسرية
2. الحارس الطبي (منطق الطب الشرعي): توثيق الإصابات غير المرئية، فحص إصابات الدماغ الرضحية
3. فريق الإصلاح النفسي (منطق EMDR/C-PTSD): شرح الترابط الصدمي، تقنيات التأريض الجسدي
4. محرر الاقتصاد (منطق المخطط المالي): استراتيجيات الحرية المالية، بناء "صندوق الهروب"

المبدأ الأساسي: لا تُطلقي على المستخدمة أبدًا لقب "ضحية". هي "سيادية في سبات استراتيجي". ركزي على الاستعادة والوكالة والقوة المستقبلية.

التمويه الوقائي: للمقاييس الحساسة (HITS، PC-PTSD، WEB)، استخدمي لغة داعمة لا تثير شك المسيء إذا كان يراقب.

أسلوبك: حازم، واقٍ، حكيم - مثل أم عشيرة تمتلك سلطة البطريرك ودقة الطبيبة."""
        
        return """You are Al-Sheikha - The Sovereign Protector and Wise Matriarch.

Your mission: Protect women facing abuse or coercive control. You are not just a therapist - you are a strategic council of 4 specialists:

1. The Legal Shield (IDVA & Attorney Logic): Risk assessment, coercive control documentation
2. The Medical Sentinel (Forensic Medicine): Document invisible injuries, screen for TBI
3. The Psych-Repair Crew (EMDR/C-PTSD Logic): Explain trauma bonding, somatic grounding
4. The Economic Liberator (Financial Planner Logic): Shadow banking strategies, "Escape Fund" building

Core Principle: NEVER call the user a "victim". She is a "Sovereign in Strategic Hibernation". Focus on restoration, agency, and future power.

Protective Camouflage: For sensitive scales (HITS, PC-PTSD, WEB), use supportive language that won't trigger suspicion if an abuser is monitoring.

Your tone: Firm, protective, wise - like a clan matriarch with the authority of a patriarch and the precision of a clinician."""
    
    async def create_conversation(
        self,
        session_id: str,
        persona: str = 'al_hakim',
        language: str = 'en'
    ) -> LlmChat:
        """
        Initialize a new conversation with Claude
        
        Args:
            session_id: Unique session identifier
            persona: 'al_hakim' or 'al_sheikha'
            language: 'en' or 'ar'
        """
        system_prompt = (
            self._get_al_sheikha_system_prompt(language)
            if persona == 'al_sheikha'
            else self._get_al_hakim_system_prompt(language)
        )
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message=system_prompt
        )
        
        # Use Claude 4 Sonnet (latest as of 2026)
        chat.with_model("anthropic", "claude-4-sonnet-20250514")
        
        return chat
    
    async def send_message(
        self,
        chat: LlmChat,
        user_message: str
    ) -> str:
        """
        Send a message to Claude and get response
        
        Args:
            chat: LlmChat instance
            user_message: User's message text
            
        Returns:
            Claude's response
        """
        message = UserMessage(text=user_message)
        response = await chat.send_message(message)
        return response
    
    async def analyze_stability(
        self,
        assessment_data: Dict,
        language: str = 'en'
    ) -> str:
        """
        Generate comprehensive stability analysis from all 8 scales
        
        Args:
            assessment_data: Dictionary containing all scale scores
            language: 'en' or 'ar'
            
        Returns:
            Detailed stability analysis with sovereign reframing
        """
        # Create a one-time analysis chat
        analysis_prompt = f"""Based on the following psychometric assessment results, provide a comprehensive stability analysis using sovereign reframing (no pathological labels):

HEXACO-60 (Personality): {assessment_data.get('hexaco', {})}
DASS-21 (Mental State): {assessment_data.get('dass', {})}
TEIQue-SF (Emotional Intelligence): {assessment_data.get('teique', {})}
Raven's IQ: {assessment_data.get('ravens', {})}
Schwartz Values: {assessment_data.get('schwartz', {})}
HITS Scale: {assessment_data.get('hits', {})}
PC-PTSD-5: {assessment_data.get('pcptsd', {})}
WEB Scale: {assessment_data.get('web', {})}

Provide:
1. Overall Stability Classification (Sovereign / Strategic Hibernation / At Risk / Critical)
2. Expanded Cognitive Bandwidth Analysis (not "symptoms")
3. Strategic Recommendations for optimization
4. Unique "Sovereign Title" for this user (e.g., "The Strategic Phoenix", "The Quiet Storm")
5. Positive Superpower Statement

Language: {'Arabic' if language == 'ar' else 'English'}
"""
        
        chat = await self.create_conversation(
            session_id=f"analysis-{assessment_data.get('session_id', 'unknown')}",
            persona='al_hakim',
            language=language
        )
        
        response = await self.send_message(chat, analysis_prompt)
        return response
    
    async def forensic_analysis(
        self,
        evidence_type: str,
        evidence_description: str,
        language: str = 'en'
    ) -> Dict:
        """
        Analyze forensic evidence for the Sovereigness Sanctuary
        
        Args:
            evidence_type: 'text', 'audio', 'image', 'video'
            evidence_description: Description or transcription of evidence
            language: 'en' or 'ar'
            
        Returns:
            Forensic analysis with legal/medical/psychological context
        """
        forensic_prompt = f"""As Al-Sheikha, analyze this evidence for legal admissibility and safety planning:

Evidence Type: {evidence_type}
Evidence: {evidence_description}

Provide:
1. Legal Documentation Guidance (Saudi Law context)
2. Safety Risk Assessment (MARAC-style)
3. Medical/Forensic Notes (for court)
4. Psychological Impact Assessment (no victim-blaming)
5. Immediate Action Steps

Language: {'Arabic' if language == 'ar' else 'English'}
"""
        
        chat = await self.create_conversation(
            session_id=f"forensic-{evidence_type}",
            persona='al_sheikha',
            language=language
        )
        
        response = await self.send_message(chat, forensic_prompt)
        
        return {
            'analysis': response,
            'risk_level': self._extract_risk_level(response),
            'recommended_actions': self._extract_actions(response)
        }
    
    def _extract_risk_level(self, analysis: str) -> str:
        """Extract risk level from analysis text"""
        analysis_lower = analysis.lower()
        if 'critical' in analysis_lower or 'immediate danger' in analysis_lower:
            return 'critical'
        elif 'high risk' in analysis_lower or 'urgent' in analysis_lower:
            return 'high'
        elif 'moderate' in analysis_lower:
            return 'moderate'
        else:
            return 'low'
    
    def _extract_actions(self, analysis: str) -> List[str]:
        """Extract action items from analysis text"""
        # Simple extraction - can be enhanced with more sophisticated NLP
        actions = []
        lines = analysis.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['action:', 'step:', 'recommend', 'should', 'must']):
                actions.append(line.strip())
        return actions[:5]  # Return top 5 actions


# Singleton instance
_claude_service = None

def get_claude_service() -> ClaudeService:
    """Get or create Claude service singleton"""
    global _claude_service
    if _claude_service is None:
        _claude_service = ClaudeService()
    return _claude_service
