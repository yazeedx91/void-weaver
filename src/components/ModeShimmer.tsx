import { useEffect, useState, useRef } from 'react';
import { useSanctuary } from '@/contexts/SanctuaryContext';

export function ModeShimmer() {
  const { mode } = useSanctuary();
  const [active, setActive] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setActive(true);
    const timer = setTimeout(() => setActive(false), 800);
    return () => clearTimeout(timer);
  }, [mode]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
      {/* Radial shimmer burst */}
      <div className="absolute inset-0 animate-shimmer-burst opacity-0"
        style={{
          background: mode === 'pearl'
            ? 'radial-gradient(ellipse at 50% 40%, hsl(var(--emerald-glow) / 0.25) 0%, hsl(var(--gold-glow) / 0.1) 40%, transparent 70%)'
            : 'radial-gradient(ellipse at 50% 40%, hsl(var(--indigo-glow) / 0.3) 0%, hsl(var(--emerald-glow) / 0.1) 40%, transparent 70%)',
        }}
      />
      {/* Traveling light streak */}
      <div className="absolute inset-0 animate-shimmer-sweep opacity-0"
        style={{
          background: mode === 'pearl'
            ? 'linear-gradient(105deg, transparent 40%, hsl(var(--gold-glow) / 0.15) 48%, hsl(var(--gold-glow) / 0.3) 50%, hsl(var(--gold-glow) / 0.15) 52%, transparent 60%)'
            : 'linear-gradient(105deg, transparent 40%, hsl(var(--indigo-glow) / 0.2) 48%, hsl(var(--indigo-glow) / 0.4) 50%, hsl(var(--indigo-glow) / 0.2) 52%, transparent 60%)',
        }}
      />
      {/* Scattered particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full animate-shimmer-particle"
          style={{
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 0.4}s`,
            background: mode === 'pearl'
              ? 'hsl(var(--gold-glow))'
              : 'hsl(var(--indigo-glow))',
          }}
        />
      ))}
    </div>
  );
}
