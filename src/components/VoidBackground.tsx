import { ReactNode } from 'react';

interface VoidBackgroundProps {
  children: ReactNode;
}

export function VoidBackground({ children }: VoidBackgroundProps) {
  return (
    <div className="void-bg min-h-screen w-full">
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
