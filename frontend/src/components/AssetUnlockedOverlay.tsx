import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AssetUnlockedOverlayProps {
  show: boolean
  onComplete: () => void
}

const assets = [
  { name: 'HEXACO-60 PERSONALITY ARCHITECTURE', value: 350 },
  { name: 'DASS-21 DYNAMIC RANGE SCAN', value: 250 },
  { name: 'TEIQue-SF EMOTIONAL INTELLIGENCE', value: 400 },
]

export default function AssetUnlockedOverlay({ show, onComplete }: AssetUnlockedOverlayProps) {
  const [phase, setPhase] = useState<'idle' | 'unlocking' | 'reveal' | 'total'>('idle')
  const [currentAsset, setCurrentAsset] = useState(0)

  useEffect(() => {
    if (!show) {
      setPhase('idle')
      setCurrentAsset(0)
      return
    }

    setPhase('unlocking')
    const t1 = setTimeout(() => setPhase('reveal'), 800)
    const t2 = setTimeout(() => setCurrentAsset(1), 2000)
    const t3 = setTimeout(() => setCurrentAsset(2), 3200)
    const t4 = setTimeout(() => setPhase('total'), 4400)
    const t5 = setTimeout(() => onComplete(), 7000)

    return () => {
      ;[t1, t2, t3, t4, t5].forEach(clearTimeout)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && phase !== 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/95 backdrop-blur-2xl"
          onClick={onComplete}
        >
          <div className="relative w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            {phase === 'unlocking' && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
                className="text-center"
              >
                <motion.div
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center border-2 border-[#B8860B]/40"
                  style={{ background: 'radial-gradient(circle, rgba(184,134,11,0.15), transparent)' }}
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.8 }}
                >
                  <svg className="w-10 h-10 text-[#DAA520]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5, 1] }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-xs tracking-[0.4em] text-[#B8860B]"
                >
                  DECRYPTING ASSETS...
                </motion.p>
              </motion.div>
            )}

            {(phase === 'reveal' || phase === 'total') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#B8860B]/[0.06] via-[#0f172a] to-[#020617]" />
                <div className="absolute inset-0 border border-[#B8860B]/20 rounded-2xl" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#DAA520]/50 to-transparent" />

                <div className="relative p-8 sm:p-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{ background: 'radial-gradient(circle, rgba(218,165,32,0.2), rgba(184,134,11,0.05))' }}
                  >
                    <svg className="w-8 h-8 text-[#DAA520]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                    </svg>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-[10px] tracking-[0.5em] text-[#DAA520]/60 mb-6"
                  >
                    ASSETS SECURED
                  </motion.p>

                  <div className="space-y-3 mb-8">
                    {assets.map((asset, i) => (
                      <AnimatePresence key={asset.name}>
                        {i <= currentAsset && (
                          <motion.div
                            initial={{ opacity: 0, x: -30, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/[0.02] border border-[#B8860B]/10"
                          >
                            <div className="flex items-center gap-3">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0"
                              >
                                <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </motion.div>
                              <span className="text-xs sm:text-sm text-slate-300 tracking-wider">{asset.name}</span>
                            </div>
                            <motion.span
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 }}
                              className="text-sm sm:text-base font-bold bg-gradient-to-r from-[#B8860B] to-[#DAA520] bg-clip-text text-transparent font-mono"
                            >
                              ${asset.value}
                            </motion.span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    ))}
                  </div>

                  <AnimatePresence>
                    {phase === 'total' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="text-center pt-6 border-t border-[#B8860B]/20"
                      >
                        <p className="text-[10px] tracking-[0.4em] text-[#DAA520]/50 mb-2">
                          TOTAL VALUE UNLOCKED
                        </p>
                        <motion.p
                          initial={{ scale: 0.5 }}
                          animate={{ scale: [0.5, 1.15, 1] }}
                          transition={{ duration: 0.6 }}
                          className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#B8860B] via-[#DAA520] to-[#E5E4E2] bg-clip-text text-transparent"
                        >
                          $1,000+
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="text-xs tracking-[0.2em] text-emerald-400 mt-3"
                        >
                          ELITE PSYCHOMETRIC PORTFOLIO SECURED
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="text-[10px] tracking-[0.2em] text-slate-500 mt-2"
                        >
                          YOUR COST: $0 / DEMOCRATIZED
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
