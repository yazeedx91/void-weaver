import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const loadingMessages = [
  'Analyzing neural patterns...',
  'Mapping emotional signatures...',
  'Synthesizing cognitive profile...',
  'Calibrating wellness metrics...',
  'Generating personalized insights...',
];

interface ShaderLoaderProps {
  onComplete: () => void;
}

export function ShaderLoader({ onComplete }: ShaderLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(messageInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-12">
      {/* Shader Orbs */}
      <div className="relative w-48 h-48">
        {/* Core orb */}
        <motion.div
          className="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-glow/40 to-emerald-glow/40 blur-xl shader-orb"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Outer ring 1 */}
        <motion.div
          className="absolute inset-4 rounded-full border border-indigo-glow/30"
          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Outer ring 2 */}
        <motion.div
          className="absolute inset-0 rounded-full border border-emerald-glow/20"
          animate={{ rotate: 360, scale: [1.1, 1, 1.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Center glow */}
        <motion.div
          className="absolute inset-16 rounded-full bg-primary/60 blur-2xl"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/80"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [0, Math.cos(i * 60 * Math.PI / 180) * 80],
              y: [0, Math.sin(i * 60 * Math.PI / 180) * 80],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Loading text */}
      <div className="text-center space-y-4">
        <motion.p
          key={messageIndex}
          className="text-lg font-display text-foreground/80"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {loadingMessages[messageIndex]}
        </motion.p>
        
        {/* Progress bar */}
        <div className="w-64 h-1 rounded-full bg-muted/20 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-glow via-primary to-emerald-glow"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        
        <p className="text-sm text-muted-foreground font-body">
          {progress}% complete
        </p>
      </div>
    </div>
  );
}
