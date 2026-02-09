import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

type SanctuaryMode = 'void' | 'pearl';

interface SanctuaryContextType {
  mode: SanctuaryMode;
  toggleMode: () => void;
  isPerl: boolean;
}

const SanctuaryContext = createContext<SanctuaryContextType | undefined>(undefined);

export function SanctuaryProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SanctuaryMode>('void');

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'void' ? 'pearl' : 'void');
  }, []);

  const isPerl = mode === 'pearl';

  useEffect(() => {
    const root = document.documentElement;
    if (isPerl) {
      root.classList.add('sanctuary-pearl');
      root.classList.remove('sanctuary-void');
    } else {
      root.classList.add('sanctuary-void');
      root.classList.remove('sanctuary-pearl');
    }
  }, [isPerl]);

  return (
    <SanctuaryContext.Provider value={{ mode, toggleMode, isPerl }}>
      {children}
    </SanctuaryContext.Provider>
  );
}

export function useSanctuary() {
  const context = useContext(SanctuaryContext);
  if (!context) throw new Error('useSanctuary must be used within SanctuaryProvider');
  return context;
}
