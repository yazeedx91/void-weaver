import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAssessment } from '@/contexts/AssessmentContext';
import { Brain, Send, Shield, Sparkles } from 'lucide-react';

// --- Clinical conversation flow ---
// Each step has Al-Hakim's message and response options mapped to clinical scales
interface ConversationStep {
  id: string;
  scale: string; // HEXACO, DASS-21, EQ, etc.
  scaleLabel: string;
  messageEn: string;
  messageAr: string;
  options: {
    labelEn: string;
    labelAr: string;
    value: number;
  }[];
}

const conversationFlow: ConversationStep[] = [
  {
    id: 'intro',
    scale: 'rapport',
    scaleLabel: 'Rapport',
    messageEn: "Peace be upon you. I am Al-Hakim — your guardian through this journey. Before we begin, I want you to know: nothing you share here leaves this space. Every word is encrypted the moment you speak it. Tell me… how are you feeling right now, in this moment?",
    messageAr: "السلام عليكم. أنا الحكيم — حارسك في هذه الرحلة. قبل أن نبدأ، أريدك أن تعرف: لا شيء تشاركه هنا يغادر هذا المكان. كل كلمة مشفرة لحظة نطقها. أخبرني... كيف تشعر الآن، في هذه اللحظة؟",
    options: [
      { labelEn: "I feel calm and grounded", labelAr: "أشعر بالهدوء والاستقرار", value: 1 },
      { labelEn: "A mix of curiosity and nervousness", labelAr: "مزيج من الفضول والتوتر", value: 2 },
      { labelEn: "Honestly, I'm struggling", labelAr: "بصراحة، أعاني", value: 3 },
      { labelEn: "I'm not sure — I feel disconnected", labelAr: "لست متأكداً — أشعر بالانفصال", value: 4 },
    ],
  },
  {
    id: 'hexaco-1',
    scale: 'HEXACO',
    scaleLabel: 'Honesty-Humility',
    messageEn: "Thank you for your honesty. That takes courage. Let me ask you something deeper… When you succeed at something, what's your first instinct?",
    messageAr: "شكراً لصراحتك. هذا يتطلب شجاعة. دعني أسألك شيئاً أعمق... عندما تنجح في شيء ما، ما هو أول شعور يراودك؟",
    options: [
      { labelEn: "I feel grateful and want to share the credit", labelAr: "أشعر بالامتنان وأريد مشاركة الفضل", value: 5 },
      { labelEn: "I feel proud but stay humble about it", labelAr: "أشعر بالفخر لكن أبقى متواضعاً", value: 4 },
      { labelEn: "I want everyone to know what I achieved", labelAr: "أريد أن يعرف الجميع ما حققته", value: 2 },
      { labelEn: "I deserve it — I worked hard for this", labelAr: "أستحق ذلك — عملت بجد لهذا", value: 1 },
    ],
  },
  {
    id: 'hexaco-2',
    scale: 'HEXACO',
    scaleLabel: 'Agreeableness',
    messageEn: "Interesting. Your relationship with success says a lot about your inner compass. Now… when someone close to you does something that upsets you, what do you typically do?",
    messageAr: "مثير للاهتمام. علاقتك بالنجاح تقول الكثير عن بوصلتك الداخلية. الآن... عندما يفعل شخص قريب منك شيئاً يزعجك، ماذا تفعل عادةً؟",
    options: [
      { labelEn: "I forgive quickly — holding grudges hurts me more", labelAr: "أسامح بسرعة — الضغينة تؤذيني أكثر", value: 5 },
      { labelEn: "I try to understand their perspective first", labelAr: "أحاول فهم وجهة نظرهم أولاً", value: 4 },
      { labelEn: "I confront them directly about it", labelAr: "أواجههم مباشرة بشأن ذلك", value: 2 },
      { labelEn: "I withdraw and process it alone", labelAr: "أنسحب وأعالجها وحدي", value: 3 },
    ],
  },
  {
    id: 'dass-1',
    scale: 'DASS-21',
    scaleLabel: 'Depression',
    messageEn: "You navigate relationships with real awareness. Let's shift gently — I want to understand your inner weather. Over the past two weeks, how often have you felt that life lacked meaning or purpose?",
    messageAr: "تتعامل مع العلاقات بوعي حقيقي. دعنا ننتقل بلطف — أريد أن أفهم طقسك الداخلي. خلال الأسبوعين الماضيين، كم مرة شعرت أن الحياة تفتقر إلى المعنى أو الهدف؟",
    options: [
      { labelEn: "Rarely or never — I feel purposeful", labelAr: "نادراً أو أبداً — أشعر بالهدف", value: 0 },
      { labelEn: "Sometimes — it comes in waves", labelAr: "أحياناً — يأتي على موجات", value: 1 },
      { labelEn: "Often — more days than not", labelAr: "كثيراً — أغلب الأيام", value: 2 },
      { labelEn: "Almost always — it's a constant weight", labelAr: "دائماً تقريباً — ثقل مستمر", value: 3 },
    ],
  },
  {
    id: 'dass-2',
    scale: 'DASS-21',
    scaleLabel: 'Anxiety',
    messageEn: "I hear you, and I want you to know — whatever you're carrying, it's valid. Now tell me… do you experience sudden rushes of anxiety or panic that seem to come from nowhere?",
    messageAr: "أسمعك، وأريدك أن تعرف — مهما كنت تحمله، فهو مشروع. الآن أخبرني... هل تمر بموجات مفاجئة من القلق أو الذعر تبدو وكأنها تأتي من العدم؟",
    options: [
      { labelEn: "No, I feel generally calm", labelAr: "لا، أشعر بالهدوء عموماً", value: 0 },
      { labelEn: "Occasionally, but I can manage them", labelAr: "أحياناً، لكن أستطيع التعامل معها", value: 1 },
      { labelEn: "Frequently — my body tenses up without warning", labelAr: "كثيراً — جسمي يتوتر بدون إنذار", value: 2 },
      { labelEn: "Yes, it's overwhelming and constant", labelAr: "نعم، إنه ساحق ومستمر", value: 3 },
    ],
  },
  {
    id: 'dass-3',
    scale: 'DASS-21',
    scaleLabel: 'Stress',
    messageEn: "Your awareness of your body's signals is a strength, not a weakness. One more thing… when pressure builds in your life, how does it show up for you?",
    messageAr: "وعيك بإشارات جسمك قوة وليس ضعفاً. شيء آخر... عندما يتراكم الضغط في حياتك، كيف يظهر عليك؟",
    options: [
      { labelEn: "I stay focused and push through", labelAr: "أبقى مركزاً وأتجاوز", value: 0 },
      { labelEn: "I get irritable but recover quickly", labelAr: "أصبح عصبياً لكن أتعافى بسرعة", value: 1 },
      { labelEn: "I feel scattered — can't think clearly", labelAr: "أشعر بالتشتت — لا أستطيع التفكير بوضوح", value: 2 },
      { labelEn: "I shut down completely", labelAr: "أنغلق تماماً", value: 3 },
    ],
  },
  {
    id: 'eq-1',
    scale: 'EQ',
    scaleLabel: 'Empathy',
    messageEn: "You're doing beautifully. Let's explore how you connect with others. When you see someone crying — even a stranger — what happens inside you?",
    messageAr: "أنت رائع. دعنا نستكشف كيف تتواصل مع الآخرين. عندما ترى شخصاً يبكي — حتى لو كان غريباً — ماذا يحدث بداخلك؟",
    options: [
      { labelEn: "I feel their pain deeply — it moves me", labelAr: "أشعر بألمهم بعمق — يؤثر فيّ", value: 5 },
      { labelEn: "I feel compassion and want to help", labelAr: "أشعر بالتعاطف وأريد المساعدة", value: 4 },
      { labelEn: "I notice it but stay emotionally detached", labelAr: "ألاحظه لكن أبقى منفصلاً عاطفياً", value: 2 },
      { labelEn: "I tend to look away — it's uncomfortable", labelAr: "أميل للنظر بعيداً — إنه مزعج", value: 1 },
    ],
  },
  {
    id: 'eq-2',
    scale: 'EQ',
    scaleLabel: 'Self-Regulation',
    messageEn: "Your emotional depth is a gift. Final question… when you feel a strong negative emotion — anger, jealousy, sadness — how do you handle it?",
    messageAr: "عمقك العاطفي هبة. سؤال أخير... عندما تشعر بعاطفة سلبية قوية — غضب، غيرة، حزن — كيف تتعامل معها؟",
    options: [
      { labelEn: "I name it, sit with it, and let it pass", labelAr: "أسميها، أجلس معها، وأتركها تمر", value: 5 },
      { labelEn: "I try to redirect my energy — exercise, create", labelAr: "أحاول توجيه طاقتي — رياضة، إبداع", value: 4 },
      { labelEn: "I suppress it until I can deal with it later", labelAr: "أكبتها حتى أتعامل معها لاحقاً", value: 2 },
      { labelEn: "It controls me — I react before I think", labelAr: "تسيطر عليّ — أتصرف قبل أن أفكر", value: 1 },
    ],
  },
];

// --- Typing indicator ---
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

// --- Chat bubble ---
interface ChatBubbleProps {
  role: 'hakim' | 'user';
  text: string;
  scaleLabel?: string;
  isLatest?: boolean;
}

function ChatBubble({ role, text, scaleLabel, isLatest }: ChatBubbleProps) {
  const isHakim = role === 'hakim';

  return (
    <motion.div
      className={`flex ${isHakim ? 'justify-start' : 'justify-end'} mb-4`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className={`max-w-[85%] sm:max-w-[75%] ${isHakim ? '' : ''}`}>
        {isHakim && scaleLabel && (
          <motion.div
            className="flex items-center gap-1.5 mb-1.5 px-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-glow animate-pulse-glow" />
            <span className="text-[10px] text-emerald-glow/60 font-body uppercase tracking-widest">
              {scaleLabel}
            </span>
          </motion.div>
        )}
        <div
          className={`relative rounded-2xl px-5 py-4 font-body text-sm leading-relaxed ${
            isHakim
              ? 'bg-muted/30 text-foreground/90 border border-emerald-glow/10 rounded-tl-md'
              : 'bg-emerald-glow/15 text-foreground border border-emerald-glow/20 rounded-tr-md'
          }`}
          style={
            isHakim && isLatest
              ? {
                  boxShadow: '0 0 25px hsl(160 84% 39% / 0.08), 0 0 50px hsl(160 84% 39% / 0.04)',
                }
              : undefined
          }
        >
          {isHakim && (
            <div className="absolute -left-0 -top-0 w-8 h-8 rounded-full flex items-center justify-center -translate-x-10 -translate-y-1">
              <motion.div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--emerald-glow) / 0.3), hsl(var(--gold-glow) / 0.2))',
                  border: '1px solid hsl(var(--emerald-glow) / 0.3)',
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
                <Brain className="w-3.5 h-3.5 text-emerald-glow" />
              </motion.div>
            </div>
          )}
          {text}
        </div>
      </div>
    </motion.div>
  );
}

// --- Main Chamber Page ---
export default function HakimChamber() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { setStage, addAnswer } = useAssessment();

  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<{ role: 'hakim' | 'user'; text: string; scaleLabel?: string }[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping, showOptions]);

  // Show first message on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const step = conversationFlow[0];
      setMessages([{
        role: 'hakim',
        text: lang === 'ar' ? step.messageAr : step.messageEn,
        scaleLabel: step.scaleLabel,
      }]);
      setIsTyping(false);
      setTimeout(() => setShowOptions(true), 400);
    }, 1500);
    return () => clearTimeout(timer);
  }, [lang]);

  const handleOptionSelect = useCallback((optionIndex: number) => {
    const step = conversationFlow[currentStep];
    const option = step.options[optionIndex];

    // Add user message
    const userText = lang === 'ar' ? option.labelAr : option.labelEn;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setShowOptions(false);

    // Record answer
    addAnswer({
      questionId: step.id,
      value: option.value,
      label: userText,
    });

    const nextStep = currentStep + 1;

    if (nextStep >= conversationFlow.length) {
      // Assessment complete
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'hakim',
          text: lang === 'ar'
            ? "شكراً لك على هذه الرحلة معي. لقد أظهرت شجاعة حقيقية. نتائجك جاهزة الآن — اسمح لي أن أكشف لك خريطة عقلك الفريدة."
            : "Thank you for this journey with me. You've shown real courage. Your results are ready now — allow me to reveal the unique map of your mind.",
          scaleLabel: 'Complete',
        }]);
        setIsTyping(false);
        setIsComplete(true);
      }, 2000);
    } else {
      // Next question
      setCurrentStep(nextStep);
      setIsTyping(true);
      setTimeout(() => {
        const next = conversationFlow[nextStep];
        setMessages(prev => [...prev, {
          role: 'hakim',
          text: lang === 'ar' ? next.messageAr : next.messageEn,
          scaleLabel: next.scaleLabel,
        }]);
        setIsTyping(false);
        setTimeout(() => setShowOptions(true), 400);
      }, 1500 + Math.random() * 1000);
    }
  }, [currentStep, lang, addAnswer]);

  const handleViewResults = () => {
    setStage('generating');
    navigate('/generating');
  };

  // Progress through scales
  const scaleColors: Record<string, string> = {
    'rapport': 'bg-emerald-glow',
    'HEXACO': 'bg-primary',
    'DASS-21': 'bg-crimson-glow',
    'EQ': 'bg-teal-glow',
  };
  const currentScale = currentStep < conversationFlow.length ? conversationFlow[currentStep].scale : 'Complete';
  const progress = ((currentStep) / conversationFlow.length) * 100;

  return (
    <div className="min-h-screen flex flex-col pt-14">
      {/* Progress bar */}
      <div className="fixed top-12 left-0 right-0 z-40 h-1 bg-muted/20">
        <motion.div
          className={`h-full ${scaleColors[currentScale] || 'bg-emerald-glow'}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          style={{ boxShadow: '0 0 10px currentColor' }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-center gap-3 py-4 border-b border-border/20">
        <motion.div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--emerald-glow) / 0.25), hsl(var(--gold-glow) / 0.15))',
            border: '1px solid hsl(var(--emerald-glow) / 0.3)',
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
          <Brain className="w-4 h-4 text-emerald-glow" />
        </motion.div>
        <div>
          <h2 className="text-sm font-display font-semibold text-foreground">
            {lang === 'ar' ? 'غرفة الحكيم' : "Al-Hakim's Chamber"}
          </h2>
          <div className="flex items-center gap-1.5">
            <Shield className="w-2.5 h-2.5 text-emerald-glow/60" />
            <span className="text-[10px] text-emerald-glow/50 font-body">
              {t('hero.encryption')}
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
              text={msg.text}
              scaleLabel={msg.role === 'hakim' ? msg.scaleLabel : undefined}
              isLatest={msg.role === 'hakim' && i === messages.length - 1 && !isTyping}
            />
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex justify-start mb-4" style={{ paddingLeft: 0 }}>
            <div className="glass-card rounded-2xl rounded-tl-md border border-emerald-glow/10"
              style={{ boxShadow: '0 0 20px hsl(160 84% 39% / 0.06)' }}
            >
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      {/* Options / Input area */}
      <div className="border-t border-border/20 bg-background/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <AnimatePresence mode="wait">
            {showOptions && !isComplete && currentStep < conversationFlow.length && (
              <motion.div
                key={`options-${currentStep}`}
                className="grid grid-cols-1 gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {conversationFlow[currentStep].options.map((option, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleOptionSelect(i)}
                    className="text-left px-4 py-3 rounded-xl font-body text-sm text-foreground/80 border border-border/30 hover:border-emerald-glow/40 hover:bg-emerald-glow/5 transition-all duration-200 relative overflow-hidden group"
                    initial={{ opacity: 0, x: lang === 'ar' ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">
                      {lang === 'ar' ? option.labelAr : option.labelEn}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-emerald-glow/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </motion.button>
                ))}
              </motion.div>
            )}

            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <motion.button
                  onClick={handleViewResults}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-display font-semibold text-background"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--emerald-glow)), hsl(var(--emerald-glow) / 0.8))',
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Sparkles className="w-5 h-5" />
                  {lang === 'ar' ? 'اكشف خريطة عقلك' : 'Reveal Your Mind Map'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
