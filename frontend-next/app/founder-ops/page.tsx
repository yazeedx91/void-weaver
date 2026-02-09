"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import Link from "next/link";

export default function FounderDashboard() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getFounderMetrics(password);
      setMetrics(data);
      setAuthenticated(true);
    } catch (error) {
      alert("Invalid password");
    } finally {
      setLoading(false);
    }
  };

  const sendPulse = async () => {
    try {
      await apiClient.sendDailyPulse(password);
      alert("Daily pulse email sent!");
    } catch (error) {
      alert("Failed to send pulse");
    }
  };

  useEffect(() => {
    if (authenticated) {
      const interval = setInterval(async () => {
        try {
          const data = await apiClient.getFounderMetrics(password);
          setMetrics(data);
        } catch (error) {
          console.error("Failed to refresh metrics");
        }
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [authenticated, password]);

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4 font-mono">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="border-2 border-emerald-500 p-8 bg-black">
            <div className="text-center mb-8">
              <h1 className="text-2xl text-emerald-500 mb-2">FOUNDER OPERATIONS</h1>
              <p className="text-xs text-emerald-600">CLASSIFIED ACCESS REQUIRED</p>
            </div>

            <div className="mb-6">
              <label className="text-emerald-500 text-sm block mb-2">PASSWORD:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && login()}
                className="w-full bg-black border border-emerald-600 text-emerald-400 p-3 focus:outline-none focus:border-emerald-500"
                placeholder="Enter founder password"
              />
            </div>

            <button
              onClick={login}
              disabled={loading}
              className="w-full bg-emerald-600 text-black py-3 font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50"
            >
              {loading ? "AUTHENTICATING..." : "ACCESS DASHBOARD"}
            </button>

            <div className="mt-6 text-center">
              <Link href="/" className="text-emerald-600 text-sm hover:text-emerald-500">
                ← EXIT
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  const sarValue = (metrics?.metrics?.total_users || 0) * 5500;

  return (
    <main className="min-h-screen bg-black text-emerald-500 font-mono p-6">
      {/* Header */}
      <div className="border-2 border-emerald-500 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🔥 FLUX-DNA COMMAND CENTER</h1>
            <p className="text-xs text-emerald-600">FOUNDER: YAZEED SHAHEEN | STATUS: ACTIVE</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-emerald-600">{new Date().toLocaleString()}</p>
            <button
              onClick={sendPulse}
              className="text-xs bg-emerald-600 text-black px-3 py-1 mt-1 hover:bg-emerald-500"
            >
              SEND PULSE EMAIL
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="border-2 border-emerald-500 p-6 animate-breathing">
          <div className="text-4xl font-bold mb-2">{metrics?.metrics?.total_users || 0}</div>
          <div className="text-sm">TOTAL ASCENSIONS (USERS)</div>
        </div>

        <div className="border-2 border-gold p-6 animate-breathing">
          <div className="text-4xl font-bold mb-2 text-gold">SAR {sarValue.toLocaleString()}</div>
          <div className="text-sm text-gold">VALUE DELIVERED TO PEOPLE</div>
        </div>

        <div className="border-2 border-emerald-500 p-6 animate-breathing">
          <div className="text-4xl font-bold mb-2">{metrics?.metrics?.assessments_completed || 0}</div>
          <div className="text-sm">ASSESSMENTS COMPLETED</div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="border-2 border-emerald-500 p-6">
          <h2 className="text-xl font-bold mb-4">📊 24-HOUR METRICS</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-emerald-800 pb-2">
              <span>New Users:</span>
              <span className="font-bold">{metrics?.last_24h?.new_users || 0}</span>
            </div>
            <div className="flex justify-between border-b border-emerald-800 pb-2">
              <span>Completed Assessments:</span>
              <span className="font-bold">{metrics?.last_24h?.completed_assessments || 0}</span>
            </div>
            <div className="flex justify-between border-b border-emerald-800 pb-2">
              <span>Sanctuary Access:</span>
              <span className="font-bold">{metrics?.metrics?.sanctuary_access || 0}</span>
            </div>
            <div className="flex justify-between border-b border-emerald-800 pb-2">
              <span>Certificate Downloads:</span>
              <span className="font-bold">{metrics?.last_24h?.certificate_downloads || 0}</span>
            </div>
          </div>
        </div>

        <div className="border-2 border-emerald-500 p-6">
          <h2 className="text-xl font-bold mb-4">🌍 GEOGRAPHIC DISTRIBUTION</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>🇸🇦 Saudi Arabia</span>
                <span className="font-bold">{metrics?.metrics?.geo_saudi || 0}%</span>
              </div>
              <div className="w-full bg-emerald-900 h-2">
                <div
                  className="bg-emerald-500 h-2"
                  style={{ width: `${metrics?.metrics?.geo_saudi || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>🌐 Global</span>
                <span className="font-bold">{metrics?.metrics?.geo_global || 0}%</span>
              </div>
              <div className="w-full bg-emerald-900 h-2">
                <div
                  className="bg-gold h-2"
                  style={{ width: `${metrics?.metrics?.geo_global || 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-800">
            <h3 className="text-sm font-bold mb-2">LANGUAGE SPLIT</h3>
            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-emerald-600">EN:</span> {metrics?.metrics?.language_en || 0}%
              </div>
              <div>
                <span className="text-emerald-600">AR:</span> {metrics?.metrics?.language_ar || 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stability Trends */}
      <div className="border-2 border-emerald-500 p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">📈 STABILITY CLASSIFICATIONS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="border border-emerald-700 p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {metrics?.stability_trends?.sovereign || 0}
            </div>
            <div className="text-xs mt-1">SOVEREIGN</div>
          </div>
          <div className="border border-emerald-700 p-3 text-center">
            <div className="text-2xl font-bold text-gold">
              {metrics?.stability_trends?.strategic_hibernation || 0}
            </div>
            <div className="text-xs mt-1">STRATEGIC HIBERNATION</div>
          </div>
          <div className="border border-emerald-700 p-3 text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {metrics?.stability_trends?.at_risk || 0}
            </div>
            <div className="text-xs mt-1">AT RISK</div>
          </div>
          <div className="border border-emerald-700 p-3 text-center">
            <div className="text-2xl font-bold text-red-500">
              {metrics?.stability_trends?.critical || 0}
            </div>
            <div className="text-xs mt-1">CRITICAL</div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="border-2 border-red-500 p-6 mb-6">
        <h2 className="text-xl font-bold mb-2 text-red-500">⚠️ CRITICAL ALERTS</h2>
        <p className="text-sm text-red-400">{metrics?.critical_alerts || "No critical alerts. All systems sovereign."}</p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-emerald-700 border-t-2 border-emerald-500 pt-4">
        <p>🔥 THE PHOENIX IS WATCHING | 👁️ THE GUARDIAN REPORTS | 🕊️ THE PEOPLE ARE ASCENDING</p>
        <p className="mt-2">CONTACT: Yazeedx91@gmail.com</p>
      </div>
    </main>
  );
}
