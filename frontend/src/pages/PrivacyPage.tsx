import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function PrivacyPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#020617]/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 sm:gap-3">
              <img src="/logo.svg" alt="FLUX" className="h-6 w-6" />
              <span className="text-sm sm:text-base font-semibold tracking-[0.25em] text-[#E2E8F0]">FLUX</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[10px] sm:text-xs tracking-[0.4em] text-indigo-400 mb-4">LEGAL</p>
          <h1 className="text-2xl sm:text-3xl font-light text-[#E2E8F0] mb-10">Privacy Policy</h1>

          <div className="space-y-8 text-sm text-slate-400 leading-relaxed">
            <section>
              <h2 className="text-base text-[#E2E8F0] font-medium mb-3">Data Collection</h2>
              <p>FLUX collects the minimum data required to deliver your psychometric analysis: your email address (for authentication) and your assessment responses. We do not collect browsing data, device fingerprints, or any information beyond what you explicitly provide.</p>
            </section>

            <section>
              <h2 className="text-base text-[#E2E8F0] font-medium mb-3">Encryption & Storage</h2>
              <p>All psychometric data (DASS-21 scores, HEXACO-60 scores, and raw responses) is encrypted at rest using AES-256-GCM with user-specific cryptographic keys derived via PBKDF2. Your mental health data is never stored in plaintext. Session tokens are HTTP-only, secure cookies with 7-day expiry.</p>
            </section>

            <section>
              <h2 className="text-base text-[#E2E8F0] font-medium mb-3">Data Usage</h2>
              <p>Your assessment data is used solely to generate your psychometric profile and AI-powered stability analysis. We do not sell, share, or monetize your data. AI analysis is processed via OpenAI with no persistent storage of your data on third-party servers beyond the request lifecycle.</p>
            </section>

            <section>
              <h2 className="text-base text-[#E2E8F0] font-medium mb-3">Data Deletion</h2>
              <p>You may permanently delete your account and all associated data at any time from the results dashboard. Upon deletion, your user record, encrypted assessment scores, raw responses, and AI analysis are irrecoverably removed from the database. This action is immediate and cannot be undone.</p>
            </section>

            <section>
              <h2 className="text-base text-[#E2E8F0] font-medium mb-3">Security Measures</h2>
              <p>FLUX implements security headers via Helmet.js (CSP, HSTS with preload, X-XSS-Protection), rate limiting with exponential backoff on all authentication endpoints, Zod schema validation on all API inputs, and strict permission policies disabling geolocation, microphone, camera, and payment APIs.</p>
            </section>

            <section>
              <h2 className="text-base text-[#E2E8F0] font-medium mb-3">Contact</h2>
              <p>For any privacy-related inquiries, data requests, or concerns, contact the founder directly via the communication channels on the main page.</p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
