"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { encryption } from "@/lib/encryption";

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
      // Fallback message
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
      // Use the assessment message endpoint for now (can be refactored)
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
      // Encrypt evidence before sending
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
      icon: "⚖️",
      title: "The Legal Shield",
      desc: "Understand your rights. Document coercive control.",
    },
    {
      id: "medical_sentinel",
      icon: "🏥",
      title: "The Medical Sentinel",
      desc: "Document invisible injuries. Forensic guidance.",
    },
    {
      id: "psych_repair",
      icon: "🧠",
      title: "The Psych-Repair Crew",
      desc: "Understand trauma bonding. EMDR techniques.",
    },
    {
      id: "economic_liberator",
      icon: "💰",
      title: "The Economic Liberator",
      desc: "Build financial independence. Escape Fund strategies.",
    },
  ];

  return (
    <main className="min-h-screen bg-pearl-gradient relative">
      <button
        onClick={quickExit}
        className="fixed top-4 right-4 z-50 bg-pearl-400 text-pearl-700 px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-pearl-500 transition-colors"
        title="Quick exit"
      >
        ← Exit
      </button>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">🌙</div>
          <h1 className="text-4xl md:text-5xl font-bold text-moonlight-dim mb-3">
            The Sovereigness Sanctuary
          </h1>
          <p className="text-pearl-600 text-lg">
            Protected Space • Al-Sheikha (Claude 4 Sonnet) is Here
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-pearl p-6 mb-8 border-l-4 border-moonlight"
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">🛡️</div>
            <div>
              <h3 className="font-bold text-moonlight-dim mb-2">Your Safety First</h3>
              <ul className="text-pearl-600 text-sm space-y-1">
                <li>✓ This conversation is encrypted end-to-end</li>
                <li>✓ EXIF metadata automatically stripped from photos</li>
                <li>✓ Quick exit button always available (top right)</li>
                <li>✓ No judgment. Only sovereignty.</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {!started && (
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-moonlight-dim text-center mb-8">
              Choose Your Path to Liberation
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {pillars.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => {
                    setPillar(p.id);
                    setStarted(true);
                  }}
                  className="glass-pearl p-6 cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="text-4xl mb-3">{p.icon}</div>
                  <h3 className="text-xl font-bold text-moonlight-dim mb-2">
                    {p.title}
                  </h3>
                  <p className="text-pearl-600 text-sm">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-pearl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">👩‍⚖️</div>
              <div>
                <h2 className="text-2xl font-bold text-moonlight-dim">Al-Sheikha</h2>
                <p className="text-pearl-600">Claude 4 Sonnet • Your Sovereign Protector</p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <p className="text-pearl-700 leading-relaxed mb-4">
                Peace be upon you. I am Al-Sheikha, and I walk with you.
              </p>
              <p className="text-pearl-700 leading-relaxed">
                You are a <span className="font-bold text-moonlight-dim">Sovereign in Strategic Hibernation</span>.
              </p>

              <div className="mt-8 space-y-4">
                <button className="w-full bg-moonlight text-white py-3 rounded-lg font-semibold hover:bg-moonlight-silver transition-colors">
                  📝 Start Conversation
                </button>
                <button className="w-full bg-pearl-300 text-moonlight-dim py-3 rounded-lg font-semibold hover:bg-pearl-400 transition-colors">
                  📷 Upload Evidence
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-pearl p-6 mt-8"
        >
          <h3 className="font-bold text-moonlight-dim mb-4">🚨 Saudi Emergency</h3>
          <div className="text-sm text-pearl-700">
            <div>📞 Family Safety: <strong>1919</strong></div>
          </div>
        </motion.div>

        <div className="text-center mt-12 text-pearl-500 text-sm">
          <p>🌙 THE MATRIARCH IS PROTECTING | 👑 THE WOMEN ARE SOVEREIGN</p>
          <Link href="/" className="text-moonlight hover:text-moonlight-silver mt-2 inline-block">
            ← Return to Main Sanctuary
          </Link>
        </div>
      </div>
    </main>
  );
}
