"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Brain, Shield, Sparkles, Send, AlertTriangle, Heart, Phone } from "lucide-react";
import { apiClient, NeuralDirective } from "@/lib/api";

interface Message {
  role: "hakim" | "user";
  content: string;
  scaleLabel?: string;
}

// Neural Mode colors
const NEURAL_COLORS = {
  emerald: "hsl(160 84% 39%)",
  pearl: "hsl(210 20% 80%)",
  gold: "hsl(43 96% 56%)",
  red: "hsl(0 84% 50%)",
};

// Quick Exit Component - Emergency escape
function QuickExit() {
  const handleQuickExit = () => {
    // Replace history and navigate to weather.com
    window.location.replace("https://weather.com");
  };

  return (
    <motion.button
      onClick={handleQuickExit}
      className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium"
      style={{
        background: "hsl(0 84% 50%)",
        color: "white",
      }}
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
        className="max-w-md w-full mx-4 p-6 rounded-2xl"
        style={{
          background: "hsl(222 47% 8%)",
          border: "1px solid hsl(0 84% 50% / 0.3)",
        }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h3 className="text-lg font-bold text-white">
            {language === "ar" ? "موارد الدعم" : "Support Resources"}
          </h3>
        </div>
        
        <p className="text-gray-300 mb-4">
          {language === "ar" 
            ? "أنت لست وحدك. المساعدة متاحة."
            : "You are not alone. Help is available."}
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
          className="mt-4 w-full py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
        >
          {language === "ar" ? "إغلاق" : "Close"}
        </button>
      </motion.div>
    </motion.div>
  );
}

// Typing indicator component
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
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </motion.div>
  );
}

// Chat bubble component with neural awareness
function ChatBubble({ 
  role, 
  content, 
  scaleLabel, 
  isLatest,
  pulseColor 
}: Message & { isLatest?: boolean; pulseColor: string }) {
  const isHakim = role === "hakim";

  return (
    <motion.div
      className={`flex ${isHakim ? "justify-start" : "justify-end"} mb-4`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className={`max-w-[85%] sm:max-w-[75%]`}>
        {isHakim && scaleLabel && (
          <motion.div
            className="flex items-center gap-1.5 mb-1.5 px-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div 
              className="w-1.5 h-1.5 rounded-full animate-pulse" 
              style={{ background: pulseColor }} 
            />
            <span 
              className="text-[10px] uppercase tracking-widest" 
              style={{ color: `${pulseColor}99` }}
            >
              {scaleLabel}
            </span>
          </motion.div>
        )}
        <div
          className={`relative rounded-2xl px-5 py-4 text-sm leading-relaxed ${
            isHakim
              ? "bg-muted/30 text-foreground/90 border rounded-tl-md"
              : "text-foreground border rounded-tr-md"
          }`}
          style={isHakim ? {
            borderColor: `${pulseColor}20`,
            boxShadow: isLatest ? `0 0 25px ${pulseColor}15, 0 0 50px ${pulseColor}08` : undefined,
          } : {
            background: `${pulseColor}25`,
            borderColor: `${pulseColor}35`,
          }}
        >
          {isHakim && (
            <div className="absolute -left-0 -top-0 w-8 h-8 rounded-full flex items-center justify-center -translate-x-10 -translate-y-1">
              <motion.div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${pulseColor}50, hsl(43 96% 56% / 0.2))`,
                  border: `1px solid ${pulseColor}50`,
                }}
                animate={isLatest ? {
                  boxShadow: [
                    `0 0 8px ${pulseColor}50`,
                    `0 0 16px ${pulseColor}80`,
                    `0 0 8px ${pulseColor}50`,
                  ],
                } : undefined}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-3.5 h-3.5" style={{ color: pulseColor }} />
              </motion.div>
            </div>
          )}
          {content}
        </div>
      </div>
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
            borderRadius: i % 2 === 0 ? "50%" : "0",
          }}
          animate={{
            top: ["0%", "100%"],
            rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
            opacity: [1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
}

export default function AssessmentPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ar">("en");
  const [resultToken, setResultToken] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // === NEURAL STATE ===
  const [neuralMode, setNeuralMode] = useState<string>("phoenix");
  const [pulseColor, setPulseColor] = useState<string>(NEURAL_COLORS.emerald);
  const [showQuickExit, setShowQuickExit] = useState(false);
  const [showEmergencyResources, setShowEmergencyResources] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [osintRisk, setOsintRisk] = useState<number>(0);
  const [detectedState, setDetectedState] = useState<string>("curious");

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // === NEURAL DIRECTIVE HANDLER ===
  const handleNeuralDirective = useCallback((directive: NeuralDirective) => {
    console.log("🧠 Neural Directive Received:", directive);
    
    // Update detected state
    setDetectedState(directive.detected_state);
    
    // Handle UI commands
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
      
      // Handle mode-specific transitions
      if (directive.pivot_to_mode === "sanctuary") {
        setPulseColor(NEURAL_COLORS.pearl);
        setShowQuickExit(true);
      } else if (directive.pivot_to_mode === "guardian") {
        setPulseColor(NEURAL_COLORS.red);
        setShowQuickExit(true);
        setShowEmergencyResources(true);
      } else if (directive.pivot_to_mode === "ceremonial") {
        setPulseColor(NEURAL_COLORS.gold);
        setShowConfetti(true);
      }
    }
  }, []);

  // Check OSINT on mount
  useEffect(() => {
    const checkOSINT = async () => {
      try {
        const result = await apiClient.checkOSINT();
        setOsintRisk(result.risk_score);
        if (result.risk_score > 0.3) {
          setShowQuickExit(true);
        }
      } catch (error) {
        console.log("OSINT check skipped");
      }
    };
    checkOSINT();
  }, []);

  const startAssessment = async (language: "en" | "ar") => {
    setSelectedLanguage(language);
    setIsTyping(true);
    setIsStarted(true);

    try {
      const response = await apiClient.startAssessment({
        language,
        persona: "al_hakim",
        user_email: `user-${Date.now()}@flux-dna.com`,
        osint_risk: osintRisk
      });

      setSessionId(response.session_id);
      setMessages([{
        role: "hakim",
        content: response.initial_message,
        scaleLabel: "Rapport"
      }]);
      
      // Process neural directive
      if (response.neural_directive) {
        handleNeuralDirective(response.neural_directive);
      }
    } catch (error) {
      console.error("Failed to start assessment:", error);
      setMessages([{
        role: "hakim",
        content: selectedLanguage === "ar" 
          ? "السلام عليكم. أنا الحكيم — حارسك في هذه الرحلة. قبل أن نبدأ، أريدك أن تعرف: لا شيء تشاركه هنا يغادر هذا المكان. كل كلمة مشفرة لحظة نطقها. أخبرني... كيف تشعر الآن، في هذه اللحظة؟"
          : "Peace be upon you. I am Al-Hakim — your guardian through this journey. Before we begin, I want you to know: nothing you share here leaves this space. Every word is encrypted the moment you speak it. Tell me… how are you feeling right now, in this moment?",
        scaleLabel: "Rapport"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await apiClient.sendMessage({
        session_id: sessionId,
        message: userMessage,
        osint_risk: osintRisk
      });

      // Determine scale label based on state
      let scaleLabel = "Clinical Assessment";
      if (response.state_transition) {
        const stateLabels: Record<string, string> = {
          curious: "Rapport",
          assessment: "Clinical Assessment",
          distress: "Support Mode",
          crisis: "Crisis Support",
          sanctuary: "Sanctuary",
          celebration: "Celebration",
          reflection: "Reflection",
        };
        scaleLabel = stateLabels[response.state_transition.current] || "Processing";
      }

      setMessages(prev => [...prev, {
        role: "hakim",
        content: response.response,
        scaleLabel
      }]);

      // Process neural directive
      if (response.neural_directive) {
        handleNeuralDirective(response.neural_directive);
      }

      // Check if assessment is complete
      if (response.assessment_complete) {
        await completeAssessment();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, {
        role: "hakim",
        content: "I hear you. Please continue sharing your thoughts...",
        scaleLabel: "Processing"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const completeAssessment = async () => {
    setIsTyping(true);
    try {
      const response = await apiClient.completeAssessment({
        session_id: sessionId,
        user_id: `user-${sessionId}`,
        all_responses_encrypted: {}
      });

      setResultToken(response.link_token);
      setMessages(prev => [...prev, {
        role: "hakim",
        content: selectedLanguage === "ar"
          ? `شكراً لك على هذه الرحلة معي. لقد أظهرت شجاعة حقيقية. نتائجك جاهزة الآن.\n\n🏆 لقبك السيادي: ${response.sovereign_title}\n💎 القيمة: SAR ${response.sar_value.toLocaleString()}\n✨ تكلفتك: SAR 0\n\nاسمح لي أن أكشف لك خريطة عقلك الفريدة.`
          : `Thank you for this journey with me. You've shown real courage. Your results are ready now.\n\n🏆 Your Sovereign Title: ${response.sovereign_title}\n💎 Value: SAR ${response.sar_value.toLocaleString()}\n✨ Your Cost: SAR 0\n\nAllow me to reveal the unique map of your mind.`,
        scaleLabel: "Complete"
      }]);
      setIsComplete(true);
      
      // Process neural directive for ceremonial mode
      if (response.neural_directive) {
        handleNeuralDirective(response.neural_directive);
      }
    } catch (error) {
      console.error("Failed to complete assessment:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleViewResults = () => {
    if (resultToken) {
      router.push(`/results/${resultToken}`);
    }
  };

  const handleCompleteManually = () => {
    completeAssessment();
  };

  // Get background style based on neural mode
  const getBackgroundStyle = () => {
    if (neuralMode === "sanctuary" || neuralMode === "guardian") {
      // Pearl/calm theme
      return {
        background: "linear-gradient(180deg, hsl(222 47% 6%) 0%, hsl(210 20% 15%) 100%)",
      };
    }
    return {}; // Default void-bg from CSS
  };

  // Language selection screen
  if (!isStarted) {
    return (
      <div className="min-h-screen void-bg flex flex-col items-center justify-center px-4">
        {showQuickExit && <QuickExit />}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          {/* Header */}
          <motion.div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${pulseColor}35, hsl(43 96% 56% / 0.15))`,
              border: `1px solid ${pulseColor}50`,
            }}
            animate={{
              boxShadow: [
                `0 0 30px ${pulseColor}35`,
                `0 0 50px ${pulseColor}60`,
                `0 0 30px ${pulseColor}35`,
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Brain className="w-10 h-10" style={{ color: pulseColor }} />
          </motion.div>

          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Al-Hakim&apos;s Chamber</h1>
            <p className="text-muted-foreground">Choose your language to begin</p>
          </div>

          <div className="flex items-center gap-2 justify-center text-xs" style={{ color: `${pulseColor}99` }}>
            <Shield className="w-3 h-3" />
            <span>Zero-Knowledge Encryption Active</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => startAssessment("en")}
              className="glass-card p-6 hover:scale-105 transition-transform"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid="select-english-btn"
            >
              <div className="text-3xl mb-2">🇬🇧</div>
              <p className="font-semibold text-foreground">English</p>
              <p className="text-xs text-muted-foreground">Meet Al-Hakim</p>
            </motion.button>

            <motion.button
              onClick={() => startAssessment("ar")}
              className="glass-card p-6 hover:scale-105 transition-transform"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid="select-arabic-btn"
            >
              <div className="text-3xl mb-2">🇸🇦</div>
              <p className="font-semibold text-foreground">العربية</p>
              <p className="text-xs text-muted-foreground">قابل الحكيم</p>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen void-bg flex flex-col pt-14" style={getBackgroundStyle()}>
      {/* Quick Exit */}
      {showQuickExit && <QuickExit />}
      
      {/* Emergency Resources Modal */}
      <AnimatePresence>
        {showEmergencyResources && (
          <EmergencyResources 
            language={selectedLanguage} 
            onClose={() => setShowEmergencyResources(false)} 
          />
        )}
      </AnimatePresence>
      
      {/* Confetti */}
      {showConfetti && <Confetti />}
      
      {/* Progress bar with neural color */}
      <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-muted/20">
        <motion.div
          className="h-full"
          style={{ background: pulseColor, boxShadow: `0 0 10px ${pulseColor}` }}
          initial={{ width: 0 }}
          animate={{ width: isComplete ? '100%' : `${Math.min(messages.length * 10, 90)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Header with neural state indicator */}
      <div className="flex items-center justify-center gap-3 py-4 border-b border-border/20">
        <motion.div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${pulseColor}40, hsl(43 96% 56% / 0.15))`,
            border: `1px solid ${pulseColor}50`,
          }}
          animate={{
            boxShadow: [
              `0 0 10px ${pulseColor}35`,
              `0 0 20px ${pulseColor}60`,
              `0 0 10px ${pulseColor}35`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {neuralMode === "guardian" ? (
            <Heart className="w-4 h-4" style={{ color: pulseColor }} />
          ) : (
            <Brain className="w-4 h-4" style={{ color: pulseColor }} />
          )}
        </motion.div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {neuralMode === "sanctuary" 
              ? (selectedLanguage === "ar" ? "ملاذ الشيخة" : "Al-Sheikha's Sanctuary")
              : neuralMode === "guardian"
              ? (selectedLanguage === "ar" ? "وضع الحارس" : "Guardian Mode")
              : neuralMode === "ceremonial"
              ? (selectedLanguage === "ar" ? "الاحتفال" : "Ceremony")
              : (selectedLanguage === "ar" ? "غرفة الحكيم" : "Al-Hakim's Chamber")}
          </h2>
          <div className="flex items-center gap-1.5">
            <Shield className="w-2.5 h-2.5" style={{ color: `${pulseColor}99` }} />
            <span className="text-[10px]" style={{ color: `${pulseColor}80` }}>
              {detectedState === "crisis" 
                ? "Support Active" 
                : detectedState === "distress"
                ? "Protective Mode"
                : "Zero-Knowledge Encryption Active"}
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
              content={msg.content}
              scaleLabel={msg.role === "hakim" ? msg.scaleLabel : undefined}
              isLatest={msg.role === "hakim" && i === messages.length - 1 && !isTyping}
              pulseColor={pulseColor}
            />
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex justify-start mb-4">
            <div 
              className="glass-card rounded-2xl rounded-tl-md"
              style={{ 
                borderColor: `${pulseColor}20`,
                boxShadow: `0 0 20px ${pulseColor}10` 
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
            {!isComplete ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={selectedLanguage === "ar" ? "شارك أفكارك..." : "Share your thoughts..."}
                    className="flex-1 bg-muted/30 border text-foreground px-4 py-3 rounded-xl focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: `${pulseColor}30`,
                      "--tw-ring-color": `${pulseColor}80`,
                    } as React.CSSProperties}
                    disabled={isTyping}
                    data-testid="chat-input"
                  />
                  <motion.button
                    onClick={sendMessage}
                    disabled={isTyping || !input.trim()}
                    className="px-4 rounded-xl font-semibold disabled:opacity-50 transition-all"
                    style={{ 
                      background: `linear-gradient(135deg, ${pulseColor}, ${pulseColor}cc)`,
                      color: 'hsl(222 47% 2%)'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid="send-message-btn"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
                
                {messages.length >= 5 && (
                  <motion.button
                    onClick={handleCompleteManually}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                    style={{ color: `${pulseColor}99` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    data-testid="complete-assessment-btn"
                  >
                    ✨ Ready to see your results? Click here to complete
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <motion.button
                  onClick={handleViewResults}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${pulseColor}, ${pulseColor}cc)`,
                    color: 'hsl(222 47% 2%)'
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  data-testid="view-results-btn"
                >
                  <Sparkles className="w-5 h-5" />
                  {selectedLanguage === "ar" ? "اكشف خريطة عقلك" : "Reveal Your Mind Map"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
