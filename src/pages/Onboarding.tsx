import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AssessmentVessel } from '@/components/AssessmentVessel';
import { useAssessment } from '@/contexts/AssessmentContext';

const onboardingSteps = [
  {
    title: 'How it works',
    description: 'You\'ll answer questions across three domains. Simply click the option that resonates most with you—no right or wrong answers.',
    icon: '✧',
  },
  {
    title: 'Natural Flow',
    description: 'Each selection automatically advances you forward. Trust your instincts and respond authentically.',
    icon: '◈',
  },
  {
    title: 'Your Privacy',
    description: 'Your responses are processed locally and never shared. This is your personal exploration.',
    icon: '◇',
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { setStage, setUserName } = useAssessment();
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      if (name.trim()) {
        setUserName(name);
        setStage('personality');
        navigate('/personality');
      }
    }
  };

  const isNameStep = currentStep === onboardingSteps.length;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AssessmentVessel>
        <AnimatePresence mode="wait">
          {!isNameStep ? (
            <motion.div
              key={currentStep}
              className="text-center space-y-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.6 }}
            >
              <motion.div
                className="text-5xl"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {onboardingSteps[currentStep].icon}
              </motion.div>

              <div className="space-y-3">
                <h2 className="text-2xl font-display font-semibold text-foreground">
                  {onboardingSteps[currentStep].title}
                </h2>
                <p className="text-muted-foreground font-body leading-relaxed">
                  {onboardingSteps[currentStep].description}
                </p>
              </div>

              {/* Step indicators */}
              <div className="flex justify-center gap-2 py-4">
                {onboardingSteps.map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep 
                        ? 'w-8 bg-primary' 
                        : i < currentStep 
                          ? 'w-1.5 bg-primary/50' 
                          : 'w-1.5 bg-muted/30'
                    }`}
                  />
                ))}
              </div>

              <motion.button
                onClick={handleContinue}
                className="w-full py-4 px-8 rounded-xl font-display font-medium text-primary-foreground bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {currentStep < onboardingSteps.length - 1 ? 'Continue' : 'Let\'s Begin'}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="name"
              className="text-center space-y-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="space-y-3">
                <h2 className="text-2xl font-display font-semibold text-foreground">
                  What should we call you?
                </h2>
                <p className="text-muted-foreground font-body">
                  This helps personalize your experience
                </p>
              </div>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full py-4 px-6 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body text-center text-lg"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim()) {
                    setUserName(name);
                    setStage('personality');
                    navigate('/personality');
                  }
                }}
              />

              <motion.button
                onClick={() => {
                  if (name.trim()) {
                    setUserName(name);
                    setStage('personality');
                    navigate('/personality');
                  }
                }}
                disabled={!name.trim()}
                className="w-full py-4 px-8 rounded-xl font-display font-medium text-primary-foreground bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: name.trim() ? 1.02 : 1 }}
                whileTap={{ scale: name.trim() ? 0.98 : 1 }}
              >
                Start Assessment
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </AssessmentVessel>
    </div>
  );
}
