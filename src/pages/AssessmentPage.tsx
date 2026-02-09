import { useState, useEffect, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { usePsychometricStore, useHexacoResponses, useDassResponses, useTeiqueResponses } from '@/index'
import { HEXACO_ITEMS, DASS_ITEMS, TEIQUE_ITEMS } from '@/algorithms/ScoringAlgorithm'
import TrustAnchorFooter from '@/components/TrustAnchorFooter'
import AssetUnlockedOverlay from '@/components/AssetUnlockedOverlay'

const DASS_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Sometimes' },
  { value: 2, label: 'Often' },
  { value: 3, label: 'Almost Always' },
]

const HEXACO_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
]

const TEIQUE_OPTIONS = [
  { value: 1, label: 'Completely Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Somewhat Disagree' },
  { value: 4, label: 'Neither Agree Nor Disagree' },
  { value: 5, label: 'Somewhat Agree' },
  { value: 6, label: 'Agree' },
  { value: 7, label: 'Completely Agree' },
]

interface OptionButtonProps {
  option: { value: number; label: string }
  isSelected: boolean
  isFocusTarget: boolean
  onSelect: (value: number) => void
  index: number
}

const OptionButton = memo(function OptionButton({ option, isSelected, isFocusTarget, onSelect, index }: OptionButtonProps) {
  return (
    <motion.button
      role="radio"
      aria-checked={isSelected}
      tabIndex={isFocusTarget ? 0 : -1}
      data-radio-index={index}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => onSelect(option.value)}
      style={{ willChange: 'transform, opacity' }}
      className={`w-full min-h-[48px] p-3 sm:p-4 rounded-xl border text-left transition-colors duration-200 touch-manipulation ${
        isSelected
          ? 'bg-flux-indigo/20 border-flux-indigo text-flux-silver shadow-[0_0_20px_rgba(79,70,229,0.3)]'
          : 'bg-slate-800/30 border-flux-glass-border text-slate-400 hover:border-flux-indigo/50 hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
          isSelected ? 'border-flux-indigo bg-flux-indigo' : 'border-slate-600'
        }`}>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 rounded-full bg-white"
            />
          )}
        </div>
        <span className="text-xs sm:text-sm font-medium leading-snug">{option.label}</span>
      </div>
    </motion.button>
  )
})

export default function AssessmentPage() {
  const navigate = useNavigate()
  const [currentPhase, setCurrentPhase] = useState<'dass' | 'hexaco' | 'teique'>('dass')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [direction, setDirection] = useState(1)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [captureEmail, setCaptureEmail] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [pendingSubmitData, setPendingSubmitData] = useState<any>(null)
  const [teamCode, setTeamCode] = useState('')
  const [showTeamInput, setShowTeamInput] = useState(false)
  const [showRestoredToast, setShowRestoredToast] = useState(false)
  const [showAssetUnlocked, setShowAssetUnlocked] = useState(false)
  const [assetUnlockNav, setAssetUnlockNav] = useState<string | null>(null)
  const prefersReducedMotion = useReducedMotion()
  
  const store = usePsychometricStore()
  const hexacoResponses = useHexacoResponses()
  const dassResponses = useDassResponses()
  const teiqueResponses = useTeiqueResponses()

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Not authenticated')
      })
      .then((data) => {
        if (data.user?.id) {
          localStorage.setItem('userId', String(data.user.id))
          setIsAuthenticated(true)
          localStorage.removeItem('flux-pending-assessment')
        }
      })
      .catch(() => {
        setIsAuthenticated(false)
      })
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('flux-assessment-progress')
      if (saved) {
        const progress = JSON.parse(saved)
        const hasProgress = progress.dassResponses?.some((r: any) => r.response >= 0) ||
          progress.hexacoResponses?.some((r: any) => r.response >= 0) ||
          progress.teiqueResponses?.some((r: any) => r.response >= 0)
        if (progress.currentPhase) setCurrentPhase(progress.currentPhase)
        if (typeof progress.currentQuestionIndex === 'number') setCurrentQuestionIndex(progress.currentQuestionIndex)
        if (progress.dassResponses) {
          store.setDassResponsesBatch(progress.dassResponses.filter((r: any) => r.response >= 0))
        }
        if (progress.hexacoResponses) {
          store.setHexacoResponsesBatch(progress.hexacoResponses.filter((r: any) => r.response >= 0))
        }
        if (progress.teiqueResponses) {
          store.setTeiqueResponsesBatch(progress.teiqueResponses.filter((r: any) => r.response >= 0))
        }
        if (hasProgress) {
          setShowRestoredToast(true)
          toast.success('Welcome back — your progress has been restored')
        }
      }
    } catch {}
  }, [])

  const currentItems = currentPhase === 'dass' ? DASS_ITEMS : currentPhase === 'hexaco' ? HEXACO_ITEMS : TEIQUE_ITEMS
  const currentOptions = currentPhase === 'dass' ? DASS_OPTIONS : currentPhase === 'hexaco' ? HEXACO_OPTIONS : TEIQUE_OPTIONS
  const currentQuestion = currentItems[currentQuestionIndex]

  const getCurrentResponse = () => {
    const questionId = currentQuestion?.id
    if (questionId === undefined) return undefined
    if (currentPhase === 'dass') {
      return dassResponses.find(r => r.id === questionId)?.response
    }
    if (currentPhase === 'hexaco') {
      return hexacoResponses.find(r => r.id === questionId)?.response
    }
    return teiqueResponses.find(r => r.id === questionId)?.response
  }

  const saveProgress = () => {
    try {
      localStorage.setItem('flux-assessment-progress', JSON.stringify({
        currentPhase,
        currentQuestionIndex,
        dassResponses: dassResponses,
        hexacoResponses: hexacoResponses,
        teiqueResponses: teiqueResponses,
      }))
    } catch {}
  }

  const handleAnswer = (value: number) => {
    const questionId = currentQuestion?.id
    if (questionId === undefined) return
    if (currentPhase === 'dass') {
      store.setDassResponse(questionId, value)
    } else if (currentPhase === 'hexaco') {
      store.setHexacoResponse(questionId, value)
    } else {
      store.setTeiqueResponse(questionId, value)
    }
    setTimeout(saveProgress, 50)
  }

  const handleNext = () => {
    setDirection(1)
    if (currentQuestionIndex < currentItems.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else if (currentPhase === 'dass') {
      setCurrentPhase('hexaco')
      setCurrentQuestionIndex(0)
    } else if (currentPhase === 'hexaco') {
      setCurrentPhase('teique')
      setCurrentQuestionIndex(0)
    } else {
      handleSubmit()
    }
    setTimeout(saveProgress, 50)
  }

  const handlePrevious = () => {
    setDirection(-1)
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    } else if (currentPhase === 'teique') {
      setCurrentPhase('hexaco')
      setCurrentQuestionIndex(HEXACO_ITEMS.length - 1)
    } else if (currentPhase === 'hexaco') {
      setCurrentPhase('dass')
      setCurrentQuestionIndex(DASS_ITEMS.length - 1)
    }
    setTimeout(saveProgress, 50)
  }

  const [neuralProgress, setNeuralProgress] = useState(0)
  const [neuralPhase, setNeuralPhase] = useState('')

  const prepareSubmissionData = () => {
    store.calculateScores()
    const hexacoScores = store.hexacoScores
    const dassScores = store.dassScores
    const teiqueScores = store.teiqueScores

    if (!hexacoScores || !dassScores || !teiqueScores) {
      toast.error('Please complete all questions before submitting')
      return null
    }

    return {
      teamCode: teamCode.trim() || undefined,
      assessmentData: {
        dassScores,
        hexacoScores,
        teiqueScores,
        rawResponses: {
          dass: dassResponses.map(r => r.response),
          hexaco: hexacoResponses.map(r => r.response),
          teique: teiqueResponses.map(r => r.response),
        },
      },
    }
  }

  const handleSubmit = async () => {
    const submitData = prepareSubmissionData()
    if (!submitData) return

    if (!isAuthenticated) {
      setPendingSubmitData(submitData)
      setShowEmailCapture(true)
      return
    }

    await submitAssessment(submitData)
  }

  const handleEmailCapture = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pendingSubmitData) return

    setEmailSending(true)
    setShowEmailCapture(false)
    setIsSubmitting(true)
    setNeuralProgress(0)
    setNeuralPhase('Encoding responses...')

    const progressTimer = setTimeout(() => {
      setNeuralProgress(15)
      setNeuralPhase('Calculating DASS-21 severity indices...')
    }, 200)
    const progressTimer2 = setTimeout(() => {
      setNeuralProgress(30)
      setNeuralPhase('Mapping HEXACO-60 personality architecture...')
    }, 800)
    const progressTimer3 = setTimeout(() => {
      setNeuralProgress(45)
      setNeuralPhase('Scoring TEIQue-SF emotional intelligence...')
    }, 1500)
    const progressTimer4 = setTimeout(() => {
      setNeuralProgress(60)
      setNeuralPhase('Neural synthesis — cross-referencing patterns...')
    }, 2500)
    const progressTimer5 = setTimeout(() => {
      setNeuralProgress(80)
      setNeuralPhase('Generating stability analysis...')
    }, 4000)

    try {
      const response = await fetch('/api/stability/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: captureEmail,
          ...pendingSubmitData,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setNeuralProgress(100)
        setNeuralPhase('Analysis complete')
        fetch('/api/analytics/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'assessment_complete' }) }).catch(() => {})
        localStorage.removeItem('flux-assessment-progress')
        localStorage.removeItem('flux-pending-assessment')
        await new Promise(r => setTimeout(r, 500))
        toast.success('Assessment complete')
        if (data.emailDispatched) {
          toast('Your full results report has been sent to your email', { icon: '📧', duration: 6000 })
        } else if (data.emailError) {
          toast.error('Results saved but email delivery failed. Use your portal link to view results.', { duration: 8000 })
        }
        if (data.magicLinkSent) {
          toast('A portal link has been sent to access your dashboard', { icon: '🔗', duration: 6000 })
        }
        setAssetUnlockNav(null)
        setShowAssetUnlocked(true)
        setEmailSent(true)
      } else {
        toast.error(data.error || 'Failed to submit assessment')
        setShowEmailCapture(true)
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
      setShowEmailCapture(true)
    } finally {
      ;[progressTimer, progressTimer2, progressTimer3, progressTimer4, progressTimer5].forEach(clearTimeout)
      setIsSubmitting(false)
      setNeuralProgress(0)
      setEmailSending(false)
    }
  }

  const submitAssessment = async (submitData: any) => {
    setIsSubmitting(true)
    setShowEmailCapture(false)
    setNeuralProgress(0)
    setNeuralPhase('Encoding responses...')

    const progressTimer = setTimeout(() => {
      setNeuralProgress(15)
      setNeuralPhase('Calculating DASS-21 severity indices...')
    }, 200)
    const progressTimer2 = setTimeout(() => {
      setNeuralProgress(30)
      setNeuralPhase('Mapping HEXACO-60 personality architecture...')
    }, 800)
    const progressTimer3 = setTimeout(() => {
      setNeuralProgress(45)
      setNeuralPhase('Scoring TEIQue-SF emotional intelligence...')
    }, 1500)
    const progressTimer4 = setTimeout(() => {
      setNeuralProgress(60)
      setNeuralPhase('Neural synthesis — cross-referencing patterns...')
    }, 2500)
    const progressTimer5 = setTimeout(() => {
      setNeuralProgress(80)
      setNeuralPhase('Generating stability analysis...')
    }, 4000)

    try {
      const response = await fetch('/api/stability/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok) {
        setNeuralProgress(100)
        setNeuralPhase('Analysis complete')
        fetch('/api/analytics/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'assessment_complete' }) }).catch(() => {})
        localStorage.removeItem('flux-assessment-progress')
        localStorage.removeItem('flux-pending-assessment')
        await new Promise(r => setTimeout(r, 500))
        toast.success('Assessment complete')
        if (data.emailDispatched) {
          toast('Your results report has been sent to your email', { icon: '📧', duration: 5000 })
        }
        setAssetUnlockNav('/results')
        setShowAssetUnlocked(true)
      } else {
        toast.error(data.error || 'Failed to submit assessment')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      ;[progressTimer, progressTimer2, progressTimer3, progressTimer4, progressTimer5].forEach(clearTimeout)
      setIsSubmitting(false)
      setNeuralProgress(0)
    }
  }

  const totalQuestions = DASS_ITEMS.length + HEXACO_ITEMS.length + TEIQUE_ITEMS.length
  const completedQuestions = (currentPhase === 'dass' ? 0 : currentPhase === 'hexaco' ? DASS_ITEMS.length : DASS_ITEMS.length + HEXACO_ITEMS.length) + currentQuestionIndex
  const progressPercent = (completedQuestions / totalQuestions) * 100

  const phaseLabel = currentPhase === 'dass' ? 'DASS-21' : currentPhase === 'hexaco' ? 'HEXACO-60' : 'TEIQue-SF'
  const phaseNumber = currentPhase === 'dass' ? 1 : currentPhase === 'hexaco' ? 2 : 3
  const remainingQuestions = totalQuestions - completedQuestions
  const estimatedMinutes = Math.max(1, Math.ceil(remainingQuestions * 0.15))

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  }

  return (
    <div className="min-h-screen bg-flux-obsidian relative overflow-hidden">
      {!prefersReducedMotion && <div className="absolute inset-0 bg-flux-radial animate-flux-pulse opacity-50" />}
      
      {!prefersReducedMotion && (
        <motion.div 
          className="absolute top-20 right-20 w-64 h-64 rounded-full bg-flux-indigo/5 blur-3xl gpu-accelerated"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      )}

      <div className="relative z-10 max-w-2xl mx-auto px-3 sm:px-6 pt-6 sm:pt-8">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold tracking-[0.3em] bg-gradient-to-r from-flux-silver to-flux-indigo bg-clip-text text-transparent">
                FLUX
              </span>
              <span className="text-xs text-slate-400 tracking-wider">
                {phaseLabel}
              </span>
            </div>
            <span className="text-sm text-slate-400 font-mono">
              {completedQuestions + 1}/{totalQuestions}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((phase) => (
                <div key={phase} className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    phase < phaseNumber ? 'bg-flux-indigo' : phase === phaseNumber ? 'bg-flux-indigo animate-pulse' : 'bg-slate-600'
                  }`} />
                  <span className={`text-[9px] tracking-wider transition-colors duration-300 ${
                    phase === phaseNumber ? 'text-indigo-400' : phase < phaseNumber ? 'text-slate-500' : 'text-slate-600'
                  }`}>
                    {phase === 1 ? 'DASS' : phase === 2 ? 'HEXACO' : 'TEIQue'}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 tracking-wider">
              ~{estimatedMinutes} min left
            </span>
          </div>
          {!showTeamInput ? (
            <button
              onClick={() => setShowTeamInput(true)}
              className="text-[10px] text-slate-500 tracking-wider hover:text-slate-400 transition-colors mb-2"
            >
              + TEAM CODE
            </button>
          ) : (
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                placeholder="FX-XXXXXXXX"
                className="h-7 px-2 text-xs font-mono bg-white/[0.04] border border-white/[0.08] text-flux-silver placeholder:text-slate-600 focus:outline-none focus:border-flux-indigo/50 w-32"
              />
              <span className="text-[10px] text-slate-500 tracking-wider">TEAM CODE</span>
            </div>
          )}
          <div className="relative">
            <Progress value={progressPercent} className="h-1 bg-slate-800" />
            <motion.div
              className="absolute top-0 left-0 h-1 bg-gradient-to-r from-flux-indigo to-flux-silver rounded-full"
              style={{ width: `${progressPercent}%` }}
              layoutId="progress"
            />
          </div>
        </motion.div>

        <div className="flux-assessment-card backdrop-blur-xl bg-slate-900/40 border border-flux-glass-border rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${currentPhase}-${currentQuestionIndex}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="mb-8">
                <p className="text-xs text-indigo-400 tracking-wider mb-3">
                  {currentPhase === 'dass' 
                    ? 'Over the past week, how often have you experienced:'
                    : currentPhase === 'hexaco'
                      ? 'How well does this describe you?'
                      : 'Rate how much you agree with each statement:'
                  }
                </p>
                <h2 className="text-base sm:text-xl text-flux-silver leading-relaxed">
                  {currentQuestion?.text}
                </h2>
              </div>

              <div
                className="space-y-3"
                role="radiogroup"
                aria-label={currentQuestion?.text}
                onKeyDown={(e) => {
                  if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return
                  e.preventDefault()
                  const current = currentOptions.findIndex(o => o.value === getCurrentResponse())
                  let next: number
                  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    next = current < currentOptions.length - 1 ? current + 1 : 0
                  } else {
                    next = current > 0 ? current - 1 : currentOptions.length - 1
                  }
                  handleAnswer(currentOptions[next].value)
                  const container = e.currentTarget
                  const target = container.querySelector(`[data-radio-index="${next}"]`) as HTMLElement
                  target?.focus()
                }}
              >
                {currentOptions.map((option, index) => {
                  const selectedValue = getCurrentResponse()
                  const isSelected = selectedValue === option.value
                  const isFocusTarget = isSelected || (selectedValue === undefined && index === 0)
                  return (
                    <OptionButton
                      key={option.value}
                      option={option}
                      isSelected={isSelected}
                      isFocusTarget={isFocusTarget}
                      onSelect={handleAnswer}
                      index={index}
                    />
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-flux-glass-border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentPhase === 'dass' && currentQuestionIndex === 0}
              className="min-h-[48px] min-w-[48px] border-flux-glass-border text-slate-400 hover:text-flux-silver hover:border-flux-indigo/50 bg-transparent touch-manipulation"
            >
              Previous
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleNext}
                disabled={getCurrentResponse() === undefined || isSubmitting}
                className="min-h-[48px] bg-flux-indigo hover:bg-flux-indigo-light text-white px-6 sm:px-8 shadow-[0_0_20px_rgba(79,70,229,0.4)] touch-manipulation"
              >
                {isSubmitting 
                  ? 'Processing...'
                  : currentPhase === 'teique' && currentQuestionIndex === TEIQUE_ITEMS.length - 1
                    ? 'Complete Assessment'
                    : 'Continue'
                }
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md mx-4 p-8 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-2xl"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-transparent border-t-[#4F46E5] border-r-[#6366F1]"
                />
                <p className="text-[10px] tracking-[0.4em] text-indigo-400 mb-2">NEURAL PROCESSING</p>
                <p className="text-sm text-slate-400">{neuralPhase}</p>
              </div>
              <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#4F46E5] to-[#6366F1] rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${neuralProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <p className="text-center text-xs text-slate-400 mt-3 font-mono">{neuralProgress}%</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmailCapture && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/90 backdrop-blur-xl p-4"
            onClick={() => !emailSent && setShowEmailCapture(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md p-8 rounded-2xl bg-slate-900/80 border border-flux-glass-border backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                {emailSent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
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
                      <h3 className="text-lg font-medium text-flux-silver mb-2">Your results are ready</h3>
                      <p className="text-sm text-slate-400">
                        Your full Psychometric Blueprint has been sent to <span className="text-flux-silver font-medium">{captureEmail}</span>.
                      </p>
                      <p className="text-xs text-slate-400 mt-3">A portal link has also been sent to access your interactive dashboard. All data is encrypted with AES-256-GCM.</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-flux-silver mb-1">Assessment Complete</h3>
                      <p className="text-sm text-slate-400">111 questions answered. Enter your email to save your encrypted results and unlock your AI-powered analysis.</p>
                    </div>
                    <form onSubmit={handleEmailCapture} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="capture-email" className="text-xs tracking-wider text-slate-400">EMAIL ADDRESS</Label>
                        <Input
                          id="capture-email"
                          type="email"
                          placeholder="you@example.com"
                          value={captureEmail}
                          onChange={(e) => setCaptureEmail(e.target.value)}
                          required
                          disabled={emailSending}
                          className="bg-slate-800/50 border-flux-glass-border text-flux-silver placeholder:text-slate-600 focus:border-flux-indigo focus:ring-flux-indigo/20 h-12 rounded-xl"
                        />
                      </div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          className="w-full h-12 bg-flux-indigo hover:bg-flux-indigo-light text-white font-semibold rounded-xl shadow-[0_0_30px_rgba(79,70,229,0.3)]"
                          disabled={emailSending || !captureEmail}
                        >
                          {emailSending ? (
                            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                              Sending...
                            </motion.span>
                          ) : (
                            'Save My Results'
                          )}
                        </Button>
                      </motion.div>
                      <p className="text-[11px] text-center text-slate-400">
                        AES-256 encrypted. Passwordless access via secure link.
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AssetUnlockedOverlay
        show={showAssetUnlocked}
        onComplete={() => {
          setShowAssetUnlocked(false)
          if (assetUnlockNav) navigate(assetUnlockNav)
        }}
      />
      <TrustAnchorFooter />
    </div>
  )
}
