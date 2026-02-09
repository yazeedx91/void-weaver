import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface TeamData {
  id: number
  code: string
  name: string
  description: string | null
  memberCount: number
  assessmentCount: number
  isLeader: boolean
}

interface TeamReport {
  team: { name: string; code: string }
  ready: boolean
  currentMembers?: number
  requiredMembers?: number
  message?: string
  memberCount?: number
  assessmentCount?: number
  teamProfile?: {
    dassAverages: { Depression: number; Anxiety: number; Stress: number }
    hexacoAverages: Record<string, number>
  }
  insights?: {
    dominantTrait: string
    developmentArea: string
    dynamicRange: number
    cohesionScore: number
    stressResilience: number
    emotionalBalance: number
  }
}

export default function TeamSynthesisPage() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [view, setView] = useState<'home' | 'create' | 'report'>('home')
  const [teams, setTeams] = useState<TeamData[]>([])
  const [teamName, setTeamName] = useState('')
  const [teamDesc, setTeamDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdCode, setCreatedCode] = useState('')
  const [report, setReport] = useState<TeamReport | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json()
        throw new Error()
      })
      .then(() => {
        setIsAuthenticated(true)
        loadTeams()
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setChecking(false))
  }, [])

  const loadTeams = async () => {
    try {
      const res = await fetch('/api/teams/my-teams', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setTeams(data.teams)
      }
    } catch {}
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/teams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: teamName, description: teamDesc }),
      })
      const data = await res.json()
      if (res.ok) {
        setCreatedCode(data.team.code)
        toast.success('Team created successfully')
        loadTeams()
      } else {
        toast.error(data.error || 'Failed to create team')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  const loadReport = async (code: string) => {
    setLoadingReport(true)
    setView('report')
    try {
      const res = await fetch(`/api/teams/report/${code}`, { credentials: 'include' })
      const data = await res.json()
      setReport(data)
    } catch {
      toast.error('Failed to load report')
    } finally {
      setLoadingReport(false)
    }
  }

  const traitLabels: Record<string, string> = {
    HonestyHumility: 'Honesty-Humility',
    Emotionality: 'Emotionality',
    Extraversion: 'Extraversion',
    Agreeableness: 'Agreeableness',
    Conscientiousness: 'Conscientiousness',
    OpennessToExperience: 'Openness',
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#4F46E5] rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <h1 className="text-2xl font-light text-[#E2E8F0] mb-4">Team Synthesis</h1>
          <p className="text-sm text-slate-400 mb-8">Sign in to create teams and view team dynamic range reports.</p>
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-white text-[#020617] font-semibold text-sm tracking-wider"
          >
            SIGN IN
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <nav className="border-b border-white/[0.06] px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-sm tracking-[0.2em] text-[#E2E8F0] hover:text-white transition-colors">FLUX</button>
            <span className="text-slate-600">/</span>
            <span className="text-xs tracking-wider text-slate-400">TEAM SYNTHESIS</span>
          </div>
          <button onClick={() => navigate('/results')} className="text-xs text-slate-400 hover:text-[#E2E8F0] transition-colors tracking-wider">DASHBOARD</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-12">
                <h1 className="text-3xl font-light text-[#E2E8F0] mb-3">Team Dynamic Range</h1>
                <p className="text-sm text-slate-400 max-w-lg mx-auto">
                  Understand how your team's cognitive and emotional profiles balance out. Create a team, share the code, and unlock collective insights when 5+ members complete their assessments.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-12">
                <motion.button
                  onClick={() => { setView('create'); setCreatedCode(''); setTeamName(''); setTeamDesc(''); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-8 backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl text-left hover:border-[#4F46E5]/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-[#4F46E5]/20 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <h3 className="text-lg font-medium text-[#E2E8F0] mb-1">Create Team</h3>
                  <p className="text-xs text-slate-400">Generate a unique code for your team members</p>
                </motion.button>

                <motion.div
                  className="p-8 backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <h3 className="text-lg font-medium text-[#E2E8F0] mb-1">Join via Assessment</h3>
                  <p className="text-xs text-slate-400">Enter your team code when taking the assessment to link your results</p>
                </motion.div>
              </div>

              {teams.length > 0 && (
                <div>
                  <h2 className="text-sm tracking-wider text-slate-400 mb-4">YOUR TEAMS</h2>
                  <div className="space-y-3">
                    {teams.map((team) => (
                      <motion.div
                        key={team.id}
                        whileHover={{ scale: 1.01 }}
                        className="p-5 backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-between cursor-pointer hover:border-[#4F46E5]/30 transition-all"
                        onClick={() => loadReport(team.code)}
                      >
                        <div>
                          <h3 className="text-[#E2E8F0] font-medium">{team.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-400 font-mono">{team.code}</span>
                            <span className="text-xs text-slate-500">{team.memberCount} members</span>
                            {team.isLeader && <span className="text-[10px] px-2 py-0.5 bg-[#4F46E5]/20 text-[#4F46E5] rounded-full">LEADER</span>}
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {view === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setView('home')} className="text-xs text-slate-400 hover:text-[#E2E8F0] mb-8 flex items-center gap-1 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
                BACK
              </button>

              {createdCode ? (
                <div className="max-w-md mx-auto text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h2 className="text-xl text-[#E2E8F0] mb-2">Team Created</h2>
                  <p className="text-sm text-slate-400 mb-6">Share this code with your team members</p>
                  <div className="p-4 bg-white/[0.04] border border-white/[0.08] rounded-xl mb-6">
                    <p className="text-2xl font-mono font-bold text-[#4F46E5] tracking-widest">{createdCode}</p>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">Members enter this code when starting their assessment. The Team Dynamic Range report unlocks once 5+ members complete theirs.</p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(createdCode); toast.success('Code copied to clipboard') }}
                    className="px-6 py-2 bg-white/[0.06] border border-white/[0.08] text-sm text-[#E2E8F0] tracking-wider hover:bg-white/[0.1] transition-all"
                  >
                    COPY CODE
                  </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <h2 className="text-xl text-[#E2E8F0] mb-6">Create a Team</h2>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <label className="text-xs tracking-wider text-slate-400 block mb-2">TEAM NAME</label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Engineering Team Alpha"
                        required
                        minLength={2}
                        maxLength={100}
                        className="w-full h-12 px-4 bg-white/[0.04] border border-white/[0.08] text-[#E2E8F0] text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#4F46E5]/50 rounded-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs tracking-wider text-slate-400 block mb-2">DESCRIPTION (OPTIONAL)</label>
                      <textarea
                        value={teamDesc}
                        onChange={(e) => setTeamDesc(e.target.value)}
                        placeholder="Product engineering team — Q1 2026 cohort"
                        maxLength={500}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-[#E2E8F0] text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#4F46E5]/50 rounded-none transition-all resize-none"
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={creating || !teamName.trim()}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full h-12 bg-white text-[#020617] font-semibold text-xs tracking-wider disabled:opacity-40 transition-all"
                    >
                      {creating ? 'CREATING...' : 'GENERATE TEAM CODE'}
                    </motion.button>
                  </form>
                </div>
              )}
            </motion.div>
          )}

          {view === 'report' && (
            <motion.div key="report" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => { setView('home'); setReport(null); }} className="text-xs text-slate-400 hover:text-[#E2E8F0] mb-8 flex items-center gap-1 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
                BACK
              </button>

              {loadingReport ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-2 border-white/10 border-t-[#4F46E5] rounded-full animate-spin" />
                </div>
              ) : report && !report.ready ? (
                <div className="max-w-md mx-auto text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h2 className="text-xl text-[#E2E8F0] mb-2">{report.team.name}</h2>
                  <p className="text-sm text-slate-400 mb-4">{report.message}</p>
                  <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${i < (report.currentMembers || 0) ? 'bg-[#4F46E5] text-white' : 'bg-white/[0.06] text-slate-500'}`}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-4 font-mono">{report.team.code}</p>
                </div>
              ) : report && report.ready ? (
                <div>
                  <div className="text-center mb-10">
                    <h2 className="text-2xl font-light text-[#E2E8F0] mb-1">{report.team.name}</h2>
                    <p className="text-xs text-slate-400 tracking-wider">{report.memberCount} MEMBERS / {report.assessmentCount} ASSESSMENTS</p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 mb-10">
                    <div className="p-5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-center">
                      <p className="text-3xl font-light text-[#4F46E5]">{report.insights?.cohesionScore}%</p>
                      <p className="text-[10px] tracking-wider text-slate-400 mt-1">TEAM COHESION</p>
                    </div>
                    <div className="p-5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-center">
                      <p className="text-3xl font-light text-emerald-400">{report.insights?.stressResilience}%</p>
                      <p className="text-[10px] tracking-wider text-slate-400 mt-1">STRESS RESILIENCE</p>
                    </div>
                    <div className="p-5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-center">
                      <p className="text-3xl font-light text-cyan-400">{report.insights?.emotionalBalance}%</p>
                      <p className="text-[10px] tracking-wider text-slate-400 mt-1">EMOTIONAL BALANCE</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 mb-10">
                    <div className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                      <h3 className="text-xs tracking-wider text-slate-400 mb-4">TEAM PERSONALITY PROFILE</h3>
                      <div className="space-y-3">
                        {report.teamProfile && Object.entries(report.teamProfile.hexacoAverages).map(([key, value]) => (
                          <div key={key}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-300">{traitLabels[key] || key}</span>
                              <span className="text-[#4F46E5] font-mono">{value.toFixed(2)}</span>
                            </div>
                            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(value / 5) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="h-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                      <h3 className="text-xs tracking-wider text-slate-400 mb-4">TEAM WELLBEING METRICS</h3>
                      <div className="space-y-3">
                        {report.teamProfile && Object.entries(report.teamProfile.dassAverages).map(([key, value]) => {
                          const maxScale = key === 'Stress' ? 42 : key === 'Depression' ? 28 : 20;
                          const severity = value / maxScale;
                          const color = severity < 0.3 ? 'from-emerald-500 to-emerald-400' : severity < 0.6 ? 'from-amber-500 to-amber-400' : 'from-red-500 to-red-400';
                          return (
                            <div key={key}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-300">{key}</span>
                                <span className="text-slate-400 font-mono">{value.toFixed(1)}</span>
                              </div>
                              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(severity * 100, 100)}%` }}
                                  transition={{ duration: 0.8, delay: 0.2 }}
                                  className={`h-full bg-gradient-to-r ${color} rounded-full`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/[0.06]">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Dominant Trait</span>
                          <span className="text-[#E2E8F0]">{traitLabels[report.insights?.dominantTrait || ''] || report.insights?.dominantTrait}</span>
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                          <span className="text-slate-400">Growth Area</span>
                          <span className="text-[#E2E8F0]">{traitLabels[report.insights?.developmentArea || ''] || report.insights?.developmentArea}</span>
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                          <span className="text-slate-400">Dynamic Range</span>
                          <span className="text-[#4F46E5] font-mono">{report.insights?.dynamicRange}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
