import { motion } from 'framer-motion';
import { useAssessment } from '@/contexts/AssessmentContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

function ScoreCard({
  title, 
  score, 
  color, 
  description,
  delay 
}: { 
  title: string; 
  score: number; 
  color: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      className="glass-card p-6 space-y-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-medium text-foreground">{title}</h3>
        <span className={`text-2xl font-display font-bold ${color}`}>
          {score}%
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color === 'text-primary' ? 'bg-primary' : color === 'text-crimson-glow' ? 'bg-crimson-glow' : 'bg-teal-glow'}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: delay + 0.3, duration: 1, ease: 'easeOut' }}
        />
      </div>
      
      <p className="text-sm text-muted-foreground font-body">
        {description}
      </p>
    </motion.div>
  );
}

function TraitBadge({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div
      className="px-4 py-2 rounded-full bg-muted/20 border border-border/50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <span className="text-xs text-muted-foreground font-body">{label}: </span>
      <span className="text-sm font-display font-medium text-foreground">{value}</span>
    </motion.div>
  );
}

export default function Dashboard() {
  const { userName, personalityAnswers, mentalHealthAnswers, communicationAnswers, reset } = useAssessment();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState<{ personality: number; wellness: number; eq: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from('assessment_results')
      .select('personality_score, wellness_score, eq_score')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setScores({
            personality: data.personality_score ?? 65,
            wellness: data.wellness_score ?? 65,
            eq: data.eq_score ?? 65,
          });
        }
        setLoading(false);
      });
  }, [user]);

  // Calculate scores from context as fallback
  const calculateScore = (answers: typeof personalityAnswers, maxPerQuestion: number) => {
    if (answers.length === 0) return 65;
    const total = answers.reduce((sum, a) => sum + a.value, 0);
    const max = answers.length * maxPerQuestion;
    return Math.round((total / max) * 100);
  };

  const personalityScore = scores?.personality ?? calculateScore(personalityAnswers, 5);
  const wellnessScore = scores?.wellness ?? (100 - calculateScore(mentalHealthAnswers, 3));
  const eqScore = scores?.eq ?? calculateScore(communicationAnswers, 5);

  const handleRetake = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-indigo-glow/30 via-primary/30 to-emerald-glow/30 flex items-center justify-center"
            animate={{ 
              boxShadow: [
                '0 0 30px hsl(239 84% 67% / 0.2)',
                '0 0 50px hsl(239 84% 67% / 0.4)',
                '0 0 30px hsl(239 84% 67% / 0.2)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="text-2xl">◈</span>
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Your Profile, <span className="text-primary">{userName || 'Explorer'}</span>
          </h1>
          <p className="text-muted-foreground font-body max-w-md mx-auto">
            A comprehensive view of your cognitive and emotional landscape
          </p>
        </motion.div>

        {/* Score Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <ScoreCard
            title="Personality"
            score={personalityScore}
            color="text-primary"
            description="Your openness, agreeableness, and social orientation patterns."
            delay={0.2}
          />
          <ScoreCard
            title="Wellness"
            score={wellnessScore}
            color="text-crimson-glow"
            description="Current emotional equilibrium and stress management capacity."
            delay={0.4}
          />
          <ScoreCard
            title="EQ"
            score={eqScore}
            color="text-teal-glow"
            description="Emotional intelligence and interpersonal awareness levels."
            delay={0.6}
          />
        </div>

        {/* Traits */}
        <motion.div
          className="glass-card p-6 space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <h3 className="font-display font-medium text-foreground text-center">
            Key Traits
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            <TraitBadge label="Social Style" value={personalityScore > 60 ? 'Extroverted' : 'Introverted'} delay={1} />
            <TraitBadge label="Decision" value={personalityScore > 50 ? 'Intuitive' : 'Analytical'} delay={1.1} />
            <TraitBadge label="Stress Response" value={wellnessScore > 70 ? 'Resilient' : 'Sensitive'} delay={1.2} />
            <TraitBadge label="Empathy" value={eqScore > 70 ? 'High' : eqScore > 40 ? 'Moderate' : 'Developing'} delay={1.3} />
            <TraitBadge label="Communication" value={eqScore > 60 ? 'Adaptive' : 'Consistent'} delay={1.4} />
          </div>
        </motion.div>

        {/* Insight */}
        <motion.div
          className="glass-card p-8 text-center space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <h3 className="font-display font-medium text-foreground">
            Your Unique Signature
          </h3>
          <p className="text-muted-foreground font-body leading-relaxed">
            {personalityScore > 60 && eqScore > 60 
              ? "You possess a rare combination of social energy and emotional intelligence. Your natural ability to connect with others while maintaining self-awareness makes you an effective communicator and leader."
              : personalityScore < 50 && wellnessScore > 70
                ? "Your introspective nature combined with strong emotional regulation creates a grounded presence. You excel in deep thinking and maintaining calm in challenging situations."
                : "Your balanced profile suggests adaptability across various social and emotional contexts. You have the potential to develop strengths in multiple areas based on your focus and environment."
            }
          </p>
        </motion.div>

        {/* Action */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.button
            onClick={handleRetake}
            className="px-8 py-3 rounded-xl font-display font-medium text-foreground/80 border border-border/50 hover:bg-muted/20 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Retake Assessment
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
