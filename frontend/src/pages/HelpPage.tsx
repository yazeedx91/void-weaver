import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TrustAnchorFooter from '@/components/TrustAnchorFooter'
import SupportModal from '@/components/SupportModal'

const FAQ_CATEGORIES = [
  {
    id: 'privacy',
    title: 'Privacy & Encryption',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    questions: [
      {
        q: 'How is my assessment data encrypted?',
        a: 'Your data is protected with AES-256-GCM encryption — the same standard used by governments and financial institutions. Each user gets a unique encryption key derived through PBKDF2 with 100,000 iterations, meaning even if the database were compromised, your data remains unreadable without your personal key.',
      },
      {
        q: 'Can FLUX-DNA staff see my results?',
        a: 'No. Your DASS-21, HEXACO-60, and TEIQue-SF results are encrypted at rest with user-specific keys. Staff cannot decrypt individual results. Only you can access your data through your authenticated session.',
      },
      {
        q: 'What happens to my data if I delete my account?',
        a: 'Account deletion is permanent and irreversible. All assessment data, encrypted results, and session records are purged from our database immediately. No backups of individual user data are retained.',
      },
      {
        q: 'Do you sell or share my data with third parties?',
        a: 'Never. FLUX-DNA does not sell, share, or monetize individual user data. Our Talent Intelligence Pulse uses only anonymized, aggregated trends — no individual records are ever identifiable.',
      },
      {
        q: 'How does passwordless authentication work?',
        a: 'We use magic link authentication. When you enter your email, we send a secure, time-limited link. Clicking it creates an encrypted session — no passwords to remember, leak, or compromise. Sessions expire after 7 days for security.',
      },
    ],
  },
  {
    id: 'waveform',
    title: 'Understanding My Waveform',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    questions: [
      {
        q: 'What does "Dynamic Range" mean?',
        a: 'Unlike traditional tests that label you as a fixed type, FLUX-DNA measures your dynamic range — the full spectrum of your personality, emotional intelligence, and mental state. Think of it as the difference between a photograph and a cinematic stream.',
      },
      {
        q: 'What is a "High Amplitude" reading?',
        a: 'High Amplitude indicates elevated activity in that dimension. For DASS-21, it means your system is processing at higher intensity — not that something is "wrong." It represents heightened sensitivity and engagement that may benefit from targeted strategies.',
      },
      {
        q: 'How is "Peak Processing State" different from a clinical diagnosis?',
        a: 'FLUX-DNA is a psychometric assessment platform, not a diagnostic tool. "Peak Processing State" describes when your scores indicate maximum cognitive-emotional load. If your results concern you, we recommend consulting a licensed mental health professional.',
      },
      {
        q: 'What are the three instruments in FLUX-DNA?',
        a: 'DASS-21 measures your current mental state (depression, anxiety, stress frequency). HEXACO-60 maps your core personality architecture across 6 dimensions. TEIQue-SF assesses your emotional intelligence — how you perceive, process, and regulate emotions.',
      },
      {
        q: 'Can I retake the assessment?',
        a: 'Yes. Your dynamic range naturally shifts over time. We recommend retaking every 3-6 months to track how your patterns evolve. Each assessment is stored separately so you can compare your growth trajectory.',
      },
      {
        q: 'What does the AI Stability Analysis do?',
        a: 'Our AI engine cross-references your scores across all three instruments to detect interaction patterns — for example, how high emotionality combined with stress creates a specific processing state. It generates personalized insights that a single test score cannot reveal.',
      },
    ],
  },
  {
    id: 'teams',
    title: 'Business & Team Codes',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    questions: [
      {
        q: 'What is Team Synthesis?',
        a: 'Team Synthesis lets leaders create a team code (FX-XXXXXXXX), which members enter during their individual assessment. Once 5+ unique members have completed assessments, a collective dynamic range report unlocks — showing team personality composition, cohesion scores, stress resilience, and dominant traits.',
      },
      {
        q: 'How do I create a team?',
        a: 'Navigate to the Teams page, sign in, and click "Create Team." You\'ll receive a unique FX-XXXXXXXX code to share with your team members. They enter this code in the "+ TEAM CODE" field before starting their assessment.',
      },
      {
        q: 'Is individual data visible to my team leader?',
        a: 'No. Team Synthesis reports show only aggregated, anonymized data. Leaders see collective patterns — average personality profiles, team stress distribution, and cohesion metrics — never individual member results.',
      },
      {
        q: 'What is the minimum team size for a report?',
        a: 'Reports unlock at 5 unique members to ensure statistical validity and protect individual anonymity. Fewer than 5 members could make individual patterns identifiable, which contradicts our privacy principles.',
      },
      {
        q: 'Can FLUX-DNA be used for enterprise workforce intelligence?',
        a: 'Yes. For enterprise deployments, research partnerships, or data intelligence integrations, contact us through the Business Inquiries page. We offer tailored solutions including the Talent Intelligence Pulse — anonymized macro-trend tracking across your organization.',
      },
    ],
  },
]

export default function HelpPage() {
  const navigate = useNavigate()
  const [openCategory, setOpenCategory] = useState<string>('privacy')
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({})
  const [showSupportModal, setShowSupportModal] = useState(false)

  const toggleQuestion = (categoryId: string, index: number) => {
    const key = `${categoryId}-${index}`
    setOpenQuestions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(79,70,229,0.08)_0%,_transparent_50%)]" />

      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#020617]/70 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 sm:gap-3 min-h-[48px] touch-manipulation">
              <img src="/logo.svg" alt="FLUX" className="h-6 w-6" />
              <span className="text-sm sm:text-base font-semibold tracking-[0.25em] text-[#E2E8F0]">FLUX</span>
            </button>
            <div className="flex items-center gap-8 lg:gap-10">
              <button onClick={() => navigate('/')} className="hidden sm:flex items-center h-9 relative text-sm font-medium tracking-[0.2em] uppercase text-slate-400 hover:text-indigo-300 transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.5)] group leading-none">
                FEATURES
                <span className="absolute -bottom-1 left-1/2 w-0 h-[2px] bg-indigo-400 transition-all duration-300 ease-out group-hover:w-full group-hover:left-0" />
              </button>
              <button onClick={() => navigate('/science')} className="hidden sm:flex items-center h-9 relative text-sm font-medium tracking-[0.2em] uppercase text-slate-400 hover:text-indigo-300 transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.5)] group leading-none">
                SCIENCE
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-[10px] tracking-[0.5em] text-indigo-400/70 mb-4">PREDICTIVE INTELLIGENCE</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#E2E8F0] mb-3">
            Help & FAQ
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
            Everything you need to understand your dynamic range assessment, data security, and team features.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setOpenCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 min-h-[48px] rounded-xl text-xs tracking-wider transition-all duration-300 touch-manipulation ${
                openCategory === cat.id
                  ? 'bg-[#4F46E5]/20 border border-[#4F46E5]/40 text-indigo-300 shadow-[0_0_20px_rgba(79,70,229,0.15)]'
                  : 'bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:border-white/[0.15] hover:text-slate-300'
              }`}
            >
              <span className={openCategory === cat.id ? 'text-indigo-400' : 'text-slate-500'}>{cat.icon}</span>
              <span className="hidden sm:inline">{cat.title}</span>
              <span className="sm:hidden">{cat.id === 'privacy' ? 'Privacy' : cat.id === 'waveform' ? 'Waveform' : 'Teams'}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {FAQ_CATEGORIES.filter(c => c.id === openCategory).map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {category.questions.map((item, index) => {
                const isOpen = openQuestions[`${category.id}-${index}`]
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden hover:border-white/[0.12] transition-colors"
                  >
                    <button
                      onClick={() => toggleQuestion(category.id, index)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left min-h-[48px] touch-manipulation"
                    >
                      <span className="text-sm text-[#E2E8F0] pr-4 leading-relaxed">{item.q}</span>
                      <motion.svg
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-4 h-4 text-slate-500 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </motion.svg>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-slate-400 leading-relaxed">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-slate-400 mb-4">Still have questions?</p>
          <button
            onClick={() => setShowSupportModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] rounded-xl bg-[#4F46E5]/10 border border-[#4F46E5]/30 text-indigo-300 text-sm tracking-wider hover:bg-[#4F46E5]/20 hover:border-[#4F46E5]/50 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.1)] hover:shadow-[0_0_30px_rgba(79,70,229,0.2)] touch-manipulation"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Contact Support
          </button>
        </motion.div>
      </div>

      <TrustAnchorFooter />
      <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
    </div>
  )
}