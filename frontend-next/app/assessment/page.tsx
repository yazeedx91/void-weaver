"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import { encryption } from "@/lib/encryption";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AssessmentPage() {
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startAssessment = async () => {
    setLoading(true);
    try {
      const response: any = await apiClient.startAssessment({
        language,
        persona: "al_hakim",
        user_email: "user@example.com", // In production, get from auth
      });

      setSessionId(response.session_id);
      setMessages([
        {
          role: "assistant",
          content: response.initial_message,
          timestamp: new Date(),
        },
      ]);
      setStarted(true);
    } catch (error) {
      console.error("Failed to start assessment:", error);
      alert("Failed to start assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response: any = await apiClient.sendMessage({
        session_id: sessionId,
        message: input,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!started) {
    return (
      <main className=\"min-h-screen bg-obsidian-gradient flex items-center justify-center px-4\">
        <div className=\"max-w-2xl w-full\">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className=\"glass p-12 text-center breathing\"
          >
            <div className=\"text-6xl mb-6\">🧘‍♂️</div>
            <h1 className=\"text-4xl font-bold text-emerald-400 mb-4\">
              Begin Your Assessment
            </h1>
            <p className=\"text-pearl-300 mb-8 text-lg\">
              You are about to meet <span className=\"text-gold font-semibold\">Al-Hakim</span>, 
              your wise guide through the 8-scale psychometric journey.
            </p>

            <div className=\"mb-8\">
              <p className=\"text-pearl-400 mb-4\">Choose your language:</p>
              <div className=\"flex gap-4 justify-center\">
                <button
                  onClick={() => setLanguage(\"en\")}
                  className={`px-8 py-3 rounded-full font-semibold transition-all ${
                    language === \"en\"
                      ? \"bg-emerald-gradient text-white\"
                      : \"glass text-pearl-400\"
                  }`}
                >
                  🇬🇧 English
                </button>
                <button
                  onClick={() => setLanguage(\"ar\")}
                  className={`px-8 py-3 rounded-full font-semibold transition-all ${
                    language === \"ar\"
                      ? \"bg-emerald-gradient text-white\"
                      : \"glass text-pearl-400\"
                  }`}
                >
                  🇸🇦 العربية
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startAssessment}
              disabled={loading}
              className=\"px-12 py-4 bg-emerald-gradient text-white rounded-full font-bold text-lg shadow-2xl animate-glow disabled:opacity-50\"
            >
              {loading ? \"Connecting...\" : \"Meet Al-Hakim\"}
            </motion.button>

            <div className=\"mt-8 pt-8 border-t border-pearl-700\">
              <p className=\"text-pearl-500 text-sm\">
                🔒 Zero-Knowledge Encryption Active
              </p>
              <p className=\"text-pearl-600 text-xs mt-2\">
                Your responses are encrypted before leaving your browser
              </p>
            </div>
          </motion.div>

          <div className=\"text-center mt-6\">
            <Link href=\"/\" className=\"text-emerald-400 hover:text-gold transition-colors\">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className=\"min-h-screen bg-obsidian-gradient\">
      <div className=\"max-w-4xl mx-auto px-4 py-8\">
        {/* Header */}
        <div className=\"glass p-4 mb-6 flex items-center justify-between\">
          <div className=\"flex items-center gap-3\">
            <div className=\"text-3xl\">🧘‍♂️</div>
            <div>
              <h2 className=\"text-xl font-bold text-emerald-400\">Al-Hakim</h2>
              <p className=\"text-pearl-500 text-sm\">The Wise Guide</p>
            </div>
          </div>
          <div className=\"text-right\">
            <div className=\"text-xs text-pearl-500\">🔒 Encrypted</div>
            <div className=\"text-xs text-emerald-400\">{language === \"en\" ? \"English\" : \"العربية\"}</div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className=\"glass p-6 min-h-[500px] max-h-[600px] overflow-y-auto mb-6\">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 flex ${
                message.role === \"user\" ? \"justify-end\" : \"justify-start\"
              }`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.role === \"user\"
                    ? \"bg-emerald-gradient text-white\"
                    : \"bg-pearl-800 bg-opacity-30 text-pearl-100\"
                }`}
              >
                <p className=\"text-sm md:text-base leading-relaxed whitespace-pre-wrap\">
                  {message.content}
                </p>
                <p className=\"text-xs opacity-60 mt-2\">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className=\"flex justify-start\">
              <div className=\"bg-pearl-800 bg-opacity-30 p-4 rounded-2xl\">
                <div className=\"flex gap-2\">
                  <div className=\"w-2 h-2 bg-emerald-400 rounded-full animate-bounce\" />
                  <div className=\"w-2 h-2 bg-emerald-400 rounded-full animate-bounce\" style={{ animationDelay: \"0.2s\" }} />
                  <div className=\"w-2 h-2 bg-emerald-400 rounded-full animate-bounce\" style={{ animationDelay: \"0.4s\" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className=\"glass p-4\">
          <div className=\"flex gap-3\">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={language === "en" ? "Type your response..." : "اكتب إجابتك..."}
              className=\"flex-1 bg-obsidian-light text-pearl-100 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none\"
              rows={3}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className=\"px-8 bg-emerald-gradient text-white rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed\"
            >
              {language === \"en\" ? \"Send\" : \"إرسال\"}
            </button>
          </div>
          <p className=\"text-pearl-600 text-xs mt-3 text-center\">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </main>
  );
}
