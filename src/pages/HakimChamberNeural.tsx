import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAssessment } from '@/contexts/AssessmentContext';
import { Brain, Send, Shield, Sparkles, AlertTriangle, Heart, Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { fluxAPI, NeuralDirective } from '@/lib/flux-api';

type Msg = { role: 'user' | 'assistant'; content: string };

// Neural Mode colors
const NEURAL_COLORS = {
  emerald: 'hsl(160 84% 39%)',
  pearl: 'hsl(210 20% 80%)',
  gold: 'hsl(43 96% 56%)',
  red: 'hsl(0 84% 50%)',
};

// Quick Exit Component - Emergency escape
function QuickExit() {
  const handleQuickExit = () => {
    window.location.replace('https://weather.com');
  };

  return (
    <motion.button
      onClick={handleQuickExit}
      className="fixed top-16 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      data-testid="quick-exit-btn"
    >
      Quick Exit
    </motion.button>
  );
}

// Emergency Resources Modal
function EmergencyResources({ language, onClose }: { language: string; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="max-w-md w-full mx-4 p-6 rounded-2xl bg-background border border-red-500/30"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h3 className="text-lg font-bold text-foreground">
            {language === 'ar' ? 'موارد الدعم' : 'Support Resources'}
          </h3>
        </div>
        
        <p className="text-muted-foreground mb-4">
          {language === 'ar' 
            ? 'أنت لست وحدك. المساعدة متاحة.'
            : 'You are not alone. Help is available.'}
        </p>

        <div className="space-y-3">
          <a
            href="tel:920033360"
            className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition"
          >
            <Phone className="w-5 h-5" />
            <div>
              <div className="font-semibold">Saudi Family Safety</div>
              <div className="text-sm opacity-70">920033360</div>
            </div>
          </a>

          <a
            href="tel:911"
            className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition"
          >
            <AlertTriangle className="w-5 h-5" />
            <div>
              <div className="font-semibold">Emergency</div>
              <div className="text-sm opacity-70">911</div>
            </div>
          </a>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition"
        >
          {language === 'ar' ? 'إغلاق' : 'Close'}
        </button>
      </motion.div>
    </motion.div>
  );
}

// Typing indicator with neural color
function TypingIndicator({ pulseColor }: { pulseColor: string }) {
  return (
    <motion.div
      className="flex items-center gap-1 px-4 py-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: pulseColor }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </motion.div>
  );
}

// Confetti effect for ceremonial mode
function Confetti() {
  return (
    <motion.div 
      className="fixed inset-0 pointer-events-none z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3"
          style={{
            background: i % 3 === 0 ? NEURAL_COLORS.gold : i % 3 === 1 ? NEURAL_COLORS.emerald : NEURAL_COLORS.pearl,
            left: `${Math.random() * 100}%`,
            top: -20,
            borderRadius: i % 2 === 0 ? '50%' : '0',
          }}
          animate={{
            top: ['0%', '100%'],
            rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
            opacity: [1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2,
            ease: 'easeOut',
          }}
        />
      ))}
    </motion.div>
  );
}

// Chat bubble with neural awareness
interface ChatBubbleProps {
  role: 'assistant' | 'user';
  text: string;
  isLatest?: boolean;
  pulseColor: string;
}

function ChatBubble({ role, text, isLatest, pulseColor }: ChatBubbleProps) {
  const isHakim = role === 'assistant';

  return (
    <motion.div
      className={`flex ${isHakim ? 'justify-start' : 'justify-end'} mb-4`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="max-w-[85%] sm:max-w-[75%]">
        <div
          className={`relative rounded-2xl px-5 py-4 font-body text-sm leading-relaxed ${
            isHakim
              ? 'bg-muted/30 text-foreground/90 border rounded-tl-md'
              : 'text-foreground border rounded-tr-md'
          }`}
          style={isHakim ? {
            borderColor: `${pulseColor}20`,
            boxShadow: isLatest ? `0 0 25px ${pulseColor}15` : undefined,
          } : {
            background: `${pulseColor}15`,
            borderColor: `${pulseColor}25`,
          }}
        >
          {isHakim && (
            <div className="absolute -left-0 -top-0 w-8 h-8 rounded-full flex items-center justify-center -translate-x-10 -translate-y-1">
              <motion.div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${pulseColor}30, hsl(43 96% 56% / 0.2))`,
                  border: `1px solid ${pulseColor}30`,
                }}
                animate={isLatest ? {
                  boxShadow: [
                    `0 0 8px ${pulseColor}30`,
                    `0 0 16px ${pulseColor}50`,
                    `0 0 8px ${pulseColor}30`,
                  ],
                } : undefined}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-3.5 h-3.5" style={{ color: pulseColor }} />
              </motion.div>
            </div>
          )}
          {text}
        </div>
      </div>
    </motion.div>
  );
}

// Main Chamber Page with Neural Router Integration
export default function HakimChamber() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { setStage } = useAssessment();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [exchangeCount, setExchangeCount] = useState(0);
  
  // Neural State
  const [sessionId, setSessionId] = useState<string>('');
  const [neuralMode, setNeuralMode] = useState<string>('phoenix');
  const [pulseColor, setPulseColor] = useState<string>(NEURAL_COLORS.emerald);
  const [showQuickExit, setShowQuickExit] = useState(false);
  const [showEmergencyResources, setShowEmergencyResources] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [osintRisk, setOsintRisk] = useState<number>(0);
  const [detectedState, setDetectedState] = useState<string>('curious');
  const [resultToken, setResultToken] = useState<string>('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Handle Neural Directive from Backend
  const handleNeuralDirective = useCallback((directive: NeuralDirective) => {
    console.log('🧠 Neural Directive:', directive);
    setDetectedState(directive.detected_state);
    
    const { ui_commands } = directive;
    
    // Update pulse color
    if (ui_commands.pulse_color) {
      const colorMap: Record<string, string> = {
        emerald: NEURAL_COLORS.emerald,
        pearl: NEURAL_COLORS.pearl,
        gold: NEURAL_COLORS.gold,
        red: NEURAL_COLORS.red,
      };
      setPulseColor(colorMap[ui_commands.pulse_color] || NEURAL_COLORS.emerald);
    }
    
    // Quick exit visibility
    if (ui_commands.enable_quick_exit) {
      setShowQuickExit(true);
    }
    
    // Emergency resources
    if (directive.emergency_resources || ui_commands.show_emergency_resources) {
      setShowEmergencyResources(true);
    }
    
    // Confetti for celebration
    if (ui_commands.show_confetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    
    // Mode pivot
    if (directive.should_pivot && directive.pivot_to_mode) {
      setNeuralMode(directive.pivot_to_mode);
      
      if (directive.pivot_to_mode === 'sanctuary') {
        setPulseColor(NEURAL_COLORS.pearl);
        setShowQuickExit(true);
      } else if (directive.pivot_to_mode === 'guardian') {
        setPulseColor(NEURAL_COLORS.red);
        setShowQuickExit(true);
        setShowEmergencyResources(true);
      } else if (directive.pivot_to_mode === 'ceremonial') {
        setPulseColor(NEURAL_COLORS.gold);
        setShowConfetti(true);
      }
    }
  }, []);

  // Check OSINT and Start Assessment
  useEffect(() => {
    const initSession = async () => {
      try {
        // Check OSINT first
        const osintResult = await fluxAPI.checkOSINT();
        setOsintRisk(osintResult.risk_score);
        if (osintResult.risk_score > 0.3) {
          setShowQuickExit(true);
        }
        
        // Start assessment with Neural Router
        const response = await fluxAPI.startAssessment({
          language: lang,
          persona: 'al_hakim',
          user_email: `user-${Date.now()}@flux-dna.com`,
          osint_risk: osintResult.risk_score,
        });
        
        setSessionId(response.session_id);
        setMessages([{ role: 'assistant', content: response.initial_message }]);
        
        if (response.neural_directive) {
          handleNeuralDirective(response.neural_directive);
        }
      } catch (error) {
        console.error('Failed to start neural session:', error);
        // Fallback greeting
        setMessages([{
          role: 'assistant',
          content: lang === 'ar'
            ? 'السلام عليكم. أنا الحكيم — مرشدك الحكيم في هذه الرحلة. كيف حالك اليوم؟'
            : 'Peace be upon you. I am Al-Hakim — your wise guardian through this journey. How are you feeling today?'
        }]);
      } finally {
        setIsTyping(false);
      }
    };
    
    initSession();
  }, [lang, handleNeuralDirective]);

  // Send message with Neural Routing
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isTyping || isComplete) return;

    const userMsg: Msg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setExchangeCount(prev => prev + 1);

    try {
      const response = await fluxAPI.sendMessage({
        session_id: sessionId,
        message: text,
        osint_risk: osintRisk,
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
      
      if (response.neural_directive) {
        handleNeuralDirective(response.neural_directive);
      }
      
      if (response.assessment_complete) {
        await handleComplete();
      }
    } catch (error) {
      console.error('Message error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: lang === 'ar' 
          ? 'أسمعك. من فضلك واصل مشاركة أفكارك...'
          : 'I hear you. Please continue sharing your thoughts...'
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, isComplete, sessionId, osintRisk, lang, handleNeuralDirective]);

  // Complete Assessment
  const handleComplete = async () => {
    setIsTyping(true);
    try {
      const response = await fluxAPI.completeAssessment({
        session_id: sessionId,
        user_id: `user-${sessionId}`,
      });
      
      setResultToken(response.link_token);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: lang === 'ar'
          ? `شكراً لك على هذه الرحلة معي. 🏆 لقبك السيادي: ${response.sovereign_title}\n💎 القيمة: SAR ${response.sar_value.toLocaleString()}\n✨ تكلفتك: SAR 0`
          : `Thank you for this journey with me. 🏆 Your Sovereign Title: ${response.sovereign_title}\n💎 Value: SAR ${response.sar_value.toLocaleString()}\n✨ Your Cost: SAR 0`
      }]);
      setIsComplete(true);
      
      if (response.neural_directive) {
        handleNeuralDirective(response.neural_directive);
      }
    } catch (error) {
      console.error('Complete error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleViewResults = () => {
    setStage('generating');
    navigate('/generating');
  };

  const handleManualComplete = () => {
    handleComplete();
  };

  const progress = Math.min((exchangeCount / 8) * 100, 100);

  // Get mode-specific header
  const getModeHeader = () => {
    if (neuralMode === 'sanctuary') {
      return lang === 'ar' ? 'ملاذ الشيخة' : "Al-Sheikha's Sanctuary";
    } else if (neuralMode === 'guardian') {
      return lang === 'ar' ? 'وضع الحارس' : 'Guardian Mode';
    } else if (neuralMode === 'ceremonial') {
      return lang === 'ar' ? 'الاحتفال' : 'Ceremony';
    }
    return lang === 'ar' ? 'غرفة الحكيم' : "Al-Hakim's Chamber";
  };

  return (
    <div className="min-h-screen flex flex-col pt-14">
      {/* Quick Exit */}
      {showQuickExit && <QuickExit />}
      
      {/* Emergency Resources Modal */}
      <AnimatePresence>
        {showEmergencyResources && (
          <EmergencyResources 
            language={lang} 
            onClose={() => setShowEmergencyResources(false)} 
          />
        )}
      </AnimatePresence>
      
      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* Progress bar with neural color */}
      <div className="fixed top-12 left-0 right-0 z-40 h-1 bg-muted/20">
        <motion.div
          className="h-full"
          style={{ background: pulseColor, boxShadow: `0 0 10px ${pulseColor}` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Header with neural state */}
      <div className="flex items-center justify-center gap-3 py-4 border-b border-border/20">
        <motion.div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${pulseColor}25, hsl(43 96% 56% / 0.15))`,
            border: `1px solid ${pulseColor}30`,
          }}
          animate={{
            boxShadow: [
              `0 0 10px ${pulseColor}20`,
              `0 0 20px ${pulseColor}40`,
              `0 0 10px ${pulseColor}20`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {neuralMode === 'guardian' ? (
            <Heart className="w-4 h-4" style={{ color: pulseColor }} />
          ) : (
            <Brain className="w-4 h-4" style={{ color: pulseColor }} />
          )}
        </motion.div>
        <div>
          <h2 className="text-sm font-display font-semibold text-foreground">
            {getModeHeader()}
          </h2>
          <div className="flex items-center gap-1.5">
            <Shield className="w-2.5 h-2.5" style={{ color: `${pulseColor}60` }} />
            <span className="text-[10px] font-body" style={{ color: `${pulseColor}50` }}>
              {detectedState === 'crisis' 
                ? 'Support Active' 
                : detectedState === 'distress'
                ? 'Protective Mode'
                : t('hero.encryption')}
            </span>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full"
        style={{ paddingLeft: '3.5rem' }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <ChatBubble
              key={i}
              role={msg.role}
              text={msg.content}
              isLatest={msg.role === 'assistant' && i === messages.length - 1 && !isTyping}
              pulseColor={pulseColor}
            />
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex justify-start mb-4">
            <div
              className="rounded-2xl rounded-tl-md border"
              style={{ 
                borderColor: `${pulseColor}10`,
                boxShadow: `0 0 20px ${pulseColor}06`,
                background: 'hsl(var(--muted) / 0.3)'
              }}
            >
              <TypingIndicator pulseColor={pulseColor} />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border/20 bg-background/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <motion.button
                  onClick={handleViewResults}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-display font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${pulseColor}, ${pulseColor}cc)`,
                    color: 'hsl(var(--background))'
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Sparkles className="w-5 h-5" />
                  {lang === 'ar' ? 'اكشف خريطة عقلك' : 'Reveal Your Mind Map'}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={lang === 'ar' ? 'اكتب ردك هنا...' : 'Type your response...'}
                    disabled={isTyping}
                    className="flex-1 px-4 py-3 rounded-xl bg-secondary/40 border font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 transition-all disabled:opacity-50"
                    style={{ borderColor: `${pulseColor}20` }}
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={isTyping || !inputValue.trim()}
                    className="p-3 rounded-xl disabled:opacity-30 transition-opacity"
                    style={{ background: pulseColor, color: 'hsl(var(--background))' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
                
                {exchangeCount >= 5 && (
                  <motion.button
                    onClick={handleManualComplete}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    ✨ Ready to see your results? Click here to complete
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
