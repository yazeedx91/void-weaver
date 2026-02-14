import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export function QuickExit() {
  const { dir } = useLanguage();

  const handleExit = () => {
    // Replace current history entry for plausible deniability
    window.location.replace('https://www.moe.gov.sa/');
  };

  return (
    <motion.button
      onClick={handleExit}
      className="fixed bottom-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-body uppercase tracking-widest bg-card border border-border/50 text-muted-foreground hover-tactile cursor-pointer"
      style={dir === 'rtl' ? { left: '1.5rem' } : { right: '1.5rem' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.5 }}
      whileHover={{ scale: 1.06, boxShadow: '0 0 24px hsl(150 50% 45% / 0.2)' }}
      whileTap={{ scale: 0.95 }}
      aria-label="Quick Exit"
      title="Quick Exit"
    >
      <Shield className="w-4 h-4 text-emerald-glow" />
    </motion.button>
  );
}
