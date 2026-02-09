import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from './components/ui/sonner'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineDetector from './components/OfflineDetector'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const AssessmentPage = lazy(() => import('./pages/AssessmentPage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TeamSynthesisPage = lazy(() => import('./pages/TeamSynthesisPage'))
const InvestorStatsPage = lazy(() => import('./pages/InvestorStatsPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const SciencePage = lazy(() => import('./pages/SciencePage'))
const HelpPage = lazy(() => import('./pages/HelpPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-2 border-white/10 rounded-full" />
          <div className="absolute inset-0 border-2 border-t-white rounded-full animate-spin" />
        </div>
        <p className="text-white/60 text-sm tracking-widest uppercase">Loading...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-background">
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Suspense fallback={<LoadingFallback />}><LandingPage /></Suspense>} />
          <Route path="/login" element={<Suspense fallback={<LoadingFallback />}><LoginPage /></Suspense>} />
          <Route path="/assessment" element={<Suspense fallback={<LoadingFallback />}><AssessmentPage /></Suspense>} />
          <Route path="/results" element={<Suspense fallback={<LoadingFallback />}><ResultsPage /></Suspense>} />
          <Route path="/privacy" element={<Suspense fallback={<LoadingFallback />}><PrivacyPage /></Suspense>} />
          <Route path="/teams" element={<Suspense fallback={<LoadingFallback />}><TeamSynthesisPage /></Suspense>} />
          <Route path="/investor-stats" element={<Suspense fallback={<LoadingFallback />}><InvestorStatsPage /></Suspense>} />
          <Route path="/contact" element={<Suspense fallback={<LoadingFallback />}><ContactPage /></Suspense>} />
          <Route path="/science" element={<Suspense fallback={<LoadingFallback />}><SciencePage /></Suspense>} />
          <Route path="/help" element={<Suspense fallback={<LoadingFallback />}><HelpPage /></Suspense>} />
          <Route path="/faq" element={<Suspense fallback={<LoadingFallback />}><HelpPage /></Suspense>} />
          <Route path="*" element={<Suspense fallback={<LoadingFallback />}><NotFoundPage /></Suspense>} />
        </Routes>
      </ErrorBoundary>
      <OfflineDetector />
      <Toaster />
    </div>
  )
}

export default App
