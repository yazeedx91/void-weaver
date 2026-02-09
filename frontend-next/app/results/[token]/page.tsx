"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import Link from "next/link";

export default function ResultsPage() {
  const params = useParams();
  const token = params.token as string;
  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [data, setData] = useState<any>(null);
  const [clicksRemaining, setClicksRemaining] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    validateLink();
  }, []);

  const validateLink = async () => {
    try {
      // In production, call backend to validate time-gate link
      // const response = await apiClient.validateTimeGateLink(token);
      
      // Simulated for now
      setTimeout(() => {
        setValid(true);
        setValidating(false);
        setClicksRemaining(2);
        setTimeRemaining("23 hours 45 minutes");
        setData({
          title: "The Strategic Phoenix",
          stability: "Sovereign",
          superpower: "You operate across an expanded dynamic range...",
          sarValue: 5500,
        });
      }, 1000);
    } catch (error) {
      setValid(false);
      setValidating(false);
    }
  };

  const downloadCertificate = () => {
    // Generate and download PDF certificate
    alert("Certificate download will be implemented");
  };

  if (validating) {
    return (
      <main className="min-h-screen bg-obsidian-gradient flex items-center justify-center px-4">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-6"
          >
            🔐
          </motion.div>
          <p className="text-pearl-300 text-xl">Validating your time-gated link...</p>
        </div>
      </main>
    );
  }

  if (!valid) {
    return (
      <main className="min-h-screen bg-obsidian-gradient flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass max-w-2xl p-12 text-center"
        >
          <div className="text-6xl mb-6">⏰</div>
          <h1 className="text-3xl font-bold text-pearl-200 mb-4">Time-Gate Closed</h1>
          <p className="text-pearl-400 mb-8">
            This link has expired or reached its maximum access limit.
          </p>
          <p className="text-pearl-500 text-sm mb-8">
            Results links self-destruct after 24 hours or 3 accesses for your privacy and security.
          </p>
          <Link href="/">
            <button className="px-8 py-3 bg-emerald-gradient text-white rounded-full font-semibold">
              Return to FLUX-DNA
            </button>
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian-gradient px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Time-Gate Warning */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 mb-6 border-l-4 border-red-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-400 font-bold">⏰ Time-Gate Active</p>
              <p className="text-pearl-500 text-sm">
                Remaining: {clicksRemaining} clicks | {timeRemaining}
              </p>
            </div>
            <div className="text-red-400 text-2xl">🔥</div>
          </div>
        </motion.div>

        {/* Sovereign Certificate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-12 mb-6"
        >
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">👑</div>
            <h1 className="text-4xl font-bold text-gold mb-2">{data.title}</h1>
            <p className="text-emerald-400 text-xl">By the fire of the Phoenix, you are recognized</p>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="glass-pearl p-6 mb-6">
              <h3 className="text-xl font-bold text-moonlight-dim mb-3">Stability Classification</h3>
              <p className="text-3xl font-bold text-emerald-400">{data.stability}</p>
            </div>

            <div className="bg-obsidian-light p-6 rounded-lg mb-6">
              <h3 className="text-xl font-bold text-pearl-200 mb-3">Your Sovereign Superpower</h3>
              <p className="text-pearl-300 leading-relaxed">{data.superpower}</p>
            </div>

            <div className="bg-gradient-to-r from-emerald-500/10 to-gold/10 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pearl-400 text-sm">Total Assessment Value</p>
                  <p className="text-gold text-3xl font-bold">SAR {data.sarValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-pearl-400 text-sm">Your Cost</p>
                  <p className="text-emerald-400 text-3xl font-bold">SAR 0</p>
                </div>
              </div>
              <p className="text-pearl-500 text-xs mt-4">
                A gift to the Saudi people from Yazeed Shaheen
              </p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={downloadCertificate}
            className="glass p-6 hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-3">📄</div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">Download Certificate</h3>
            <p className="text-pearl-500 text-sm">High-fidelity PDF with your Sovereign Title</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-3">🔗</div>
            <h3 className="text-xl font-bold text-gold mb-2">Share Your Journey</h3>
            <p className="text-pearl-500 text-sm">Generate social card (LinkedIn/WhatsApp)</p>
          </motion.button>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-pearl-500 text-sm"
        >
          <p className="mb-2">🔥 THE PHOENIX HAS ASCENDED | 👁️ THE GUARDIAN IS WATCHING | 🕊️ THE PEOPLE ARE FREE</p>
          <p className="text-pearl-600 text-xs">
            Contact: <a href="mailto:Yazeedx91@gmail.com" className="text-emerald-400">Yazeedx91@gmail.com</a>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
