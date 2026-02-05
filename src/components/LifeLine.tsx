import { motion } from 'framer-motion';
import { useAssessment, SectionType } from '@/contexts/AssessmentContext';

const sectionColors: Record<SectionType, string> = {
  hexaco: 'life-line-indigo',
  dass: 'life-line-crimson',
  eq: 'life-line-teal',
};

export function LifeLine() {
  const { getProgress, currentSection, stage } = useAssessment();
  const progress = getProgress();

  if (stage === 'welcome' || stage === 'dashboard') {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-2">
      <div className="h-0.5 w-full rounded-full bg-muted/20">
        <motion.div
          className={`life-line ${sectionColors[currentSection]}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
