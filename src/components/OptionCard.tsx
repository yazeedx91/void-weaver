import { useState, useRef, MouseEvent } from 'react';
import { motion } from 'framer-motion';

interface OptionCardProps {
  label: string;
  value: number;
  onSelect: (value: number, label: string) => void;
  index: number;
}

export function OptionCard({ label, value, onSelect, index }: OptionCardProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      
      setRipples(prev => [...prev, { x, y, id }]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
    }

    setTimeout(() => {
      onSelect(value, label);
    }, 200);
  };

  return (
    <motion.div
      ref={cardRef}
      className="option-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 20,
            height: 20,
            marginLeft: -10,
            marginTop: -10,
          }}
        />
      ))}
      <span className="relative z-10 text-sm font-medium text-foreground/90">
        {label}
      </span>
    </motion.div>
  );
}
