import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [linkExpired, setLinkExpired] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const authenticated = searchParams.get('authenticated')
    const userId = searchParams.get('userId')
    const expired = searchParams.get('expired')
    
    if (expired === 'true') {
      setLinkExpired(true)
      toast.error('Your access link has expired. Please request a new one.')
    }
    
    if (authenticated === 'true' && userId) {
      localStorage.setItem('userId', userId)
      toast.success('Portal access granted')
      navigate('/assessment')
    }
  }, [searchParams, navigate])

  const handleRequestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/request-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMagicLinkSent(true)
        toast.success('Portal access link sent')
      } else {
        toast.error(data.error || 'Failed to send access link')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-flux-obsidian relative overflow-hidden">
      <div className="absolute inset-0 bg-flux-radial animate-flux-pulse" />
      <div className="absolute inset-0 bg-gradient-to-br from-flux-obsidian via-slate-900/50 to-flux-obsidian" />
      
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-flux-indigo/10 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-flux-indigo/5 blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, -20, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8"
      >
        <div className="backdrop-blur-xl bg-slate-900/60 border border-flux-glass-border rounded-3xl p-10 shadow-2xl">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-flux-indigo/5 to-transparent pointer-events-none" />
          
          <motion.div 
            className="text-center mb-10 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-semibold tracking-[0.4em] mb-3 bg-gradient-to-r from-flux-silver via-flux-indigo to-flux-silver bg-clip-text text-transparent">
              FLUX
            </h1>
            <p className="text-[10px] tracking-[0.3em] text-slate-400 font-medium">
              DYNAMIC RANGE ASSESSMENT
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {linkExpired && !magicLinkSent ? (
              <motion.div
                key="expired"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6"
              >
                <motion.div 
                  className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <div>
                  <h3 className="text-lg font-medium text-flux-silver mb-2">Link Expired</h3>
                  <p className="text-sm text-slate-400 mb-6">
                    Your access link has expired. Enter your email below to receive a fresh link instantly.
                  </p>
                </div>
                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800/50 border-flux-glass-border text-flux-silver placeholder:text-slate-600 focus:border-flux-indigo focus:ring-flux-indigo/20 h-12 rounded-xl transition-all duration-300"
                  />
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={async (e) => { await handleRequestMagicLink(e as any); setLinkExpired(false); }}
                      className="w-full h-12 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all duration-300"
                      disabled={isLoading || !email}
                    >
                      {isLoading ? (
                        <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                          Sending...
                        </motion.span>
                      ) : (
                        'Send Fresh Link'
                      )}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ) : magicLinkSent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6"
              >
                <motion.div 
                  className="w-16 h-16 mx-auto rounded-full bg-flux-indigo/20 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg className="w-8 h-8 text-flux-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <div>
                  <h3 className="text-lg font-medium text-flux-silver mb-2">Check your email</h3>
                  <p className="text-sm text-slate-400">
                    Portal access link sent to<br />
                    <span className="text-flux-silver font-medium">{email}</span>
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setMagicLinkSent(false)}
                  className="w-full h-12 border-flux-glass-border text-slate-400 hover:text-flux-silver hover:border-flux-indigo/50 bg-transparent transition-all duration-300 touch-manipulation"
                >
                  Use different email
                </Button>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                onSubmit={handleRequestMagicLink} 
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs tracking-wider text-slate-400">
                    EMAIL ADDRESS
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-slate-800/50 border-flux-glass-border text-flux-silver placeholder:text-slate-600 focus:border-flux-indigo focus:ring-flux-indigo/20 h-12 rounded-xl transition-all duration-300"
                  />
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-flux-silver text-flux-obsidian font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(226,232,240,0.3)] transition-all duration-300" 
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Initiating...
                      </motion.span>
                    ) : (
                      'Access Portal'
                    )}
                  </Button>
                </motion.div>
                <p className="text-[11px] text-center text-slate-400">
                  Passwordless authentication via secure link
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
