import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ShareWaveform from '@/components/ShareWaveform'
import MarketValueCard from '@/components/MarketValueCard'
import TrustAnchorFooter from '@/components/TrustAnchorFooter'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

interface StabilityAnalysis {
  overallStability: 'Stable' | 'At Risk' | 'Critical'
  riskFlags: {
    acuteReactiveState: boolean
    highFunctioningBurnout: boolean
    elevatedDepression: boolean
    elevatedAnxiety: boolean
    elevatedStress: boolean
  }
  stabilityScore: number
  personalityMoodInteraction: string
  recommendations: string[]
  clinicalNotes: string
  summary: string
}

interface ResultData {
  id: number
  dassScores: {
    Depression: number
    Anxiety: number
    Stress: number
  }
  hexacoScores: {
    HonestyHumility: number
    Emotionality: number
    Extraversion: number
    Agreeableness: number
    Conscientiousness: number
    OpennessToExperience: number
  }
  stabilityAnalysis: StabilityAnalysis
  completedAt: string
}

const getAmplitudeLabel = (stability: string): string => {
  const normalized = stability?.toLowerCase().trim()
  if (normalized === 'stable') return 'Balanced Range'
  if (normalized === 'at risk' || normalized === 'at-risk') return 'High Amplitude'
  if (normalized === 'critical') return 'Peak Processing State'
  return 'Balanced Range'
}

const getAmplitudeColor = (stability: string): string => {
  const normalized = stability?.toLowerCase().trim()
  if (normalized === 'stable') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  if (normalized === 'at risk' || normalized === 'at-risk') return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  if (normalized === 'critical') return 'bg-flux-indigo/20 text-flux-indigo border-flux-indigo/30'
  return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
}

const getDynamicRangeLabel = (score: number, type: 'depression' | 'anxiety' | 'stress'): string => {
  const thresholds = {
    depression: [10, 14, 21, 28],
    anxiety: [8, 10, 15, 20],
    stress: [15, 19, 26, 34],
  }
  const labels = ['Baseline', 'Mild Elevation', 'Moderate Amplitude', 'High Amplitude', 'Peak Processing']
  const t = thresholds[type]
  if (score < t[0]) return labels[0]
  if (score < t[1]) return labels[1]
  if (score < t[2]) return labels[2]
  if (score < t[3]) return labels[3]
  return labels[4]
}

function generateSignals(result: ResultData): Array<{ icon: string; title: string; description: string }> {
  const signals: Array<{ icon: string; title: string; description: string }> = []
  const h = result.hexacoScores
  const d = result.dassScores

  if (h.OpennessToExperience > 3.5) {
    signals.push({
      icon: '🔮',
      title: 'Creative Deep-Work Window',
      description: 'Your Openness is high — prioritize creative and divergent thinking tasks before 11 AM when cognitive novelty peaks.',
    })
  } else if (h.OpennessToExperience < 2.5) {
    signals.push({
      icon: '🎯',
      title: 'Structured Execution Zone',
      description: 'Your pragmatic orientation favors systematic approaches. Break ambiguous projects into concrete, sequential milestones.',
    })
  }

  if (h.Conscientiousness > 3.5 && d.Stress > 14) {
    signals.push({
      icon: '⚡',
      title: 'Perfectionism-Stress Loop',
      description: 'High conscientiousness under elevated stress creates diminishing returns. Set explicit "good enough" thresholds to protect output quality.',
    })
  } else if (h.Conscientiousness > 3.5) {
    signals.push({
      icon: '🏗️',
      title: 'Systems Architect Advantage',
      description: 'Your high conscientiousness is a force multiplier. Channel it into building systems and habits rather than brute-forcing individual tasks.',
    })
  }

  if (h.Extraversion > 3.5) {
    signals.push({
      icon: '🌊',
      title: 'Social Energy Amplifier',
      description: 'Your high extraversion generates energy from interaction. Schedule collaborative work in blocks — then protect recharge time between.',
    })
  } else if (h.Extraversion < 2.5) {
    signals.push({
      icon: '🔋',
      title: 'Deep Focus Reserve',
      description: 'Your introverted profile recovers energy through solitude. Protect 2-3 hour uninterrupted blocks — this is where your best work lives.',
    })
  }

  if (d.Anxiety > 14) {
    signals.push({
      icon: '🧘',
      title: 'Anticipation Override Protocol',
      description: 'Elevated anxiety often signals anticipatory processing. Use structured planning with deadlines to convert anxious energy into preparation momentum.',
    })
  }

  if (d.Depression > 14 && h.Emotionality > 3) {
    signals.push({
      icon: '💎',
      title: 'Emotional Depth Integration',
      description: 'High emotionality with elevated depression scores can indicate profound processing. Channel this depth through journaling, creative expression, or structured reflection.',
    })
  }

  if (h.Agreeableness > 3.5 && h.HonestyHumility > 3.5) {
    signals.push({
      icon: '🤝',
      title: 'Trust Architecture Specialist',
      description: 'Your high agreeableness and honesty-humility create natural trust. Leverage this in leadership roles — but set boundaries to prevent over-commitment.',
    })
  }

  if (h.Emotionality < 2.5 && d.Stress < 10) {
    signals.push({
      icon: '🛡️',
      title: 'Stress Resilience Asset',
      description: 'Low emotionality combined with baseline stress indicates exceptional resilience. You thrive under pressure — seek high-stakes environments where others cannot.',
    })
  }

  while (signals.length < 3) {
    if (!signals.some(s => s.title.includes('Waveform'))) {
      signals.push({
        icon: '📊',
        title: 'Waveform Tracking',
        description: 'Your dynamic range is uniquely yours. Retake this assessment in 3-6 months to track how your patterns evolve with life changes.',
      })
    } else {
      signals.push({
        icon: '🧬',
        title: 'Trait Synergy Awareness',
        description: 'Your personality dimensions interact in unique ways. Review your radar chart to identify your strongest trait — then build environments that amplify it.',
      })
    }
  }

  return signals.slice(0, 3)
}

export default function ResultsPage() {
  const navigate = useNavigate()
  const [results, setResults] = useState<ResultData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState<ResultData | null>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [sovereignEmail, setSovereignEmail] = useState('')
  const [sovereignSubmitting, setSovereignSubmitting] = useState(false)
  const [sovereignJoined, setSovereignJoined] = useState(false)

  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'))
  const [loadPhase, setLoadPhase] = useState<'authenticating' | 'decrypting' | 'ready' | 'error'>('authenticating')
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Not authenticated')
      })
      .then((data) => {
        if (data.user?.id) {
          const id = String(data.user.id)
          localStorage.setItem('userId', id)
          setUserId(id)
        }
        setLoadPhase('decrypting')
        fetchResults()
      })
      .catch(() => {
        navigate('/')
      })
  }, [navigate])

  const fetchResults = async () => {
    setFetchError(null)
    try {
      const response = await fetch('/api/stability/results', { credentials: 'include' })
      const data = await response.json()
      
      if (response.ok) {
        const validResults = (data.results || []).filter((r: any) => !r.error)
        setResults(validResults)
        if (validResults.length > 0) {
          setSelectedResult(validResults[0])
        }
        setLoadPhase('ready')
      } else {
        setFetchError(data.error || 'Failed to load results')
        setLoadPhase('error')
        toast.error('Failed to load results')
      }
    } catch (error) {
      setFetchError('Connection error — please check your network')
      setLoadPhase('error')
      toast.error('Failed to load results')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {}
    localStorage.removeItem('userId')
    localStorage.removeItem('flux-assessment-progress')
    navigate('/')
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('This will permanently delete your account and all assessment data. This cannot be undone. Are you sure?')) {
      return
    }
    try {
      const response = await fetch('/api/auth/account', { method: 'DELETE', credentials: 'include' })
      if (response.ok) {
        localStorage.removeItem('userId')
        localStorage.removeItem('flux-assessment-progress')
        toast.success('Account and all data permanently deleted')
        navigate('/')
      } else {
        toast.error('Failed to delete account')
      }
    } catch {
      toast.error('Failed to delete account')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-flux-obsidian flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="w-16 h-16 rounded-full border-2 border-flux-indigo border-t-transparent mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-slate-400 mb-2">
            {loadPhase === 'authenticating' && 'Verifying portal access...'}
            {loadPhase === 'decrypting' && 'Decrypting your assessment data...'}
          </p>
          {loadPhase === 'decrypting' && (
            <p className="text-xs text-slate-500 font-mono tracking-wider">AES-256-GCM DECRYPTION IN PROGRESS</p>
          )}
        </motion.div>
      </div>
    )
  }

  if (loadPhase === 'error') {
    return (
      <div className="min-h-screen bg-flux-obsidian flex items-center justify-center p-4">
        <motion.div 
          className="backdrop-blur-xl bg-slate-900/60 border border-flux-glass-border rounded-2xl p-10 max-w-md text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-amber-400 text-xl">!</span>
          </div>
          <h2 className="text-xl text-flux-silver mb-3">Data Retrieval Issue</h2>
          <p className="text-slate-400 mb-6">{fetchError || 'Unable to load your assessment data.'}</p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => { setIsLoading(true); setLoadPhase('decrypting'); fetchResults(); }} 
              className="min-h-[44px] bg-flux-indigo hover:bg-flux-indigo-light touch-manipulation"
            >
              Retry
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/assessment')} 
              className="min-h-[44px] border-flux-glass-border text-slate-400 hover:text-flux-silver bg-transparent touch-manipulation"
            >
              New Assessment
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  const handleResendResults = async () => {
    try {
      const response = await fetch('/api/stability/resend-results', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await response.json()
      if (response.ok && data.success) {
        toast.success('Your results report has been re-sent to your email')
      } else {
        toast.error(data.error || 'Failed to resend results')
      }
    } catch {
      toast.error('Failed to resend results — please check your connection')
    }
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-flux-obsidian flex items-center justify-center p-4">
        <motion.div 
          className="backdrop-blur-xl bg-slate-900/60 border border-flux-glass-border rounded-2xl p-10 max-w-md text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl text-flux-silver mb-3">No Assessment Data</h2>
          <p className="text-slate-400 mb-4">Complete an assessment to view your dynamic range profile.</p>
          <p className="text-xs text-slate-500 mb-6">If you recently completed an assessment, your full results have been sent to your email.</p>
          <div className="flex flex-col gap-3 items-center">
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/assessment')} 
                className="min-h-[44px] bg-flux-indigo hover:bg-flux-indigo-light touch-manipulation"
              >
                Start Assessment
              </Button>
              <Button 
                variant="outline"
                onClick={() => { setIsLoading(true); setLoadPhase('decrypting'); fetchResults(); }} 
                className="min-h-[44px] border-flux-glass-border text-slate-400 hover:text-flux-silver bg-transparent touch-manipulation"
              >
                Refresh
              </Button>
            </div>
            <Button 
              variant="ghost"
              onClick={handleResendResults}
              className="min-h-[44px] text-flux-indigo hover:text-flux-indigo-light text-sm touch-manipulation"
            >
              Retrieve My Results via Email
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  const radarData = selectedResult ? [
    { trait: 'Honesty', value: (selectedResult.hexacoScores.HonestyHumility / 5) * 100, fullMark: 100 },
    { trait: 'Emotionality', value: (selectedResult.hexacoScores.Emotionality / 5) * 100, fullMark: 100 },
    { trait: 'Extraversion', value: (selectedResult.hexacoScores.Extraversion / 5) * 100, fullMark: 100 },
    { trait: 'Agreeableness', value: (selectedResult.hexacoScores.Agreeableness / 5) * 100, fullMark: 100 },
    { trait: 'Conscientiousness', value: (selectedResult.hexacoScores.Conscientiousness / 5) * 100, fullMark: 100 },
    { trait: 'Openness', value: (selectedResult.hexacoScores.OpennessToExperience / 5) * 100, fullMark: 100 },
  ] : []

  const waveformData = selectedResult ? [
    { name: 'D', value: selectedResult.dassScores.Depression, label: 'Depression' },
    { name: 'A', value: selectedResult.dassScores.Anxiety, label: 'Anxiety' },
    { name: 'S', value: selectedResult.dassScores.Stress, label: 'Stress' },
  ] : []

  const isPeakProcessingState = selectedResult && 
    selectedResult.hexacoScores.Emotionality > 3.5 && 
    selectedResult.dassScores.Stress > 19

  return (
    <div className="min-h-screen bg-flux-obsidian relative overflow-hidden">
      <div className="absolute inset-0 bg-flux-radial animate-flux-pulse opacity-30" />
      
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold tracking-[0.3em] bg-gradient-to-r from-flux-silver to-flux-indigo bg-clip-text text-transparent">
              FLUX
            </h1>
            <span className="text-xs text-slate-400 tracking-wider">DYNAMIC RANGE PROFILE</span>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/assessment')}
              className="min-h-[44px] border-flux-glass-border text-slate-400 hover:text-flux-silver bg-transparent touch-manipulation"
            >
              New Assessment
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleDeleteAccount}
              className="min-h-[44px] text-red-500/60 hover:text-red-400 text-xs touch-manipulation"
            >
              Delete Account
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="min-h-[44px] text-slate-400 hover:text-slate-300 touch-manipulation"
            >
              Exit
            </Button>
          </div>
        </motion.div>

        {selectedResult && (
          <div className="space-y-6">
            <motion.div
              className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-[#B8860B]/20"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.05, type: 'spring', stiffness: 200 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#B8860B]/[0.06] via-[#0f172a] to-[#E5E4E2]/[0.03]" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#DAA520]/30 to-transparent" />
              <div className="relative flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#B8860B]/10 border border-[#B8860B]/20">
                    <svg className="w-4 h-4 text-[#DAA520]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold tracking-[0.15em] bg-gradient-to-r from-[#B8860B] to-[#E5E4E2] bg-clip-text text-transparent">
                      ELITE PSYCHOMETRIC PORTFOLIO
                    </p>
                    <p className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#DAA520]/50">SOVEREIGN INTELLIGENCE ASSET</p>
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-right"
                >
                  <p className="text-[9px] tracking-[0.2em] text-[#DAA520]/40">VALUED AT</p>
                  <p className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#B8860B] via-[#DAA520] to-[#E5E4E2] bg-clip-text text-transparent font-mono">
                    $1,000+
                  </p>
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              className="backdrop-blur-xl bg-slate-900/40 border border-flux-glass-border rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg text-flux-silver mb-1">Amplitude Analysis</h2>
                  <p className="text-xs text-slate-400">
                    {new Date(selectedResult.completedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </p>
                </div>
                <Badge className={`${getAmplitudeColor(selectedResult.stabilityAnalysis?.overallStability)} border px-4 py-1`}>
                  {getAmplitudeLabel(selectedResult.stabilityAnalysis?.overallStability || 'Unknown')}
                </Badge>
              </div>

              {isPeakProcessingState && (
                <motion.div 
                  className="mb-6 p-4 rounded-xl bg-flux-indigo/10 border border-flux-indigo/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-flux-indigo animate-pulse" />
                    <span className="text-flux-indigo text-sm font-medium">Peak Processing State Detected</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-2 ml-5">
                    High Emotionality combined with elevated Stress indicates your system is processing at maximum capacity. 
                    This represents heightened sensitivity and engagement, not dysfunction.
                  </p>
                </motion.div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Dynamic Range Score</span>
                    <span className="text-flux-silver">{typeof selectedResult.stabilityAnalysis?.stabilityScore === 'number' ? selectedResult.stabilityAnalysis.stabilityScore : 0}/100</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-flux-indigo to-flux-silver rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${typeof selectedResult.stabilityAnalysis?.stabilityScore === 'number' ? selectedResult.stabilityAnalysis.stabilityScore : 0}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {selectedResult.stabilityAnalysis?.summary}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div 
                className="backdrop-blur-xl bg-slate-900/40 border border-flux-glass-border rounded-2xl p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-sm text-flux-silver mb-1">Personality Signature</h3>
                <p className="text-xs text-slate-400 mb-6">HEXACO-60 Radar Profile</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis 
                        dataKey="trait" 
                        tick={{ fill: '#94A3B8', fontSize: 10 }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fill: '#64748B', fontSize: 8 }}
                        axisLine={false}
                      />
                      <Radar
                        name="Personality"
                        dataKey="value"
                        stroke="#4F46E5"
                        fill="#4F46E5"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div 
                className="backdrop-blur-xl bg-slate-900/40 border border-flux-glass-border rounded-2xl p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-sm text-flux-silver mb-1">Mental State Waveform</h3>
                <p className="text-xs text-slate-400 mb-6">DASS-21 Amplitude Analysis</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={waveformData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                      <defs>
                        <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[0, 42]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 10 }}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-slate-800 border border-flux-glass-border rounded-lg p-3 shadow-xl">
                                <p className="text-flux-silver text-sm font-medium">{data.label}</p>
                                <p className="text-slate-400 text-xs">Score: {data.value}/42</p>
                                <p className="text-indigo-400 text-xs">
                                  {getDynamicRangeLabel(data.value, data.label.toLowerCase())}
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#4F46E5"
                        strokeWidth={3}
                        fill="url(#waveGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-around mt-4">
                  {waveformData.map(item => (
                    <div key={item.name} className="text-center">
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="text-sm text-flux-silver font-medium">{item.value}</p>
                      <p className="text-[10px] text-indigo-400">
                        {getDynamicRangeLabel(item.value, item.label.toLowerCase() as any)}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {selectedResult.stabilityAnalysis?.recommendations && (
              <motion.div 
                className="backdrop-blur-xl bg-slate-900/40 border border-flux-glass-border rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-sm text-flux-silver mb-4">Optimization Recommendations</h3>
                <ul className="space-y-3">
                  {selectedResult.stabilityAnalysis.recommendations.map((rec, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start gap-3 text-sm text-slate-400"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-flux-indigo mt-2 flex-shrink-0" />
                      {rec}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            <motion.div
              className="backdrop-blur-xl bg-slate-900/40 border border-flux-glass-border rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-flux-indigo/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-flux-indigo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm text-flux-silver">Next Steps — Your Signals</h3>
                  <p className="text-[10px] text-slate-500 tracking-wider">PERSONALIZED BASED ON YOUR WAVEFORM</p>
                </div>
              </div>
              <div className="grid gap-3">
                {generateSignals(selectedResult).map((signal, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-flux-indigo/20 transition-colors"
                  >
                    <span className="text-lg mt-0.5 flex-shrink-0">{signal.icon}</span>
                    <div>
                      <p className="text-sm text-flux-silver font-medium mb-1">{signal.title}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{signal.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4">
              <motion.div
                className="backdrop-blur-xl bg-slate-900/40 border border-flux-glass-border rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="text-center">
                  <h3 className="text-sm text-flux-silver mb-2">Bookmark This Profile</h3>
                  <p className="text-xs text-slate-400 mb-4">Save this page for quick access to your waveform.</p>
                  <Button
                    onClick={() => {
                      setBookmarked(true)
                      const isMac = navigator.platform?.toUpperCase().includes('MAC')
                      toast.success(`Press ${isMac ? '⌘+D' : 'Ctrl+D'} to bookmark this profile`)
                    }}
                    className={`min-h-[48px] px-6 touch-manipulation transition-all duration-300 ${
                      bookmarked
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
                        : 'bg-flux-indigo/10 border border-flux-indigo/30 text-indigo-300 hover:bg-flux-indigo/20'
                    }`}
                    variant="outline"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                    </svg>
                    {bookmarked ? 'Bookmarked' : 'Bookmark Profile'}
                  </Button>
                </div>
              </motion.div>

              <motion.div
                className="backdrop-blur-xl bg-slate-900/40 border border-flux-glass-border rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="text-center">
                  <h3 className="text-sm text-flux-silver mb-2">Track Your DNA Over Time</h3>
                  <p className="text-xs text-slate-400 mb-4">Join the Sovereign List for evolution insights and early features.</p>
                  <AnimatePresence mode="wait">
                    {sovereignJoined ? (
                      <motion.div
                        key="joined"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-2 text-emerald-400 text-sm"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        You're on the list
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onSubmit={async (e) => {
                          e.preventDefault()
                          setSovereignSubmitting(true)
                          try {
                            const response = await fetch('/api/contact/submit', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: 'Sovereign List Signup',
                                email: sovereignEmail,
                                inquiryType: 'research',
                                message: '[Sovereign List] User wants to track their DNA over time and receive evolution insights.',
                              }),
                            })
                            if (response.ok) {
                              setSovereignJoined(true)
                              toast.success('Welcome to the Sovereign List')
                            } else {
                              toast.error('Failed to join. Please try again.')
                            }
                          } catch {
                            toast.error('Connection error. Please try again.')
                          } finally {
                            setSovereignSubmitting(false)
                          }
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="email"
                          value={sovereignEmail}
                          onChange={(e) => setSovereignEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          className="flex-1 h-11 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-[#E2E8F0] placeholder:text-slate-600 focus:outline-none focus:border-[#4F46E5]/50 transition-colors"
                        />
                        <Button
                          type="submit"
                          disabled={sovereignSubmitting || !sovereignEmail}
                          className="min-h-[44px] bg-flux-indigo hover:bg-flux-indigo-light text-white px-4 touch-manipulation"
                        >
                          {sovereignSubmitting ? '...' : 'Join'}
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            <ShareWaveform
              hexacoScores={selectedResult.hexacoScores}
              dassScores={selectedResult.dassScores}
              stabilityScore={typeof selectedResult.stabilityAnalysis?.stabilityScore === 'number' ? selectedResult.stabilityAnalysis.stabilityScore : 0}
              amplitudeLabel={getAmplitudeLabel(selectedResult.stabilityAnalysis?.overallStability || 'Unknown')}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <MarketValueCard />
            </motion.div>
          </div>
        )}
      </div>
      <TrustAnchorFooter />
    </div>
  )
}
