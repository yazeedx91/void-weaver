import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AssessmentVesselProps {
  children: ReactNode;
}

export function AssessmentVessel({ children }: AssessmentVesselProps) {
  return (
    <motion.div
      className="glass-card w-full max-w-xl mx-auto p-8 md:p-12"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
