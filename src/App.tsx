import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AssessmentProvider } from "@/contexts/AssessmentContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SanctuaryProvider } from "@/contexts/SanctuaryContext";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { VoidBackground } from "@/components/VoidBackground";
import { LifeLine } from "@/components/LifeLine";
import { TopBar } from "@/components/TopBar";
import PhoenixLanding from "./pages/PhoenixLanding";
import HakimChamber from "./pages/HakimChamber";
import Onboarding from "./pages/Onboarding";
import PersonalityAssessment from "./pages/PersonalityAssessment";
import MentalHealthAssessment from "./pages/MentalHealthAssessment";
import CommunicationAssessment from "./pages/CommunicationAssessment";
import Generating from "./pages/Generating";
import Dashboard from "./pages/Dashboard";
import SovereignessSanctuary from "./pages/SovereignessSanctuary";
import FounderCockpit from "./pages/FounderCockpit";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <SanctuaryProvider>
            <AssessmentProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <VoidBackground>
                  <TopBar />
                  <LifeLine />
                  <Routes>
                    <Route path="/" element={<PhoenixLanding />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/hakim" element={<ProtectedRoute><HakimChamber /></ProtectedRoute>} />
                    <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                    <Route path="/personality" element={<ProtectedRoute><PersonalityAssessment /></ProtectedRoute>} />
                    <Route path="/mental-health" element={<ProtectedRoute><MentalHealthAssessment /></ProtectedRoute>} />
                    <Route path="/communication" element={<ProtectedRoute><CommunicationAssessment /></ProtectedRoute>} />
                    <Route path="/sovereigness" element={<SovereignessSanctuary />} />
                    <Route path="/generating" element={<ProtectedRoute><Generating /></ProtectedRoute>} />
                    <Route path="/founder-ops" element={<FounderCockpit />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </VoidBackground>
              </BrowserRouter>
            </AssessmentProvider>
          </SanctuaryProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
