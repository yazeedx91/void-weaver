"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Clock, Download, Sparkles, AlertTriangle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ResultData {
  sovereign_title?: string;
  title?: string;
  stability?: string;
  superpower?: string;
  analysis?: string;
  sar_value?: number;
  sarValue?: number;
  user_cost?: number;
}

interface TimeGate {
  clicks_remaining: number;
  time_remaining_hours: number;
  expires_at: string;
  warning?: boolean;
}

function ScoreRing({ score, label, color, delay }: { score: number; label: string; color: string; delay: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="hsl(222 47% 12%)"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx="56"
            cy="56"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ delay: delay + 0.3, duration: 1, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
              filter: `drop-shadow(0 0 8px ${color})`
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{score}%</span>
        </div>
      </div>
      <span className="mt-2 text-sm text-muted-foreground">{label}</span>
    </motion.div>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const token = params.token as string;
  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [data, setData] = useState<ResultData | null>(null);
  const [timeGate, setTimeGate] = useState<TimeGate | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    validateLink();
  }, [token]);

  const validateLink = async () => {
    try {
      const response = await fetch(`${API_URL}/api/assessment/results/${token}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        setValid(false);
        setErrorMessage(errorData.detail?.message || "This link has expired or is invalid.");
        setValidating(false);
        return;
      }
      
      const result = await response.json();
      
      if (result.valid) {
        setValid(true);
        setData(result.results);
        setTimeGate(result.time_gate);
      } else {
        setValid(false);
        setErrorMessage(result.message || "Link validation failed.");
      }
      
      setValidating(false);
    } catch (error) {
      console.error("Validation error:", error);
      setValid(false);
      setErrorMessage("Failed to validate link. Please try again.");
      setValidating(false);
    }
  };

  const downloadCertificate = async () => {
    setDownloading(true);
    try {
      const certificateUrl = `${API_URL}/api/certificate/download/${token}`;
      window.open(certificateUrl, '_blank');
      
      // Update clicks remaining
      if (timeGate) {
        setTimeGate({
          ...timeGate,
          clicks_remaining: Math.max(0, timeGate.clicks_remaining - 1)
        });
      }
    } catch (error) {
      console.error("Certificate download error:", error);
      alert("Failed to download certificate. The link may have expired.");
    } finally {
      setDownloading(false);
    }
  };

  // Loading state
  if (validating) {
    return (
      <div className="min-h-screen void-bg flex items-center justify-center">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(160 84% 39% / 0.2), hsl(43 96% 56% / 0.15))',
              border: '1px solid hsl(160 84% 39% / 0.3)',
            }}
            animate={{
              boxShadow: [
                '0 0 20px hsl(160 84% 39% / 0.2)',
                '0 0 40px hsl(160 84% 39% / 0.4)',
                '0 0 20px hsl(160 84% 39% / 0.2)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Shield className="w-8 h-8 text-emerald-glow" style={{ color: 'hsl(160 84% 39%)' }} />
          </motion.div>
          <p className="text-muted-foreground">Validating your secure link...</p>
        </motion.div>
      </div>
    );
  }

  // Expired/Invalid state
  if (!valid) {
    return (
      <div className="min-h-screen void-bg flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-lg p-12 text-center"
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(0 72% 51% / 0.2), hsl(0 72% 51% / 0.1))',
              border: '1px solid hsl(0 72% 51% / 0.3)',
            }}
          >
            <Clock className="w-10 h-10" style={{ color: 'hsl(0 72% 51%)' }} />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Time-Gate Closed</h1>
          <p className="text-muted-foreground mb-6">{errorMessage}</p>
          <p className="text-sm text-muted-foreground/60 mb-8">
            Results links self-destruct after 24 hours or 3 accesses for your privacy and security.
          </p>
          <Link href="/">
            <motion.button
              className="px-8 py-3 rounded-2xl font-semibold"
              style={{
                background: 'linear-gradient(135deg, hsl(160 84% 39%), hsl(160 70% 30%))',
                color: 'hsl(222 47% 2%)'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Return to FLUX-DNA
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const sovereignTitle = data?.sovereign_title || data?.title || "The Strategic Phoenix";
  const stability = data?.stability || "Sovereign";
  const superpower = data?.superpower || data?.analysis || "You operate across an expanded dynamic range, with heightened perception and profound depth of experience.";
  const sarValue = data?.sar_value || data?.sarValue || 5500;
  const clicksRemaining = timeGate?.clicks_remaining || 0;
  const hoursRemaining = timeGate?.time_remaining_hours || 0;

  return (
    <div className="min-h-screen void-bg px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Time-Gate Warning */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
          style={{ borderLeft: '4px solid hsl(0 72% 51%)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" style={{ color: 'hsl(0 72% 51%)' }} />
              <div>
                <p className="font-semibold" style={{ color: 'hsl(0 72% 51%)' }}>Time-Gate Active</p>
                <p className="text-sm text-muted-foreground">
                  {clicksRemaining} clicks remaining | {Math.floor(hoursRemaining)}h {Math.round((hoursRemaining % 1) * 60)}m left
                </p>
              </div>
            </div>
            <Clock className="w-6 h-6" style={{ color: 'hsl(0 72% 51%)' }} />
          </div>
        </motion.div>

        {/* Main Certificate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 md:p-12"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(43 96% 56% / 0.2), hsl(160 84% 39% / 0.15))',
                border: '1px solid hsl(43 96% 56% / 0.3)',
              }}
              animate={{
                boxShadow: [
                  '0 0 30px hsl(43 96% 56% / 0.2)',
                  '0 0 50px hsl(43 96% 56% / 0.4)',
                  '0 0 30px hsl(43 96% 56% / 0.2)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-10 h-10" style={{ color: 'hsl(43 96% 56%)' }} />
            </motion.div>
            
            <motion.h1
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ color: 'hsl(43 96% 56%)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {sovereignTitle}
            </motion.h1>
            <p className="text-emerald-glow" style={{ color: 'hsl(160 84% 39%)' }}>
              By the fire of the Phoenix, you are recognized
            </p>
          </div>

          {/* Stability Badge */}
          <motion.div
            className="glass-card p-6 mb-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Stability Classification
            </p>
            <p className="text-3xl font-bold" style={{ color: 'hsl(160 84% 39%)' }}>
              {stability}
            </p>
          </motion.div>

          {/* Sample Scores (visual only) */}
          <motion.div
            className="flex justify-center gap-8 mb-10 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <ScoreRing score={85} label="Cognitive" color="hsl(160 84% 39%)" delay={0.7} />
            <ScoreRing score={72} label="Emotional" color="hsl(43 96% 56%)" delay={0.8} />
            <ScoreRing score={91} label="Resilience" color="hsl(174 84% 45%)" delay={0.9} />
          </motion.div>

          {/* Superpower */}
          <motion.div
            className="p-6 rounded-xl mb-8"
            style={{ background: 'hsl(222 47% 8%)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="font-bold text-foreground mb-3">Your Sovereign Superpower</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {superpower}
            </p>
          </motion.div>

          {/* Value Display */}
          <motion.div
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, hsl(160 84% 39% / 0.1), hsl(43 96% 56% / 0.1))'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Total Assessment Value</p>
                <p className="text-3xl font-bold" style={{ color: 'hsl(43 96% 56%)' }}>
                  SAR {sarValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Your Cost</p>
                <p className="text-3xl font-bold" style={{ color: 'hsl(160 84% 39%)' }}>
                  SAR 0
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              A gift to the Saudi people from Yazeed Shaheen
            </p>
          </motion.div>
        </motion.div>

        {/* Download Button */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.button
            onClick={downloadCertificate}
            disabled={downloading || clicksRemaining <= 0}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, hsl(160 84% 39%), hsl(160 70% 30%))',
              color: 'hsl(222 47% 2%)'
            }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            data-testid="download-certificate-btn"
          >
            <Download className="w-5 h-5" />
            {downloading ? "Generating..." : "Download Sovereign Certificate"}
          </motion.button>
        </motion.div>

        {/* Back Link */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <Link href="/">
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Return to FLUX-DNA
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
