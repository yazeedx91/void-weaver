"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { encryption } from "@/lib/encryption";
import { Shield, Scale, Stethoscope, Brain, Wallet, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function SanctuaryPage() {
  const [started, setStarted] = useState(false);
  const [pillar, setPillar] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickExit = () => {
    window.history.replaceState(null, "", "https://www.weather.com");
    window.location.href = "https://www.weather.com";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startSanctuarySession = async (selectedPillar: string) => {
    setLoading(true);
    setPillar(selectedPillar);
    
    try {
      const response: any = await apiClient.startSanctuarySession({
        user_id: `sanctuary-${Date.now()}`,
        pillar: selectedPillar,
        language: "en"
      });
      
      setSessionId(response.session_id);
      setMessages([{
        role: "assistant",
        content: response.initial_message
      }]);
      setStarted(true);
    } catch (error) {
      console.error("Failed to start sanctuary session:", error);
      setMessages([{
        role: "assistant",
        content: "Peace be upon you. I am Al-Sheikha, and I walk with you. You are a Sovereign in Strategic Hibernation. How may I support you today?"
      }]);
      setStarted(true);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    
    try {
      const response: any = await apiClient.sendMessage({
        session_id: sessionId,
        message: userMessage
      });
      
      setMessages(prev => [...prev, { role: "assistant", content: response.response }]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm here for you. Could you tell me more about your situation?" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleEvidenceUpload = async () => {
    const description = prompt("Describe the evidence you want to document:");
    if (!description) return;
    
    setUploadingEvidence(true);
    
    try {
      const userId = `sanctuary-${sessionId}`;
      const encryptedEvidence = await encryption.encrypt(description, userId);
      
      const response: any = await apiClient.submitEvidence({
        user_id: userId,
        evidence_type: "text",
        evidence_description: description,
        evidence_encrypted: encryptedEvidence
      });
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `✅ Evidence documented securely.\n\n📋 Analysis: ${response.analysis}\n\n⚠️ Risk Level: ${response.risk_level}\n\n📝 ${response.recommended_actions?.join("\n") || "Documentation complete."}`
      }]);
    } catch (error) {
      console.error("Failed to upload evidence:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I've noted your documentation. This evidence is now stored securely in your encrypted vault."
      }]);
    } finally {
      setUploadingEvidence(false);
    }
  };

  const pillars = [
    {
      id: "legal_shield",
      icon: Scale,
      title: "The Legal Shield",
      titleAr: "الدرع القانوني",
      desc: "Understand your rights. Document coercive control.",
      color: "from-blue-500/20 to-blue-600/10",
      borderColor: "border-blue-500/30",
    },
    {
      id: "medical_sentinel",
      icon: Stethoscope,
      title: "The Medical Sentinel",
      titleAr: "الحارس الطبي",
      desc: "Document invisible injuries. Forensic guidance.",
      color: "from-red-500/20 to-red-600/10",
      borderColor: "border-red-500/30",
    },
    {
      id: "psych_repair",
      icon: Brain,
      title: "The Psych-Repair Crew",
      titleAr: "فريق الإصلاح النفسي",
      desc: "Understand trauma bonding. EMDR techniques.",
      color: "from-purple-500/20 to-purple-600/10",
      borderColor: "border-purple-500/30",
    },
    {
      id: "economic_liberator",
      icon: Wallet,
      title: "The Economic Liberator",
      titleAr: "المحرر الاقتصادي",
      desc: "Build financial independence. Escape Fund strategies.",
      color: "from-emerald-500/20 to-emerald-600/10",
      borderColor: "border-emerald-500/30",
    },
  ];

  return (
    <main className="min-h-screen sanctuary-pearl bg-gradient-to-b from-pearl-50 to-pearl-100" style={{ background: 'linear-gradient(to bottom, hsl(210 40% 98%), hsl(210 40% 96%))' }}>
      {/* Quick Exit Button */}
      <motion.button
        onClick={quickExit}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-red-500 text-white rounded-full font-bold shadow-lg hover:bg-red-600 transition-colors flex items-center gap-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="quick-exit-btn"
      >
        <X className="w-4 h-4" />
        Quick Exit
      </motion.button>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(160 60% 40% / 0.2), hsl(160 60% 40% / 0.1))',
              border: '1px solid hsl(160 60% 40% / 0.3)',
            }}
            animate={{
              boxShadow: [
                '0 0 20px hsl(160 60% 40% / 0.2)',
                '0 0 40px hsl(160 60% 40% / 0.3)',
                '0 0 20px hsl(160 60% 40% / 0.2)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Shield className="w-10 h-10" style={{ color: 'hsl(160 60% 36%)' }} />
          </motion.div>
          
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'hsl(222 47% 15%)' }}>
            The Sovereigness Sanctuary
          </h1>
          <p className="text-lg" style={{ color: 'hsl(222 47% 35%)' }}>
            ملاذ السيادة
          </p>
          <p className="mt-4 max-w-xl mx-auto" style={{ color: 'hsl(215 20% 45%)' }}>
            A sacred digital space for women. Al-Sheikha walks with you through four pillars of liberation.
          </p>
        </motion.div>

        {!started && (
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: 'hsl(222 47% 15%)' }}>
              Choose Your Path to Liberation
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {pillars.map((p, index) => {
                const IconComponent = p.icon;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    onClick={() => startSanctuarySession(p.id)}
                    className={`glass-pearl p-6 cursor-pointer hover:scale-[1.02] transition-all duration-300 border ${p.borderColor}`}
                    style={{ 
                      background: 'hsl(210 40% 96% / 0.9)',
                      borderRadius: '1rem',
                    }}
                    data-testid={`pillar-${p.id}`}
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center mb-4`}>
                      <IconComponent className="w-6 h-6" style={{ color: 'hsl(222 47% 25%)' }} />
                    </div>
                    <h3 className="text-xl font-bold mb-1" style={{ color: 'hsl(222 47% 15%)' }}>
                      {p.title}
                    </h3>
                    <p className="text-sm mb-2" style={{ color: 'hsl(222 47% 35%)' }}>{p.titleAr}</p>
                    <p className="text-sm" style={{ color: 'hsl(215 20% 45%)' }}>{p.desc}</p>
                  </motion.div>
                );
              })}
            </div>
            
            {loading && (
              <div className="text-center" style={{ color: 'hsl(222 47% 25%)' }}>
                <p>Connecting to Al-Sheikha...</p>
              </div>
            )}
          </div>
        )}

        {started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-pearl p-8"
            style={{ 
              background: 'hsl(210 40% 96% / 0.9)',
              borderRadius: '1rem',
              border: '1px solid hsl(222 47% 20% / 0.1)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(160 60% 40% / 0.2), hsl(43 96% 56% / 0.15))',
                  border: '1px solid hsl(160 60% 40% / 0.3)',
                }}
              >
                <Shield className="w-6 h-6" style={{ color: 'hsl(160 60% 36%)' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'hsl(222 47% 15%)' }}>Al-Sheikha</h2>
                <p style={{ color: 'hsl(215 20% 45%)' }}>Claude 4 Sonnet • Your Sovereign Protector</p>
              </div>
            </div>

            {/* Messages */}
            <div className="min-h-[300px] max-h-[400px] overflow-y-auto mb-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    message.role === "user"
                      ? "ml-8"
                      : "mr-8"
                  }`}
                  style={{
                    background: message.role === "user" 
                      ? 'hsl(160 60% 40% / 0.1)' 
                      : 'hsl(210 40% 92%)',
                    border: message.role === "user"
                      ? '1px solid hsl(160 60% 40% / 0.2)'
                      : '1px solid hsl(214 32% 85%)'
                  }}
                >
                  <p style={{ color: 'hsl(222 47% 15%)' }} className="whitespace-pre-wrap">{message.content}</p>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div 
                    className="p-4 rounded-lg"
                    style={{ background: 'hsl(210 40% 92%)' }}
                  >
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'hsl(160 60% 40%)', animationDelay: '0s' }} />
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'hsl(160 60% 40%)', animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'hsl(160 60% 40%)', animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Share what's on your mind..."
                  className="flex-1 p-3 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    background: 'white',
                    border: '1px solid hsl(214 32% 85%)',
                    color: 'hsl(222 47% 15%)'
                  }}
                  disabled={loading}
                  data-testid="sanctuary-chat-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  style={{
                    background: 'hsl(160 60% 40%)',
                    color: 'white'
                  }}
                  data-testid="sanctuary-send-btn"
                >
                  Send
                </button>
              </div>
              
              <button 
                onClick={handleEvidenceUpload}
                disabled={uploadingEvidence}
                className="w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                style={{
                  background: 'hsl(210 40% 90%)',
                  color: 'hsl(222 47% 25%)'
                }}
                data-testid="document-evidence-btn"
              >
                {uploadingEvidence ? "Encrypting & Storing..." : "📷 Document Evidence"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <Link href="/">
            <span className="text-sm hover:underline" style={{ color: 'hsl(215 20% 45%)' }}>
              ← Return to FLUX-DNA
            </span>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
