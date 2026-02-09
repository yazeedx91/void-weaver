import { motion } from 'framer-motion';
import { Shield, Globe, Moon, Sun } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSanctuary } from '@/contexts/SanctuaryContext';

export function TopBar() {
  const { t, toggleLanguage, lang } = useLanguage();
  const { toggleMode, isPerl } = useSanctuary();

  const handleQuickExit = () => {
    window.location.replace('https://weather.com');
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 md:px-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Encryption Badge */}
      <div className="flex items-center gap-2 text-xs text-emerald-glow/80">
        <Shield className="w-3.5 h-3.5" />
        <span className="hidden sm:inline font-body">
          🔒 {t('hero.encryption')}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body text-muted-foreground hover:text-foreground transition-colors bg-muted/20 hover:bg-muted/40 border border-border/30"
        >
          <Globe className="w-3.5 h-3.5" />
          {t('nav.language')}
        </button>

        {/* Sanctuary Mode Toggle */}
        <button
          onClick={toggleMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body text-muted-foreground hover:text-foreground transition-colors bg-muted/20 hover:bg-muted/40 border border-border/30"
          title={t('nav.sanctuary_mode')}
        >
          {isPerl ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>

        {/* Quick Exit */}
        <a
          href="https://weather.com"
          onClick={(e) => {
            e.preventDefault();
            handleQuickExit();
          }}
          className="px-3 py-1.5 rounded-full text-xs font-body text-muted-foreground/60 hover:text-foreground transition-colors hover:bg-destructive/10"
        >
          {t('nav.exit')}
        </a>
      </div>
    </motion.header>
  );
}
