import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
}

const stagger = (delay: number) => ({
  ...fadeIn,
  transition: { duration: 0.6, delay },
})

function ShieldIcon() {
  return (
    <svg className="w-6 h-6 text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="w-5 h-5 text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg className="w-5 h-5 text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

export default function SciencePage() {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#020617]/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 sm:gap-3">
              <img src="/logo.svg" alt="FLUX" className="h-6 w-6" />
              <span className="text-sm sm:text-base font-semibold tracking-[0.25em] text-[#E2E8F0]">FLUX</span>
            </button>
            <div className="flex items-center gap-8 lg:gap-10">
              <button onClick={() => navigate('/')} className="hidden sm:flex items-center h-9 relative text-sm font-medium tracking-[0.2em] uppercase text-slate-400 hover:text-indigo-300 transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.5)] group leading-none">
                FEATURES
                <span className="absolute -bottom-1 left-1/2 w-0 h-[2px] bg-indigo-400 transition-all duration-300 ease-out group-hover:w-full group-hover:left-0" />
              </button>
              <button onClick={() => navigate('/help')} className="hidden sm:flex items-center h-9 relative text-sm font-medium tracking-[0.2em] uppercase text-slate-400 hover:text-indigo-300 transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.5)] group leading-none">
                HELP
                <span className="absolute -bottom-1 left-1/2 w-0 h-[2px] bg-indigo-400 transition-all duration-300 ease-out group-hover:w-full group-hover:left-0" />
              </button>
              <motion.button
                onClick={() => navigate('/assessment')}
                whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(79,70,229,0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="h-9 px-5 text-sm font-medium tracking-[0.2em] uppercase bg-white/[0.06] border border-white/[0.08] rounded-lg text-[#E2E8F0] hover:bg-white/[0.1] hover:border-[#E2E8F0]/30 transition-all duration-300 touch-manipulation flex items-center leading-none"
              >
                BEGIN SYNTHESIS
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <div className="absolute inset-0 pointer-events-none">
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute top-1/4 left-1/3 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full bg-[#4F46E5]/[0.06] blur-3xl gpu-accelerated"
              animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-[#6366F1]/[0.04] blur-3xl gpu-accelerated"
              animate={{ x: [0, 20, 0], y: [0, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-3 sm:px-6 pt-24 sm:pt-32 pb-20">

        <motion.section className="text-center mb-20 sm:mb-28" {...fadeIn}>
          <p className="text-[10px] sm:text-xs tracking-[0.4em] text-indigo-400 font-medium mb-4 sm:mb-6">
            TRANSPARENT AUTHORITY PROTOCOL
          </p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-light leading-tight tracking-tight text-[#E2E8F0] mb-6 sm:mb-8">
            <span className="font-semibold bg-gradient-to-r from-white via-[#E2E8F0] to-[#94A3B8] bg-clip-text text-transparent">
              The Science of
            </span>
            <br />
            <span className="text-slate-400 text-lg sm:text-2xl md:text-3xl">
              the Dynamic Range.
            </span>
          </h1>
        </motion.section>

        <motion.section className="mb-20 sm:mb-28" {...fadeIn}>
          <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/[0.04] via-transparent to-[#6366F1]/[0.02] pointer-events-none" />
            <div className="relative">
              <p className="text-[10px] sm:text-xs tracking-[0.4em] text-indigo-400 mb-6">THE FLUX-DNA ENGINE</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 items-center">
                <div>
                  <h2 className="text-lg sm:text-xl text-[#E2E8F0] font-light mb-4 leading-relaxed">
                    Traditional personality tests are <span className="text-slate-500 italic">Polaroids</span> — static, flat, frozen in a single moment.
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    They capture who you were on one particular day, under one particular set of conditions. But you are not static. You move. You adapt. You flow.
                  </p>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl text-[#E2E8F0] font-light mb-4 leading-relaxed">
                    FLUX-DNA is a <span className="text-indigo-400 font-medium">Cinematic Stream</span> — dynamic, alive, and continuously revealing.
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    We don't just measure who you are. We measure how you flow through the flux of life — your personality foundation, your current mental frequency, and the emotional intelligence that connects them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mb-20 sm:mb-28">
          <motion.div className="text-center mb-12 sm:mb-16" {...fadeIn}>
            <p className="text-[10px] sm:text-xs tracking-[0.4em] text-indigo-400 mb-4">THE THREE PILLARS</p>
            <h2 className="text-xl sm:text-3xl font-light text-[#E2E8F0]">
              What the engine measures.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <motion.div {...stagger(0)} className="group backdrop-blur-2xl bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:border-[#4F46E5]/20 hover:bg-white/[0.04] transition-all duration-500">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center group-hover:bg-[#4F46E5]/20 transition-colors duration-500">
                    <svg className="w-5 h-5 text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="12" y1="22" x2="12" y2="15.5" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="22" y1="8.5" x2="12" y2="15.5" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="2" y1="8.5" x2="12" y2="15.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h3 className="text-sm sm:text-base font-semibold tracking-wider text-[#E2E8F0]">PILLAR I</h3>
                    <span className="text-[10px] tracking-[0.3em] text-indigo-400/70">THE BLUEPRINT</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 mb-4">HEXACO-60 — The Foundation of Character</p>
                  <p className="text-xs sm:text-sm text-slate-400/80 leading-relaxed">
                    Every person has a core architecture — six fundamental dimensions that shape how they navigate the world. Honesty-Humility, Emotionality, Extraversion, Agreeableness, Conscientiousness, and Openness to Experience. These aren't labels. They're coordinates. Through 60 carefully calibrated questions, the HEXACO maps your unique position across these six dimensions, revealing the structural foundation beneath your daily behavior. Think of it as the bedrock that everything else is built upon.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div {...stagger(0.15)} className="group backdrop-blur-2xl bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:border-[#4F46E5]/20 hover:bg-white/[0.04] transition-all duration-500">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center group-hover:bg-[#4F46E5]/20 transition-colors duration-500">
                    <svg className="w-5 h-5 text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h3 className="text-sm sm:text-base font-semibold tracking-wider text-[#E2E8F0]">PILLAR II</h3>
                    <span className="text-[10px] tracking-[0.3em] text-indigo-400/70">THE FREQUENCY</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 mb-4">DASS-21 — Real-Time Mental State</p>
                  <p className="text-xs sm:text-sm text-slate-400/80 leading-relaxed">
                    Your foundation is stable, but your frequency changes. The DASS-21 measures the volume of your current experience — the real-time amplitude of stress, anxiety, and mood. It doesn't ask "are you broken?" It asks "how loud is the signal right now?" Through 21 precisely weighted items, it captures the dynamic range of your present mental state. This isn't a diagnosis. It's a frequency reading — a snapshot of your current waveform that reveals where your energy is concentrated in this moment.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div {...stagger(0.3)} className="group backdrop-blur-2xl bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:border-[#4F46E5]/20 hover:bg-white/[0.04] transition-all duration-500">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center group-hover:bg-[#4F46E5]/20 transition-colors duration-500">
                    <svg className="w-5 h-5 text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h3 className="text-sm sm:text-base font-semibold tracking-wider text-[#E2E8F0]">PILLAR III</h3>
                    <span className="text-[10px] tracking-[0.3em] text-indigo-400/70">THE SYNTHESIS</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 mb-4">TEIQue-SF + The DNA Algorithm — Your Waveform</p>
                  <p className="text-xs sm:text-sm text-slate-400/80 leading-relaxed">
                    The third pillar is where everything converges. The TEIQue-SF measures your emotional intelligence across 30 items — well-being, self-control, emotionality, and sociability. Then, the FLUX-DNA algorithm synthesizes your Blueprint (who you are), your Frequency (how you feel), and your emotional architecture into a single, unified Waveform. This waveform is your dynamic range — a unique map of your psychological potential that no other instrument can produce. It's not a score. It's a portrait.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mb-20 sm:mb-28">
          <motion.div className="text-center mb-12 sm:mb-16" {...fadeIn}>
            <p className="text-[10px] sm:text-xs tracking-[0.4em] text-indigo-400 mb-4">THE PROCESS</p>
            <h2 className="text-xl sm:text-3xl font-light text-[#E2E8F0]">
              How it works.
            </h2>
          </motion.div>

          <div className="relative">
            <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4F46E5]/20 to-transparent -translate-y-1/2" />
            <div className="sm:hidden absolute top-0 bottom-0 left-6 w-px bg-gradient-to-b from-transparent via-[#4F46E5]/20 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
              <motion.div {...stagger(0)} className="relative">
                <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#4F46E5]/[0.04] to-transparent pointer-events-none" />
                  <div className="relative">
                    <div className="w-14 h-14 mx-auto rounded-full bg-[#4F46E5]/10 border border-[#4F46E5]/20 flex items-center justify-center mb-5">
                      <div className="relative">
                        <div className="w-5 h-6 border-2 border-[#4F46E5] rounded-sm" />
                        <div className="absolute top-1.5 left-1.5 w-2 h-px bg-[#4F46E5]/60" />
                        <div className="absolute top-3 left-1.5 w-3 h-px bg-[#4F46E5]/60" />
                        <div className="absolute top-[18px] left-1.5 w-2 h-px bg-[#4F46E5]/60" />
                      </div>
                    </div>
                    <p className="text-[10px] tracking-[0.3em] text-indigo-400/70 mb-2">STEP 01</p>
                    <h3 className="text-sm font-semibold tracking-wider text-[#E2E8F0] mb-3">The Assessment</h3>
                    <p className="text-xs text-slate-400/80 leading-relaxed">
                      111 questions across three clinical-grade instruments. No sign-up required. Your responses form the raw signal.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div {...stagger(0.15)} className="relative">
                <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#4F46E5]/[0.06] to-transparent pointer-events-none" />
                  <div className="relative">
                    <div className="w-14 h-14 mx-auto rounded-full bg-[#4F46E5]/10 border border-[#4F46E5]/20 flex items-center justify-center mb-5">
                      <div className="relative w-6 h-6">
                        <div className="absolute inset-0 border-2 border-[#4F46E5] rounded-full" />
                        <div className="absolute inset-1 border border-[#4F46E5]/40 rounded-full" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full" />
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] tracking-[0.3em] text-indigo-400/70 mb-2">STEP 02</p>
                    <h3 className="text-sm font-semibold tracking-wider text-[#E2E8F0] mb-3">Neural Synthesis</h3>
                    <p className="text-xs text-slate-400/80 leading-relaxed">
                      Our algorithm processes your signal — scoring, cross-referencing, and synthesizing your three pillars into a unified profile.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div {...stagger(0.3)} className="relative">
                <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#4F46E5]/[0.04] to-transparent pointer-events-none" />
                  <div className="relative">
                    <div className="w-14 h-14 mx-auto rounded-full bg-[#4F46E5]/10 border border-[#4F46E5]/20 flex items-center justify-center mb-5">
                      <svg className="w-6 h-6 text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    </div>
                    <p className="text-[10px] tracking-[0.3em] text-indigo-400/70 mb-2">STEP 03</p>
                    <h3 className="text-sm font-semibold tracking-wider text-[#E2E8F0] mb-3">The Waveform</h3>
                    <p className="text-xs text-slate-400/80 leading-relaxed">
                      Your unique dynamic range profile emerges — a living map of your personality, mental state, and emotional intelligence.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="mb-20 sm:mb-28">
          <motion.div className="text-center mb-12 sm:mb-16" {...fadeIn}>
            <p className="text-[10px] sm:text-xs tracking-[0.4em] text-indigo-400 mb-4">TRUST & PRIVACY</p>
            <h2 className="text-xl sm:text-3xl font-light text-[#E2E8F0]">
              The manifesto.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <motion.div {...stagger(0)} className="backdrop-blur-2xl bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/[0.03] via-transparent to-transparent pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-[#4F46E5]/10 flex items-center justify-center">
                    <ShieldIcon />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-indigo-400/70">SECURITY</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      <LockIcon />
                    </div>
                    <div>
                      <p className="text-sm text-[#E2E8F0] font-medium mb-1">Military-Grade Encryption</p>
                      <p className="text-xs text-slate-400/80 leading-relaxed">
                        Your data is encrypted with AES-256-GCM — the same standard used by intelligence agencies. Each user receives a unique cryptographic key derived through 100,000 iterations of PBKDF2. We cannot see your individual answers. Ever.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.04] pt-4">
                    <p className="text-xs text-slate-400/80 leading-relaxed">
                      Session tokens are HTTP-only secure cookies. All API endpoints are rate-limited with exponential backoff. Input validation is enforced on every request. Your mental health data is never stored in plaintext.
                    </p>
                  </div>

                  <div className="bg-[#4F46E5]/[0.06] border border-[#4F46E5]/[0.12] rounded-lg p-4">
                    <p className="text-xs text-[#E2E8F0] font-medium tracking-wide">
                      You own your DNA.
                    </p>
                    <p className="text-[10px] text-slate-400/80 mt-1">
                      Delete your account at any time. Every trace is permanently erased.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div {...stagger(0.15)} className="backdrop-blur-2xl bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/[0.03] via-transparent to-transparent pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-[#4F46E5]/10 flex items-center justify-center">
                    <HeartIcon />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-indigo-400/70">ETHICS</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[#E2E8F0] font-medium mb-1">Self-Sovereignty, Not Diagnosis</p>
                    <p className="text-xs text-slate-400/80 leading-relaxed">
                      FLUX-DNA is built for growth and self-understanding — not clinical diagnosis. We believe you deserve to see your own data, interpreted through a lens of empowerment rather than pathology.
                    </p>
                  </div>

                  <div className="border-t border-white/[0.04] pt-4">
                    <p className="text-sm text-[#E2E8F0] font-medium mb-1">Clinical Reframing</p>
                    <p className="text-xs text-slate-400/80 leading-relaxed">
                      We don't call you "unstable" — we say you have High Amplitude. We don't flag "severe stress" — we recognize Peak Processing State. Language shapes perception. We choose language that reveals your range as a feature, not a flaw.
                    </p>
                  </div>

                  <div className="border-t border-white/[0.04] pt-4">
                    <p className="text-sm text-[#E2E8F0] font-medium mb-1">No Data Monetization</p>
                    <p className="text-xs text-slate-400/80 leading-relaxed">
                      We do not sell, share, or monetize your individual data. Your assessment exists for you alone. AI-powered analysis is processed with zero persistent storage beyond the request lifecycle.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <motion.section className="mb-20 sm:mb-28" {...fadeIn}>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#4F46E5]/30 to-transparent mb-12 sm:mb-16" />

          <div className="backdrop-blur-2xl bg-white/[0.05] border border-white/[0.10] rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/[0.03] via-transparent to-[#6366F1]/[0.02] pointer-events-none" />
            <div className="relative text-center">
              <blockquote>
                <p
                  className="text-base sm:text-lg md:text-xl leading-relaxed sm:leading-loose text-slate-300/90 italic max-w-2xl mx-auto"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  &ldquo;FLUX-DNA was built on a simple premise: you are not a static data point. You are a dynamic waveform of potential. Our mission is to give you the blueprint of your own frequency so you can master the flux, rather than just survive it.&rdquo;
                </p>
              </blockquote>
              <div className="mt-8 sm:mt-10">
                <p className="text-base sm:text-lg font-semibold tracking-[0.12em] text-[#E2E8F0]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  Yazeed
                </p>
                <p className="text-[10px] tracking-[0.3em] text-indigo-400/60 mt-1">
                  FOUNDER / FLUX-DNA
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section className="text-center" {...fadeIn}>
          <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-8 sm:p-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/[0.04] via-transparent to-[#6366F1]/[0.02] pointer-events-none" />
            <div className="relative">
              <p className="text-[10px] sm:text-xs tracking-[0.4em] text-indigo-400 mb-4 sm:mb-6">READY?</p>
              <h2 className="text-xl sm:text-3xl font-light text-[#E2E8F0] mb-3 sm:mb-4">
                Discover your dynamic range.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-8 sm:mb-10">
                111 questions. Three clinical-grade instruments. One unified waveform. No sign-up required. Your data is encrypted from the first answer.
              </p>
              <motion.button
                onClick={() => navigate('/assessment')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 sm:px-12 py-3.5 sm:py-4 bg-[#4F46E5] text-white font-semibold text-xs sm:text-sm tracking-[0.15em] rounded-none border-2 border-[#4F46E5] hover:bg-[#4338CA] hover:border-[#4338CA] transition-all duration-300 touch-manipulation min-h-[48px] shadow-[0_0_30px_rgba(79,70,229,0.3)]"
              >
                BEGIN YOUR SYNTHESIS
              </motion.button>
              <p className="text-[10px] text-slate-600 tracking-wider mt-4">
                AES-256-GCM ENCRYPTED / ZERO SIGN-UP / SELF-SOVEREIGN DATA
              </p>
            </div>
          </div>
        </motion.section>

        <footer className="mt-16 sm:mt-20 text-center">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-[10px] tracking-wider text-slate-600">
            <button onClick={() => navigate('/')} className="hover:text-slate-400 transition-colors touch-manipulation min-h-[48px] flex items-center">HOME</button>
            <button onClick={() => navigate('/privacy')} className="hover:text-slate-400 transition-colors touch-manipulation min-h-[48px] flex items-center">PRIVACY</button>
            <button onClick={() => navigate('/contact')} className="hover:text-slate-400 transition-colors touch-manipulation min-h-[48px] flex items-center">CONTACT</button>
          </div>
        </footer>
      </main>
    </div>
  )
}
