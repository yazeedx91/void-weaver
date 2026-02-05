import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AssessmentVessel } from '@/components/AssessmentVessel';
import { useAssessment } from '@/contexts/AssessmentContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { setStage } = useAssessment();

  const handleBegin = () => {
    setStage('onboarding');
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AssessmentVessel>
        <motion.div
          className="text-center space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Logo/Icon */}
          <motion.div
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-glow/30 to-emerald-glow/30 flex items-center justify-center"
            animate={{ 
              boxShadow: [
                '0 0 20px hsl(239 84% 67% / 0.3)',
                '0 0 40px hsl(239 84% 67% / 0.5)',
                '0 0 20px hsl(239 84% 67% / 0.3)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent" />
          </motion.div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Neuro<span className="text-primary">Aesthetic</span>
            </h1>
            <p className="text-muted-foreground font-body text-lg">
              Discover your cognitive fingerprint
            </p>
          </div>

          <p className="text-foreground/70 font-body leading-relaxed max-w-md mx-auto">
            Embark on a journey through three dimensions of self-discovery: 
            personality, emotional wellness, and communication style.
          </p>

          <motion.div
            className="pt-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={handleBegin}
              className="w-full py-4 px-8 rounded-xl font-display font-medium text-primary-foreground bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg shadow-primary/20"
            >
              Begin Your Journey
            </button>
          </motion.div>

          <p className="text-xs text-muted-foreground/60 font-body">
            ~5 minutes • Completely confidential
          </p>
        </motion.div>
      </AssessmentVessel>
    </div>
  );
}
