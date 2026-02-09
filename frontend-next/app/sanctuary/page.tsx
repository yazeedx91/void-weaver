"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { apiClient } from "@/lib/api";
import Link from "next/link";

export default function SanctuaryPage() {
  const [started, setStarted] = useState(false);
  const [pillar, setPillar] = useState<string>("");
  const [showQuickExit, setShowQuickExit] = useState(true);

  const quickExit = () => {
    // Clear history and redirect to innocent site
    window.history.replaceState(null, "", "https://www.weather.com");
    window.location.href = "https://www.weather.com";
  };

  const pillars = [
    {
      id: "legal_shield",
      icon: "⚖️",
      title: "The Legal Shield",
      desc: "Understand your rights. Document coercive control. IDVA & attorney logic for Saudi law.",
    },
    {
      id: "medical_sentinel",
      icon: "🏥",
      title: "The Medical Sentinel",
      desc: "Document invisible injuries. Screen for trauma-related health issues. Forensic medicine guidance.",
    },
    {
      id: "psych_repair",
      icon: "🧠",
      title: "The Psych-Repair Crew",
      desc: "Understand trauma bonding as chemistry, not weakness. EMDR & C-PTSD somatic techniques.",
    },
    {
      id: "economic_liberator",
      icon: "💰",
      title: "The Economic Liberator",
      desc: "Shadow banking strategies. Build an 'Escape Fund' undetectable by banking apps.",
    },
  ];

  return (
    <main className=\"min-h-screen bg-pearl-gradient relative\">
      {/* Quick Exit Button - ALWAYS VISIBLE */}
      {showQuickExit && (
        <motion.button
          initial={{ x: 100 }}
          animate={{ x: 0 }}
          onClick={quickExit}
          className=\"fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:bg-red-600 transition-colors\"
          title=\"Quick exit to weather.com\"
        >
          ⚠️ QUICK EXIT
        </motion.button>
      )}

      <div className=\"max-w-4xl mx-auto px-4 py-12\">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className=\"text-center mb-12\"
        >
          <div className=\"text-6xl mb-4\">🌙</div>
          <h1 className=\"text-4xl md:text-5xl font-bold text-moonlight-dim mb-3\">
            The Sovereigness Sanctuary
          </h1>
          <p className=\"text-pearl-600 text-lg\">
            Protected Space for Women • Al-Sheikha is Here
          </p>
        </motion.div>

        {/* Safety Notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className=\"glass-pearl p-6 mb-8 border-l-4 border-moonlight\"
        >
          <div className=\"flex items-start gap-3\">
            <div className=\"text-3xl\">🛡️</div>
            <div>
              <h3 className=\"font-bold text-moonlight-dim mb-2\">Your Safety First</h3>
              <ul className=\"text-pearl-600 text-sm space-y-1\">
                <li>✓ This conversation is encrypted end-to-end</li>
                <li>✓ EXIF metadata automatically stripped from photos</li>
                <li>✓ Quick exit button always available (top right)</li>
                <li>✓ No judgment. No victim-blaming. Only sovereignty.</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* The 4 Pillars */}
        {!started && (
          <div className=\"space-y-6 mb-12\">
            <h2 className=\"text-2xl font-bold text-moonlight-dim text-center mb-8\">
              Choose Your Path to Liberation
            </h2>

            <div className=\"grid md:grid-cols-2 gap-6\">
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
                  className=\"glass-pearl p-6 cursor-pointer hover:scale-105 transition-transform hover:shadow-xl\"
                >
                  <div className=\"text-4xl mb-3\">{p.icon}</div>
                  <h3 className=\"text-xl font-bold text-moonlight-dim mb-2\">
                    {p.title}
                  </h3>
                  <p className=\"text-pearl-600 text-sm\">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Active Sanctuary Session */}
        {started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className=\"glass-pearl p-8\"
          >
            <div className=\"flex items-center gap-3 mb-6\">
              <div className=\"text-4xl\">👩‍⚖️</div>
              <div>
                <h2 className=\"text-2xl font-bold text-moonlight-dim\">Al-Sheikha</h2>
                <p className=\"text-pearl-600\">Your Sovereign Protector</p>
              </div>
            </div>

            <div className=\"prose prose-slate max-w-none\">
              <p className=\"text-pearl-700 leading-relaxed\">
                Peace be upon you, my sister. I am Al-Sheikha, and I walk with you through this shadow.
              </p>
              <p className=\"text-pearl-700 leading-relaxed mt-4\">
                You are not here because you are weak. You are here because you are a{\" \"}
                <span className=\"font-bold text-moonlight-dim\">Sovereign in Strategic Hibernation</span>.
              </p>

              <div className=\"bg-moonlight bg-opacity-20 p-4 rounded-lg mt-6\">
                <p className=\"text-sm text-pearl-600 mb-2\">
                  <strong>This space is for:</strong>
                </p>
                <ul className=\"text-sm text-pearl-600 space-y-1\">
                  <li>📋 Documenting coercive control for legal use</li>
                  <li>🏥 Understanding invisible injuries (strangulation, TBI)</li>
                  <li>💭 Breaking trauma bonding patterns</li>
                  <li>💰 Building financial independence strategies</li>
                  <li>📷 Uploading evidence (photos, recordings, texts)</li>
                </ul>
              </div>

              <div className=\"mt-8 space-y-4\">
                <button className=\"w-full bg-moonlight text-white py-3 rounded-lg font-semibold hover:bg-moonlight-silver transition-colors\">
                  📝 Start Conversation with Al-Sheikha
                </button>
                <button className=\"w-full bg-pearl-300 text-moonlight-dim py-3 rounded-lg font-semibold hover:bg-pearl-400 transition-colors\">
                  📷 Upload Evidence (Auto-Strips Location)
                </button>
                <button className=\"w-full border-2 border-moonlight text-moonlight-dim py-3 rounded-lg font-semibold hover:bg-pearl-100 transition-colors\">
                  📞 Saudi Emergency Resources
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Emergency Resources */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className=\"glass-pearl p-6 mt-8\"
        >
          <h3 className=\"font-bold text-moonlight-dim mb-4\">🚨 Saudi Emergency Contacts</h3>
          <div className=\"space-y-2 text-sm text-pearl-700\">
            <div>📞 National Family Safety Program: <strong className=\"text-moonlight-dim\">1919</strong></div>
            <div>🏛️ Ministry of Human Resources: Available 24/7</div>
            <div>⚖️ Women's Rights Association: Legal support</div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className=\"text-center mt-12 text-pearl-500 text-sm\">
          <p>🌙 THE MATRIARCH IS PROTECTING | 👑 THE WOMEN ARE SOVEREIGN</p>
          <Link href=\"/\" className=\"text-moonlight hover:text-moonlight-silver transition-colors mt-2 inline-block\">
            ← Return to Main Sanctuary
          </Link>
        </div>
      </div>
    </main>
  );
}
