import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAssessment } from '@/contexts/AssessmentContext';
import { Brain, Send, Shield, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hakim-chat`;

async function streamChat({
  messages,
  lang,
  onDelta,
  onDone,
}: {
  messages: Msg[];
  lang: string;
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, lang }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${resp.status}`);
  }

  if (!resp.body) throw new Error('No response body');

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') { streamDone = true; break; }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }

  // flush remaining
  if (buffer.trim()) {
    for (let raw of buffer.split('\n')) {
      if (!raw) continue;
      if (raw.endsWith('\r')) raw = raw.slice(0, -1);
      if (raw.startsWith(':') || raw.trim() === '') continue;
      if (!raw.startsWith('data: ')) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

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
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </motion.div>
  );
}

// --- Chat bubble ---
interface ChatBubbleProps {
  role: 'assistant' | 'user';
  text: string;
  isLatest?: boolean;
}

function ChatBubble({ role, text, isLatest }: ChatBubbleProps) {
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
              ? 'bg-muted/30 text-foreground/90 border border-emerald-glow/10 rounded-tl-md'
              : 'bg-emerald-glow/15 text-foreground border border-emerald-glow/20 rounded-tr-md'
          }`}
          style={
            isHakim && isLatest
              ? { boxShadow: '0 0 25px hsl(160 84% 39% / 0.08), 0 0 50px hsl(160 84% 39% / 0.04)' }
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
  const { setStage } = useAssessment();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [exchangeCount, setExchangeCount] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Send a message to the AI and stream the response
  const sendToHakim = useCallback(async (allMessages: Msg[]) => {
    setIsTyping(true);
    let assistantSoFar = '';

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: allMessages,
        lang,
        onDelta: upsertAssistant,
        onDone: () => {
          setIsTyping(false);
          // Check if assessment is complete
          if (assistantSoFar.includes('[ASSESSMENT_COMPLETE]')) {
            // Clean the marker from the displayed message
            setMessages(prev => prev.map((m, i) =>
              i === prev.length - 1
                ? { ...m, content: m.content.replace('[ASSESSMENT_COMPLETE]', '').trim() }
                : m
            ));
            setIsComplete(true);
          }
        },
      });
    } catch (e) {
      setIsTyping(false);
      console.error('Hakim chat error:', e);
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: e instanceof Error ? e.message : 'Failed to connect to Al-Hakim',
        variant: 'destructive',
      });
    }
  }, [lang]);

  // Initial greeting
  useEffect(() => {
    const greeting: Msg[] = [];
    sendToHakim(greeting);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isTyping || isComplete) return;

    const userMsg: Msg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setExchangeCount(prev => prev + 1);

    sendToHakim(newMessages);
  }, [inputValue, isTyping, isComplete, messages, sendToHakim]);

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

  const progress = Math.min((exchangeCount / 8) * 100, 100);

  return (
    <div className="min-h-screen flex flex-col pt-14">
      {/* Progress bar */}
      <div className="fixed top-12 left-0 right-0 z-40 h-1 bg-muted/20">
        <motion.div
          className="h-full bg-emerald-glow"
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
              text={msg.content}
              isLatest={msg.role === 'assistant' && i === messages.length - 1 && !isTyping}
            />
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex justify-start mb-4">
            <div
              className="glass-card rounded-2xl rounded-tl-md border border-emerald-glow/10"
              style={{ boxShadow: '0 0 20px hsl(160 84% 39% / 0.06)' }}
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
            {isComplete ? (
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
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={lang === 'ar' ? 'اكتب ردك هنا...' : 'Type your response...'}
                  disabled={isTyping}
                  className="flex-1 px-4 py-3 rounded-xl bg-secondary/40 border border-border/30 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all disabled:opacity-50"
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={isTyping || !inputValue.trim()}
                  className="p-3 rounded-xl bg-accent text-accent-foreground disabled:opacity-30 transition-opacity"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
