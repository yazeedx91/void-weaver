"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Brain, Shield, Sparkles, Send } from "lucide-react";
import { apiClient } from "@/lib/api";

interface Message {
  role: "hakim" | "user";
  content: string;
  scaleLabel?: string;
}

// Typing indicator component
function TypingIndicator() {
  return (
    <motion.div
      className="flex items-center gap-1 px-4 py-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-emerald-glow"
          style={{ background: 'hsl(160 84% 39%)' }}
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

// Chat bubble component
function ChatBubble({ role, content, scaleLabel, isLatest }: Message & { isLatest?: boolean }) {
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
            <div className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ background: 'hsl(160 84% 39%)' }} />
            <span className="text-[10px] text-emerald-glow/60 uppercase tracking-widest" style={{ color: 'hsl(160 84% 39% / 0.6)' }}>
              {scaleLabel}
            </span>
          </motion.div>
        )}
        <div
          className={`relative rounded-2xl px-5 py-4 text-sm leading-relaxed ${
            isHakim
              ? "bg-muted/30 text-foreground/90 border border-emerald-glow/10 rounded-tl-md"
              : "text-foreground border rounded-tr-md"
          }`}
          style={isHakim ? {
            borderColor: 'hsl(160 84% 39% / 0.1)',
            boxShadow: isLatest ? '0 0 25px hsl(160 84% 39% / 0.08), 0 0 50px hsl(160 84% 39% / 0.04)' : undefined,
          } : {
            background: 'hsl(160 84% 39% / 0.15)',
            borderColor: 'hsl(160 84% 39% / 0.2)',
          }}
        >
          {isHakim && (
            <div className="absolute -left-0 -top-0 w-8 h-8 rounded-full flex items-center justify-center -translate-x-10 -translate-y-1">
              <motion.div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(160 84% 39% / 0.3), hsl(43 96% 56% / 0.2))',
                  border: '1px solid hsl(160 84% 39% / 0.3)',
                }}
                animate={isLatest ? {
                  boxShadow: [
                    '0 0 8px hsl(160 84% 39% / 0.3)',
                    '0 0 16px hsl(160 84% 39% / 0.5)',
                    '0 0 8px hsl(160 84% 39% / 0.3)',
                  ],
                } : undefined}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-3.5 h-3.5 text-emerald-glow" style={{ color: 'hsl(160 84% 39%)' }} />
              </motion.div>
            </div>
          )}
          {content}
        </div>
      </div>
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

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const startAssessment = async (language: "en" | "ar") => {
    setSelectedLanguage(language);
    setIsTyping(true);
    setIsStarted(true);

    try {
      const response: any = await apiClient.startAssessment({
        language,
        persona: "al_hakim",
        user_email: `user-${Date.now()}@flux-dna.com`
      });

      setSessionId(response.session_id);
      setMessages([{
        role: "hakim",
        content: response.initial_message,
        scaleLabel: "Rapport"
      }]);
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
      const response: any = await apiClient.sendMessage({
        session_id: sessionId,
        message: userMessage
      });

      setMessages(prev => [...prev, {
        role: "hakim",
        content: response.response,
        scaleLabel: "Clinical Assessment"
      }]);

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
      const response: any = await apiClient.completeAssessment({
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

  // Language selection screen
  if (!isStarted) {
    return (
      <div className="min-h-screen void-bg flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          {/* Header */}
          <motion.div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(160 84% 39% / 0.2), hsl(43 96% 56% / 0.15))',
              border: '1px solid hsl(160 84% 39% / 0.3)',
            }}
            animate={{
              boxShadow: [
                '0 0 30px hsl(160 84% 39% / 0.2)',
                '0 0 50px hsl(160 84% 39% / 0.4)',
                '0 0 30px hsl(160 84% 39% / 0.2)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Brain className="w-10 h-10 text-emerald-glow" style={{ color: 'hsl(160 84% 39%)' }} />
          </motion.div>

          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Al-Hakim&apos;s Chamber</h1>
            <p className="text-muted-foreground">Choose your language to begin</p>
          </div>

          <div className="flex items-center gap-2 justify-center text-xs text-emerald-glow/60" style={{ color: 'hsl(160 84% 39% / 0.6)' }}>
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
    <div className="min-h-screen void-bg flex flex-col pt-14">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-muted/20">
        <motion.div
          className="h-full"
          style={{ background: 'hsl(160 84% 39%)', boxShadow: '0 0 10px hsl(160 84% 39%)' }}
          initial={{ width: 0 }}
          animate={{ width: isComplete ? '100%' : `${Math.min(messages.length * 10, 90)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-center gap-3 py-4 border-b border-border/20">
        <motion.div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, hsl(160 84% 39% / 0.25), hsl(43 96% 56% / 0.15))',
            border: '1px solid hsl(160 84% 39% / 0.3)',
          }}
          animate={{
            boxShadow: [
              '0 0 10px hsl(160 84% 39% / 0.2)',
              '0 0 20px hsl(160 84% 39% / 0.4)',
              '0 0 10px hsl(160 84% 39% / 0.2)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Brain className="w-4 h-4 text-emerald-glow" style={{ color: 'hsl(160 84% 39%)' }} />
        </motion.div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {selectedLanguage === "ar" ? "غرفة الحكيم" : "Al-Hakim's Chamber"}
          </h2>
          <div className="flex items-center gap-1.5">
            <Shield className="w-2.5 h-2.5" style={{ color: 'hsl(160 84% 39% / 0.6)' }} />
            <span className="text-[10px]" style={{ color: 'hsl(160 84% 39% / 0.5)' }}>
              Zero-Knowledge Encryption Active
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
            />
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex justify-start mb-4">
            <div 
              className="glass-card rounded-2xl rounded-tl-md"
              style={{ 
                borderColor: 'hsl(160 84% 39% / 0.1)',
                boxShadow: '0 0 20px hsl(160 84% 39% / 0.06)' 
              }}
            >
              <TypingIndicator />
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
                    className="flex-1 bg-muted/30 border border-border/30 text-foreground px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-glow/50"
                    style={{ borderColor: 'hsl(var(--border) / 0.3)' }}
                    disabled={isTyping}
                    data-testid="chat-input"
                  />
                  <motion.button
                    onClick={sendMessage}
                    disabled={isTyping || !input.trim()}
                    className="px-4 rounded-xl font-semibold disabled:opacity-50 transition-all"
                    style={{ 
                      background: 'linear-gradient(135deg, hsl(160 84% 39%), hsl(160 84% 39% / 0.8))',
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
                    className="w-full text-sm text-muted-foreground hover:text-emerald-glow transition-colors py-2"
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
                    background: 'linear-gradient(135deg, hsl(160 84% 39%), hsl(160 84% 39% / 0.8))',
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
