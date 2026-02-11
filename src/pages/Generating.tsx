import { useNavigate } from 'react-router-dom';
import { ShaderLoader } from '@/components/ShaderLoader';
import { useAssessment } from '@/contexts/AssessmentContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';

export default function Generating() {
  const navigate = useNavigate();
  const { setStage, personalityAnswers, mentalHealthAnswers, communicationAnswers } = useAssessment();
  const { user } = useAuth();
  const savedRef = useRef(false);

  useEffect(() => {
    if (!user || savedRef.current) return;
    savedRef.current = true;

    const calculateScore = (answers: typeof personalityAnswers, maxPerQ: number) => {
      if (answers.length === 0) return 65;
      const total = answers.reduce((sum, a) => sum + a.value, 0);
      return Math.round((total / (answers.length * maxPerQ)) * 100);
    };

    const personalityScore = calculateScore(personalityAnswers, 5);
    const wellnessScore = 100 - calculateScore(mentalHealthAnswers, 3);
    const eqScore = calculateScore(communicationAnswers, 5);

    supabase.from('assessment_results').insert({
      user_id: user.id,
      personality_answers: personalityAnswers as any,
      mental_health_answers: mentalHealthAnswers as any,
      communication_answers: communicationAnswers as any,
      personality_score: personalityScore,
      wellness_score: wellnessScore,
      eq_score: eqScore,
    }).then(({ error }) => {
      if (error) console.error('Failed to save results:', error);
    });
  }, [user]);

  const handleComplete = () => {
    setStage('dashboard');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ShaderLoader onComplete={handleComplete} />
    </div>
  );
}
