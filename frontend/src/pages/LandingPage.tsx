import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import TrustAnchorFooter from '@/components/TrustAnchorFooter'
import MarketValueCard from '@/components/MarketValueCard'

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const authenticated = searchParams.get('authenticated')
    if (authenticated === 'true') {
      fetch('/api/auth/me', { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then((data) => {
          if (data.user?.id) {
            localStorage.setItem('userId', String(data.user.id))
          }
          localStorage.removeItem('flux-pending-assessment')
          setIsAuthenticated(true)
          setCheckingAuth(false)
          toast.success('Portal access granted')
        })
        .catch(() => {
          setCheckingAuth(false)
        })
      return
    }

    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Not authenticated')
      })
      .then((data) => {
        setIsAuthenticated(true)
        if (data.user?.id) {
          localStorage.setItem('userId', String(data.user.id))
        }
      })
      .catch(() => {
        setIsAuthenticated(false)
        localStorage.removeItem('userId')
      })
      .finally(() => setCheckingAuth(false))
  }, [searchParams])



  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-x-hidden">
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#020617]/70 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/logo.svg" alt="FLUX" className="h-6 w-6" />
              <span className="text-sm sm:text-base font-semibold tracking-[0.25em] text-[#E2E8F0]">FLUX</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-8 lg:gap-10">
              <a href="#features" className="hidden sm:flex items-center h-9 relative text-sm font-medium tracking-[0.2em] uppercase text-slate-400 hover:text-indigo-300 transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.5)] group leading-none">
                FEATURES
                <span className="absolute -bottom-1 left-1/2 w-0 h-[2px] bg-indigo-400 transition-all duration-300 ease-out group-hover:w-full group-hover:left-0" />
              </a>
              <a href="/science" className="hidden sm:flex items-center h-9 relative text-sm font-medium tracking-[0.2em] uppercase text-slate-400 hover:text-indigo-300 transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.5)] group leading-none">
                SCIENCE
                <span className="absolute -bottom-1 left-1/2 w-0 h-[2px] bg-indigo-400 transition-all duration-300 ease-out group-hover:w-full group-hover:left-0" />
              </a>
              <motion.button
                onClick={(e) => {
                  fetch('/api/analytics/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'reveal_profile_click' }) }).catch(() => {})
                  if (isAuthenticated) navigate('/results')
                  else navigate('/assessment')
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(79,70,229,0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex h-9 px-6 text-sm font-semibold tracking-[0.2em] uppercase bg-gradient-to-r from-indigo-600/80 to-indigo-500/80 border border-indigo-400/30 rounded-lg text-white hover:from-indigo-500/90 hover:to-indigo-400/90 hover:border-indigo-300/40 transition-all duration-300 items-center leading-none shadow-[0_0_20px_rgba(79,70,229,0.3)]"
              >
                {isAuthenticated ? 'DASHBOARD' : 'REVEAL PROFILE'}
              </motion.button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[#E2E8F0] hover:bg-white/[0.1] transition-all duration-300"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="sm:hidden overflow-hidden border-t border-white/5 backdrop-blur-md bg-[#020617]/90"
            >
              <div className="px-6 py-4 flex flex-col gap-1">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center h-12 px-4 rounded-lg text-sm font-medium tracking-[0.2em] uppercase text-slate-400 hover:text-indigo-300 hover:bg-white/[0.04] transition-all duration-300"
                >
                  FEATURES
                </a>
                <a
                  href="/science"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center h-12 px-4 rounded-lg text-sm font-medium tracking-[0.2em] uppercase text-slate-400 hover:text-indigo-300 hover:bg-white/[0.04] transition-all duration-300"
                >
                  SCIENCE
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    fetch('/api/analytics/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'reveal_profile_click' }) }).catch(() => {})
                    if (isAuthenticated) navigate('/results')
                    else navigate('/assessment')
                  }}
                  className="flex items-center justify-center h-12 mt-2 px-4 rounded-lg text-sm font-semibold tracking-[0.2em] uppercase bg-gradient-to-r from-indigo-600/80 to-indigo-500/80 border border-indigo-400/30 text-white hover:from-indigo-500/90 hover:to-indigo-400/90 transition-all duration-300 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                >
                  {isAuthenticated ? 'DASHBOARD' : 'REVEAL PROFILE'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full gpu-accelerated"
            style={{
              background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, rgba(79,70,229,0.05) 40%, transparent 70%)',
            }}
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.15, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {!prefersReducedMotion && (
            <>
              <motion.div
                className="absolute top-1/4 right-1/4 w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-[#4F46E5]/5 blur-3xl gpu-accelerated"
                animate={{
                  x: [0, 30, 0],
                  y: [0, -20, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute bottom-1/3 left-1/5 w-40 h-40 sm:w-60 sm:h-60 rounded-full bg-[#6366F1]/5 blur-3xl gpu-accelerated"
                animate={{
                  x: [0, -25, 0],
                  y: [0, 15, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-2xl mx-auto text-center"
        >
          <motion.div
            className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-[0_0_40px_rgba(79,70,229,0.08)]"
            animate={prefersReducedMotion ? {} : {
              opacity: [0.95, 1, 0.95],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/[0.04] via-transparent to-[#6366F1]/[0.02] pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative"
            >
              <p className="text-[10px] sm:text-xs tracking-[0.4em] text-indigo-400 font-medium mb-6 sm:mb-8">
                PSYCHOMETRIC INTELLIGENCE
              </p>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-light leading-tight tracking-tight text-[#E2E8F0] mb-4 sm:mb-6">
                <span className="font-semibold bg-gradient-to-r from-white via-[#E2E8F0] to-[#94A3B8] bg-clip-text text-transparent">
                  DYNAMIC RANGE
                </span>
                <br />
                <span className="text-slate-400 text-lg sm:text-2xl md:text-3xl">
                  OVER STATIC STABILITY.
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-8 sm:mb-10">
                Three clinical-grade instruments. One unified analysis.
                Map your personality, emotional intelligence, and mental health
                through the lens of dynamic range — not pathological labels.
              </p>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6">
                {['HEXACO-60', 'DASS-21', 'TEIQue-SF'].map((label, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] sm:text-xs tracking-widest text-slate-400"
                  >
                    {label}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section id="features" className="relative py-20 sm:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] sm:text-xs tracking-[0.4em] text-indigo-400 text-center mb-4"
          >
            THE ASSESSMENT
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl sm:text-3xl font-light text-center text-[#E2E8F0] mb-16 sm:mb-20"
          >
            Three dimensions. One profile.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: 'HEXACO-60',
                subtitle: 'Personality Architecture',
                description: '60 items mapping six core dimensions — Honesty, Emotionality, Extraversion, Agreeableness, Conscientiousness, and Openness.',
                icon: (
                  <svg className="w-5 h-5 text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="22" x2="12" y2="15.5" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="22" y1="8.5" x2="12" y2="15.5" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="2" y1="8.5" x2="12" y2="15.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                title: 'DASS-21',
                subtitle: 'Dynamic Range Scan',
                description: '21 items measuring depression, anxiety, and stress amplitudes — reframed through clinical range rather than pathology.',
                icon: (
                  <svg className="w-5 h-5 text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                title: 'TEIQue-SF',
                subtitle: 'Emotional Intelligence',
                description: '30 items across four factors — Well-being, Self-Control, Emotionality, and Sociability with Global EI composite.',
                icon: (
                  <svg className="w-5 h-5 text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:border-[#4F46E5]/20 hover:bg-white/[0.04] transition-all duration-500"
              >
                <div className="w-10 h-10 rounded-lg bg-[#4F46E5]/10 flex items-center justify-center mb-5 group-hover:bg-[#4F46E5]/20 transition-colors duration-500">
                  {card.icon}
                </div>
                <h3 className="text-sm font-semibold tracking-wider text-[#E2E8F0] mb-1">{card.title}</h3>
                <p className="text-[10px] tracking-wider text-indigo-400/80 mb-3">{card.subtitle}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="science" className="relative py-20 sm:py-32 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] sm:text-xs tracking-[0.4em] text-indigo-400 mb-4"
          >
            THE PHILOSOPHY
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl sm:text-3xl font-light text-[#E2E8F0] mb-8 sm:mb-10"
          >
            Clinical reframing, not clinical labels.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { from: '"Unstable"', to: 'High Amplitude' },
              { from: '"Severe Stress"', to: 'Peak Processing' },
              { from: '"Clinical Flag"', to: 'Dynamic Range Alert' },
            ].map((item, i) => (
              <div key={i} className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 sm:p-6">
                <p className="text-xs text-slate-400 line-through mb-2">{item.from}</p>
                <p className="text-sm font-medium text-[#E2E8F0]">{item.to}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="market-value" className="relative py-20 sm:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <MarketValueCard />
        </div>
      </section>

      <section id="manifesto" className="relative py-20 sm:py-32 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#B8860B]/30" />
            <p className="text-[10px] sm:text-xs tracking-[0.4em] bg-gradient-to-r from-[#B8860B] to-[#DAA520] bg-clip-text text-transparent font-medium">
              THE MANIFESTO
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#B8860B]/30" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl sm:text-3xl font-light text-[#E2E8F0] mb-8 sm:mb-10"
          >
            Why is this free?
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="backdrop-blur-2xl bg-white/[0.02] border border-[#B8860B]/10 rounded-2xl sm:rounded-3xl p-8 sm:p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#B8860B]/[0.03] via-transparent to-[#E5E4E2]/[0.02] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B8860B]/20 to-transparent" />

            <p
              className="relative text-sm sm:text-base md:text-lg leading-relaxed sm:leading-loose text-slate-300/90"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              For decades, elite self-knowledge was a luxury reserved for CEOs and Fortune 500 executives. Corporations pay thousands to access the very data you are about to unlock. We believe intelligence should not be paywalled. We stole the fire from the gods to give it to you. This is not just a test; it is your sovereign right to know yourself.
            </p>
          </motion.div>
        </div>
      </section>

      <section id="entry-portal" className="relative py-20 sm:py-32 px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-8 sm:p-10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/[0.03] via-transparent to-transparent pointer-events-none" />

            <div className="relative text-center mb-8">
              <h2 className="text-lg sm:text-2xl font-light text-[#E2E8F0] mb-2">
                {isAuthenticated ? 'Welcome Back' : 'Begin Your Analysis'}
              </h2>
              <p className="text-[10px] sm:text-xs tracking-wider text-slate-400">
                {isAuthenticated
                  ? 'Your assessment results are ready.'
                  : '111 QUESTIONS. ZERO SIGN-UP REQUIRED.'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {checkingAuth ? (
                <motion.div
                  key="checking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center py-6"
                >
                  <div className="w-6 h-6 border-2 border-white/10 border-t-[#4F46E5] rounded-full animate-spin" />
                </motion.div>
              ) : isAuthenticated ? (
                <motion.div
                  key="authenticated"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <motion.button
                    onClick={() => navigate('/results')}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full h-12 sm:h-14 bg-white text-[#020617] font-semibold text-xs sm:text-sm tracking-wider rounded-none border-2 border-transparent hover:border-[#E2E8F0] transition-all duration-300"
                  >
                    RETURN TO DASHBOARD
                  </motion.button>
                  <motion.button
                    onClick={() => navigate('/assessment')}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full h-12 sm:h-14 bg-transparent text-slate-400 text-xs sm:text-sm tracking-wider rounded-none border border-white/[0.08] hover:text-[#E2E8F0] hover:border-[#E2E8F0]/30 transition-all duration-300"
                  >
                    NEW ASSESSMENT
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="ghost-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <motion.button
                    onClick={() => navigate('/assessment')}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full h-12 sm:h-14 bg-white text-[#020617] font-semibold text-xs sm:text-sm tracking-wider rounded-none border-2 border-transparent hover:border-[#E2E8F0] transition-all duration-300"
                  >
                    REVEAL PROFILE
                  </motion.button>
                  <p className="text-[10px] text-center text-slate-600 tracking-wider">
                    NO SIGN-UP REQUIRED / AES-256 ENCRYPTED
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <section id="founder" className="relative py-20 sm:py-32 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] sm:text-xs tracking-[0.4em] text-indigo-400 text-center mb-4"
          >
            FOUNDER&apos;S IDENTITY
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl sm:text-3xl font-light text-center text-[#E2E8F0] mb-12 sm:mb-16"
          >
            The Source
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="backdrop-blur-2xl bg-white/[0.02] border border-white/[0.06] rounded-2xl sm:rounded-3xl p-8 sm:p-12 mb-10 sm:mb-14 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/[0.03] via-transparent to-[#6366F1]/[0.02] pointer-events-none" />
            <div className="absolute top-0 left-8 sm:left-12 w-px h-full bg-gradient-to-b from-transparent via-[#4F46E5]/20 to-transparent" />

            <blockquote className="relative pl-6 sm:pl-8">
              <p
                className="text-base sm:text-lg md:text-xl leading-relaxed sm:leading-loose text-slate-300/90 italic"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                FLUX wasn&apos;t built in a lab; it was built in the tides. As a creator living with Bipolar disorder, I realized that the world tries to &lsquo;fix&rsquo; our range instead of measuring its power. I built FLUX to bridge the gap between clinical precision and the lived experience of high-amplitude minds. This is my journey, quantified.
              </p>
            </blockquote>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16"
          >
            <a
              href="https://www.linkedin.com/in/yazeed-shaheen-583847180/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <motion.div
                whileHover={{ scale: 1.04, y: -4, boxShadow: '0 0 35px rgba(79,70,229,0.18)' }}
                whileTap={{ scale: 0.97 }}
                className="backdrop-blur-2xl bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all duration-500 hover:border-[#4F46E5]/40 hover:shadow-[0_0_30px_rgba(79,70,229,0.12)]"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 group-hover:border-[#4F46E5]/30 group-hover:bg-[#4F46E5]/10 transition-all duration-500">
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-[#4F46E5] transition-colors duration-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <p className="text-[10px] tracking-[0.3em] text-indigo-400/70 mb-1">PROFESSIONAL SYNTHESIS</p>
                <p className="text-xs text-slate-400 transition-colors duration-300">LinkedIn</p>
              </motion.div>
            </a>

            <a
              href="https://wa.me/966533632262"
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <motion.div
                whileHover={{ scale: 1.04, y: -4, boxShadow: '0 0 35px rgba(79,70,229,0.18)' }}
                whileTap={{ scale: 0.97 }}
                className="backdrop-blur-2xl bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all duration-500 hover:border-[#4F46E5]/40 hover:shadow-[0_0_30px_rgba(79,70,229,0.12)]"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 group-hover:border-[#4F46E5]/30 group-hover:bg-[#4F46E5]/10 transition-all duration-500">
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-[#4F46E5] transition-colors duration-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <p className="text-[10px] tracking-[0.3em] text-indigo-400/70 mb-1">DIRECT SIGNAL</p>
                <p className="text-xs text-slate-400 transition-colors duration-300">WhatsApp</p>
              </motion.div>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-center"
          >
            <p
              className="text-2xl sm:text-3xl text-[#E2E8F0]/60"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              Yazeed Shaheen
            </p>
            <p className="text-[10px] tracking-[0.4em] text-slate-600 mt-2">
              CREATOR / FLUX
            </p>
          </motion.div>
        </div>
      </section>

      <TrustAnchorFooter />
      <footer className="border-t border-white/[0.04] py-8 sm:py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="FLUX" className="h-5 w-5" />
              <span className="text-xs tracking-[0.2em] text-slate-400">FLUX</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <a href="/teams" className="text-[10px] text-slate-400 tracking-wider hover:text-[#E2E8F0] transition-colors py-2 min-h-[44px] inline-flex items-center touch-manipulation">
                TEAMS
              </a>
              <span className="text-slate-700">|</span>
              <a href="/contact" className="text-[10px] text-slate-400 tracking-wider hover:text-[#E2E8F0] transition-colors py-2 min-h-[44px] inline-flex items-center touch-manipulation">
                BUSINESS INQUIRIES
              </a>
              <span className="text-slate-700">|</span>
              <a href="/help" className="text-[10px] text-slate-400 tracking-wider hover:text-[#E2E8F0] transition-colors py-2 min-h-[44px] inline-flex items-center touch-manipulation">
                HELP & FAQ
              </a>
              <span className="text-slate-700">|</span>
              <a href="/privacy" className="text-[10px] text-slate-400 tracking-wider hover:text-[#E2E8F0] transition-colors py-2 min-h-[44px] inline-flex items-center touch-manipulation">
                PRIVACY
              </a>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 tracking-wider text-center mt-6">
            FLUX-DNA / DYNAMIC RANGE PSYCHOMETRIC INTELLIGENCE PLATFORM
          </p>
        </div>
      </footer>
    </div>
  )
}
