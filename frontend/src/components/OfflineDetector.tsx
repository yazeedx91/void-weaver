import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showRestored, setShowRestored] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        setShowRestored(true)
        setTimeout(() => setShowRestored(false), 2500)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  const showBanner = !isOnline || showRestored

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-[9999]"
        >
          <div
            className={`backdrop-blur-xl border-b px-4 py-3 flex items-center justify-center gap-3 ${
              showRestored
                ? 'bg-emerald-900/40 border-emerald-500/20'
                : 'bg-amber-900/40 border-amber-500/20'
            }`}
          >
            {showRestored ? (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12.55a11 11 0 0114.08 0" />
                  <path d="M1.42 9a16 16 0 0121.16 0" />
                  <path d="M8.53 16.11a6 6 0 016.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
                <span className="text-sm font-medium text-emerald-300 tracking-wide">
                  Signal Restored
                </span>
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
                  <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
                  <path d="M10.71 5.05A16 16 0 0122.56 9" />
                  <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
                  <path d="M8.53 16.11a6 6 0 016.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
                <span className="text-sm font-medium text-amber-200 tracking-wide">
                  Signal Lost —{' '}
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    Retrying
                  </motion.span>
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
