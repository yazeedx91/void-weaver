import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

interface InvestorData {
  platform: string
  generatedAt: string
  growth: {
    totalUsers: number
    totalAssessments: number
    newUsersLast30Days: number
    weeklyAssessments: number
    monthlyAssessments: number
    monthOverMonthGrowth: number
  }
  retention: {
    returningUsers: number
    retentionRate: number
    avgAssessmentsPerUser: number
  }
  viralMetrics: {
    viralCoefficient: number
    organicGrowthRate: number
  }
  dataDepth: {
    totalAnonymizedDataPoints: number
    periodsTracked: number
    assessmentInstruments: number
    questionsPerAssessment: number
    dimensionsMeasured: number
  }
  b2b: {
    totalTeams: number
    businessInquiries: number
  }
  security: {
    encryptionStandard: string
    keyDerivation: string
    dataPolicy: string
  }
}

function MetricCard({ label, value, suffix, accent }: { label: string; value: string | number; suffix?: string; accent?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 bg-white/[0.03] border border-white/[0.06] rounded-xl"
    >
      <p className={`text-2xl sm:text-3xl font-light ${accent || 'text-[#E2E8F0]'}`}>
        {value}{suffix && <span className="text-sm ml-1">{suffix}</span>}
      </p>
      <p className="text-[10px] tracking-wider text-slate-500 mt-1">{label}</p>
    </motion.div>
  )
}

export default function InvestorStatsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<InvestorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const loadStats = async () => {
    try {
      const res = await fetch('/api/investor/stats')
      if (res.ok) {
        const stats = await res.json()
        setData(stats)
        setLastRefresh(new Date())
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/10 border-t-[#4F46E5] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-slate-400 tracking-wider">LOADING METRICS...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <p className="text-slate-400">Failed to load metrics</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <nav className="border-b border-white/[0.06] px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-sm tracking-[0.2em] text-[#E2E8F0] hover:text-white transition-colors">FLUX</button>
            <span className="text-slate-600">/</span>
            <span className="text-xs tracking-wider text-slate-400">INVESTOR METRICS</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-slate-500">
              LIVE / {lastRefresh.toLocaleTimeString()}
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-light text-[#E2E8F0] mb-2">FLUX-DNA</h1>
          <p className="text-xs tracking-wider text-slate-400">REAL-TIME PLATFORM INTELLIGENCE / CONFIDENTIAL</p>
        </motion.div>

        <div className="mb-10">
          <h2 className="text-xs tracking-wider text-slate-500 mb-4">GROWTH METRICS</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <MetricCard label="TOTAL USERS" value={data.growth.totalUsers.toLocaleString()} accent="text-[#4F46E5]" />
            <MetricCard label="TOTAL ASSESSMENTS" value={data.growth.totalAssessments.toLocaleString()} accent="text-[#4F46E5]" />
            <MetricCard label="NEW USERS (30D)" value={data.growth.newUsersLast30Days} />
            <MetricCard label="WEEKLY ASSESSMENTS" value={data.growth.weeklyAssessments} />
            <MetricCard label="MoM GROWTH" value={data.growth.monthOverMonthGrowth} suffix="%" accent={data.growth.monthOverMonthGrowth > 0 ? 'text-emerald-400' : 'text-red-400'} />
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xs tracking-wider text-slate-500 mb-4">RETENTION & VIRALITY</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="RETENTION RATE" value={data.retention.retentionRate} suffix="%" accent="text-cyan-400" />
            <MetricCard label="RETURNING USERS" value={data.retention.returningUsers} />
            <MetricCard label="AVG ASSESSMENTS/USER" value={data.retention.avgAssessmentsPerUser} />
            <MetricCard label="VIRAL COEFFICIENT" value={data.viralMetrics.viralCoefficient} accent={data.viralMetrics.viralCoefficient >= 1 ? 'text-emerald-400' : 'text-amber-400'} />
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xs tracking-wider text-slate-500 mb-4">DATA MOAT</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="ANONYMIZED DATA POINTS" value={data.dataDepth.totalAnonymizedDataPoints.toLocaleString()} accent="text-purple-400" />
            <MetricCard label="PERIODS TRACKED" value={data.dataDepth.periodsTracked} />
            <MetricCard label="DIMENSIONS MEASURED" value={data.dataDepth.dimensionsMeasured} />
            <MetricCard label="QUESTIONS/ASSESSMENT" value={data.dataDepth.questionsPerAssessment} />
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xs tracking-wider text-slate-500 mb-4">B2B TRACTION</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricCard label="ACTIVE TEAMS" value={data.b2b.totalTeams} accent="text-amber-400" />
            <MetricCard label="BUSINESS INQUIRIES" value={data.b2b.businessInquiries} />
            <MetricCard label="INSTRUMENTS" value={`${data.dataDepth.assessmentInstruments}`} suffix="(HEXACO + DASS + TEIQue)" />
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xs tracking-wider text-slate-500 mb-4">SECURITY ARCHITECTURE</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <p className="text-sm text-[#E2E8F0] font-mono">{data.security.encryptionStandard}</p>
              <p className="text-[10px] tracking-wider text-slate-500 mt-1">ENCRYPTION</p>
            </div>
            <div className="p-5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <p className="text-sm text-[#E2E8F0] font-mono">{data.security.keyDerivation}</p>
              <p className="text-[10px] tracking-wider text-slate-500 mt-1">KEY DERIVATION</p>
            </div>
            <div className="p-5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <p className="text-sm text-[#E2E8F0] font-mono">{data.security.dataPolicy}</p>
              <p className="text-[10px] tracking-wider text-slate-500 mt-1">DATA POLICY</p>
            </div>
          </div>
        </div>

        <div className="text-center py-8 border-t border-white/[0.04]">
          <p className="text-[10px] text-slate-600 tracking-wider">FLUX-DNA CONFIDENTIAL / GENERATED {new Date(data.generatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
