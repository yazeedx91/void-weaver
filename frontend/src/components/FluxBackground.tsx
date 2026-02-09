import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FluxBackgroundProps {
  children: ReactNode;
}

export function FluxBackground({ children }: FluxBackgroundProps) {
  return (
    <div className="min-h-screen w-full bg-flux-obsidian relative overflow-hidden">
      <div className="absolute inset-0 bg-flux-radial animate-flux-pulse" />
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-flux-indigo/10 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
