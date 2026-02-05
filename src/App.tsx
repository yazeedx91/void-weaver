import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AssessmentProvider } from "@/contexts/AssessmentContext";
import { VoidBackground } from "@/components/VoidBackground";
import { LifeLine } from "@/components/LifeLine";
import Welcome from "./pages/Welcome";
import Onboarding from "./pages/Onboarding";
import PersonalityAssessment from "./pages/PersonalityAssessment";
import MentalHealthAssessment from "./pages/MentalHealthAssessment";
import CommunicationAssessment from "./pages/CommunicationAssessment";
import Generating from "./pages/Generating";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AssessmentProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <VoidBackground>
            <LifeLine />
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/personality" element={<PersonalityAssessment />} />
              <Route path="/mental-health" element={<MentalHealthAssessment />} />
              <Route path="/communication" element={<CommunicationAssessment />} />
              <Route path="/generating" element={<Generating />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </VoidBackground>
        </BrowserRouter>
      </AssessmentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
