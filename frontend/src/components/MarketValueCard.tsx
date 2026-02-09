import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const lockIcon = (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const unlockIcon = (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
)

const lineItems = [
  { name: 'NEO-PI-3 Personality Profile', usd: 350, sar: 1300 },
  { name: "Raven's Advanced IQ Matrix", usd: 250, sar: 950 },
  { name: 'High-Performance Aptitude', usd: 400, sar: 1500 },
]

export default function MarketValueCard() {
  const [unlocked, setUnlocked] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#B8860B]/[0.06] via-[#020617] to-[#E5E4E2]/[0.04]" />
      <div className="absolute inset-0 border border-[#B8860B]/20 rounded-2xl sm:rounded-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B8860B]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E5E4E2]/20 to-transparent" />

      <div className="relative p-6 sm:p-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#B8860B]/30" />
          <p className="text-[10px] sm:text-xs tracking-[0.5em] font-medium bg-gradient-to-r from-[#B8860B] to-[#DAA520] bg-clip-text text-transparent">
            MARKET VALUE UNLOCKED
          </p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#B8860B]/30" />
        </div>
        <p className="text-center text-[10px] tracking-[0.3em] text-[#E5E4E2]/40 mb-8 sm:mb-10">
          PRICE COMPARISON ENGINE
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <motion.div
            className="relative rounded-xl sm:rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
            <div className="flex items-center gap-2 mb-6">
              <span className="text-red-400/70">{lockIcon}</span>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-slate-300">
                  CORPORATE CONSULTANCY STANDARD
                </h3>
                <p className="text-[9px] tracking-[0.2em] text-slate-500 mt-0.5">THE OLD WORLD</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {lineItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center justify-between py-2 border-b border-white/[0.04]"
                >
                  <span className="text-xs sm:text-sm text-slate-400 flex-1">{item.name}</span>
                  <span className="text-xs sm:text-sm text-slate-300 font-mono tabular-nums ml-4 whitespace-nowrap">
                    ${item.usd} <span className="text-slate-500">(SAR {item.sar.toLocaleString()})</span>
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-xs tracking-[0.2em] text-slate-500">TOTAL VALUE</span>
                <span className="text-lg sm:text-xl font-bold text-red-400/80 line-through font-mono">
                  $1,000 / SAR 3,750
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative rounded-xl sm:rounded-2xl p-6 sm:p-8 overflow-hidden cursor-pointer"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            onClick={() => setUnlocked(true)}
            onViewportEnter={() => {
              setTimeout(() => setUnlocked(true), 1200)
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#B8860B]/[0.08] via-[#1a1a2e] to-[#E5E4E2]/[0.04]" />
            <div className="absolute inset-0 border border-[#B8860B]/30 rounded-xl sm:rounded-2xl" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#DAA520]/40 to-transparent" />

            <AnimatePresence>
              {!unlocked && (
                <motion.div
                  className="absolute inset-0 z-10 flex items-center justify-center bg-[#020617]/60 backdrop-blur-sm rounded-xl sm:rounded-2xl"
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="text-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-[#B8860B]">{lockIcon}</span>
                    <p className="text-[10px] tracking-[0.3em] text-[#B8860B]/60 mt-2">TAP TO UNLOCK</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative z-0">
              <div className="flex items-center gap-2 mb-6">
                <motion.span
                  className="text-[#DAA520]"
                  animate={unlocked ? { rotate: [0, -15, 0] } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {unlocked ? unlockIcon : lockIcon}
                </motion.span>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold tracking-[0.2em] bg-gradient-to-r from-[#B8860B] to-[#E5E4E2] bg-clip-text text-transparent">
                    FLUX-DNA SOVEREIGN ACCESS
                  </h3>
                  <p className="text-[9px] tracking-[0.2em] text-[#DAA520]/50 mt-0.5">YOUR EMPIRE</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {['HEXACO-60 Personality Architecture', 'DASS-21 Dynamic Range Scan', 'TEIQue-SF Emotional Intelligence'].map((name, i) => (
                  <motion.div
                    key={name}
                    className="flex items-center justify-between py-2 border-b border-[#B8860B]/[0.08]"
                    initial={{ opacity: 0 }}
                    animate={unlocked ? { opacity: 1 } : { opacity: 0.3 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <span className="text-xs sm:text-sm text-slate-300">{name}</span>
                    <motion.span
                      className="text-xs font-medium text-emerald-400 tracking-wider"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={unlocked ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.3 + i * 0.15 }}
                    >
                      INCLUDED
                    </motion.span>
                  </motion.div>
                ))}
                <motion.div
                  className="flex items-center justify-between py-2 border-b border-[#B8860B]/[0.08]"
                  initial={{ opacity: 0 }}
                  animate={unlocked ? { opacity: 1 } : { opacity: 0.3 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="text-xs sm:text-sm text-slate-300">AI Stability Analysis (GPT-5.1)</span>
                  <motion.span
                    className="text-xs font-medium text-emerald-400 tracking-wider"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={unlocked ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.75 }}
                  >
                    INCLUDED
                  </motion.span>
                </motion.div>
                <motion.div
                  className="flex items-center justify-between py-2 border-b border-[#B8860B]/[0.08]"
                  initial={{ opacity: 0 }}
                  animate={unlocked ? { opacity: 1 } : { opacity: 0.3 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="text-xs sm:text-sm text-slate-300">AES-256 Encrypted Report</span>
                  <motion.span
                    className="text-xs font-medium text-emerald-400 tracking-wider"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={unlocked ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.9 }}
                  >
                    INCLUDED
                  </motion.span>
                </motion.div>
              </div>

              <div className="pt-4 border-t border-[#B8860B]/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-[0.2em] bg-gradient-to-r from-[#B8860B] to-[#DAA520] bg-clip-text text-transparent">
                    TOTAL COST
                  </span>
                  <AnimatePresence mode="wait">
                    {unlocked ? (
                      <motion.span
                        key="free"
                        initial={{ opacity: 0, scale: 0.5, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="text-2xl sm:text-4xl font-bold text-emerald-400"
                      >
                        FREE
                      </motion.span>
                    ) : (
                      <motion.span
                        key="locked"
                        className="text-2xl sm:text-4xl font-bold text-[#B8860B]/30"
                      >
                        ???
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {unlocked && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-right text-[10px] tracking-[0.3em] text-emerald-400/60 mt-1"
                  >
                    DEMOCRATIZED
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-8 sm:mt-10 text-center"
        >
          <p className="text-[10px] tracking-[0.3em] text-[#E5E4E2]/20">
            THE GATEKEEPERS ARE BYPASSED. THE VALUE IS YOURS.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
