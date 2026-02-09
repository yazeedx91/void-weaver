import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          inquiryType: 'enterprise',
          message: `[Support Request] ${message}`,
        }),
      })
      if (response.ok) {
        setSent(true)
        setName('')
        setEmail('')
        setMessage('')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to send. Please try again.')
      }
    } catch {
      toast.error('Connection error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    setSent(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/80 backdrop-blur-md p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md backdrop-blur-2xl bg-slate-900/80 border border-white/[0.08] rounded-2xl shadow-[0_0_60px_rgba(79,70,229,0.1)] overflow-hidden"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-[#E2E8F0]">Contact Support</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] tracking-wider text-emerald-400/80">EST. RESPONSE: &lt; 2 HOURS</span>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-colors touch-manipulation"
                  aria-label="Close support modal"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <h4 className="text-[#E2E8F0] font-medium mb-2">Message Received</h4>
                    <p className="text-sm text-slate-400">We'll respond within 2 hours during business days.</p>
                    <button
                      onClick={handleClose}
                      className="mt-6 px-6 py-2.5 min-h-[48px] rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-slate-300 hover:bg-white/[0.08] transition-colors touch-manipulation"
                    >
                      Close
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-[10px] tracking-wider text-slate-500 mb-1.5 block">NAME</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full h-11 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-[#E2E8F0] placeholder:text-slate-600 focus:outline-none focus:border-[#4F46E5]/50 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] tracking-wider text-slate-500 mb-1.5 block">EMAIL</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-11 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-[#E2E8F0] placeholder:text-slate-600 focus:outline-none focus:border-[#4F46E5]/50 transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] tracking-wider text-slate-500 mb-1.5 block">MESSAGE</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={4}
                        className="w-full px-3 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-[#E2E8F0] placeholder:text-slate-600 focus:outline-none focus:border-[#4F46E5]/50 transition-colors resize-none"
                        placeholder="How can we help?"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sending || !name || !email || !message}
                      className="w-full h-12 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(79,70,229,0.3)] touch-manipulation"
                    >
                      {sending ? 'Sending...' : 'Send Message'}
                    </button>
                    <p className="text-[10px] text-center text-slate-500 tracking-wider">
                      ENCRYPTED TRANSMISSION / PRIVACY-FIRST
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}