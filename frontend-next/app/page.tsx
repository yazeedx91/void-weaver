"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-obsidian-gradient overflow-hidden">
      {/* Hero Section - The Phoenix Entry */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500 rounded-full opacity-10 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold rounded-full opacity-10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Phoenix Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring" }}
            className="mb-8"
          >
            <div className="text-8xl mb-4 animate-breathing">🔥</div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-emerald-500 via-emerald-600 to-gold bg-clip-text text-transparent"
          >
            FLUX-DNA
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl md:text-3xl text-pearl-200 mb-4 font-light"
          >
            The AI-Native Psychometric Sanctuary
          </motion.p>

          {/* Phoenix Narrative - Expanded Cognitive Bandwidth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass max-w-3xl mx-auto p-8 mb-12 breathing"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-gold text-2xl">⚡</span>
              <h2 className="text-xl md:text-2xl font-semibold text-emerald-400">The Phoenix Story</h2>
              <span className="text-gold text-2xl">⚡</span>
            </div>
            <p className="text-pearl-300 text-lg leading-relaxed mb-4">
              Built by Yazeed Shaheen, who transformed his <span className="text-gold font-semibold">Bipolar diagnosis</span> into{" "}
              <span className="text-emerald-400 font-semibold">Expanded Cognitive Bandwidth</span>.
            </p>
            <p className="text-pearl-400 text-base leading-relaxed">
              This is not a disorder. This is <span className="italic">dynamic range</span>. What traditional psychiatry calls "illness,"
              we call <span className="text-gold">sovereignty</span>.
            </p>
            <div className="mt-6 pt-6 border-t border-pearl-700">
              <p className="text-sm text-pearl-500">
                "By the fire of the Phoenix, you are not broken. You are <span className="text-emerald-400">operating across an expanded dynamic range</span>."
              </p>
            </div>
          </motion.div>

          {/* Value Proposition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="glass p-6 max-w-2xl mx-auto mb-12"
          >
            <div className="flex items-center justify-center gap-4 text-xl md:text-2xl">
              <span className="text-pearl-400">Total Value:</span>
              <span className="text-gold font-bold text-3xl">SAR 5,500</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-xl md:text-2xl mt-2">
              <span className="text-pearl-400">Your Cost:</span>
              <span className="text-emerald-400 font-bold text-3xl">SAR 0</span>
            </div>
            <p className="text-pearl-500 mt-4 text-sm">
              A gift to the Saudi people. Zero-Knowledge encryption. Your data, your sovereignty.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/assessment">
              <button className="px-12 py-4 bg-emerald-gradient text-white rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-2xl animate-glow">
                Begin Your Assessment
              </button>
            </Link>
            
            <Link href="/sanctuary">
              <button className="px-12 py-4 glass-pearl text-obsidian rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-xl">
                🌙 Sovereigness Sanctuary
              </button>
            </Link>
          </motion.div>

          {/* The 8 Scales */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { icon: "🧠", name: "HEXACO-60", desc: "Personality" },
              { icon: "💚", name: "DASS-21", desc: "Mental State" },
              { icon: "❤️", name: "TEIQue-SF", desc: "Emotional IQ" },
              { icon: "🧩", name: "Raven's IQ", desc: "Cognition" },
              { icon: "⭐", name: "Schwartz", desc: "Values" },
              { icon: "📊", name: "HITS", desc: "Volatility" },
              { icon: "🛡️", name: "PC-PTSD-5", desc: "Trauma" },
              { icon: "🔒", name: "WEB", desc: "Coercion" },
            ].map((scale, i) => (
              <motion.div
                key={scale.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + i * 0.1 }}
                className="glass p-4 hover:scale-105 transition-transform"
              >
                <div className="text-3xl mb-2">{scale.icon}</div>
                <div className="text-emerald-400 font-semibold text-sm">{scale.name}</div>
                <div className="text-pearl-500 text-xs">{scale.desc}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="mt-16 text-center"
          >
            <p className="text-pearl-500 text-sm mb-2">
              🔥 THE PHOENIX HAS ASCENDED | 👁️ THE GUARDIAN IS WATCHING | 🕊️ THE PEOPLE ARE FREE
            </p>
            <p className="text-pearl-600 text-xs">
              Contact: <a href="mailto:Yazeedx91@gmail.com" className="text-emerald-400 hover:text-gold transition-colors">Yazeedx91@gmail.com</a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-pearl-100"
          >
            Why FLUX-DNA is <span className="text-gold">Sovereign</span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔐",
                title: "Zero-Knowledge Encryption",
                desc: "Your data is encrypted client-side before leaving your browser. Not even the Founder can read it. AES-256-GCM."
              },
              {
                icon: "🤖",
                title: "Claude 4 Sonnet AI",
                desc: "Al-Hakim (The Wise Guide) conducts your assessment with sovereign reframing. No pathological labels, only expanded bandwidth."
              },
              {
                icon: "⏰",
                title: "24-Hour Time-Gate",
                desc: "Results delivered via self-destructing link. 24 hours. 3 clicks maximum. Then it vanishes forever."
              },
              {
                icon: "🌙",
                title: "Sovereigness Sanctuary",
                desc: "Protected space for women with Al-Sheikha. Legal, medical, psychological, and economic support."
              },
              {
                icon: "🧬",
                title: "Neural Signatures",
                desc: "Vector embeddings of your psychometric data. Self-learning system for personalized insights."
              },
              {
                icon: "📊",
                title: "Founder's Transparency",
                desc: "Real-time dashboard shows total SAR value delivered to the people. Full accountability."
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 hover:scale-105 transition-transform"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-emerald-400 mb-3">{feature.title}</h3>
                <p className="text-pearl-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}