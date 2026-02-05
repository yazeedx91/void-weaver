import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AssessmentVessel } from '@/components/AssessmentVessel';
import { OptionCard } from '@/components/OptionCard';
import { useAssessment } from '@/contexts/AssessmentContext';
import { communicationQuestions } from '@/data/questions';

export default function CommunicationAssessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const navigate = useNavigate();
  const { addAnswer, setStage } = useAssessment();

  const questions = communicationQuestions.questions;
  const question = questions[currentQuestion];

  const handleSelect = (value: number, label: string) => {
    addAnswer({
      questionId: question.id,
      value,
      label,
    });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setStage('generating');
      navigate('/generating');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-12">
      <AssessmentVessel>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <motion.span
              className="text-xs font-display uppercase tracking-widest text-teal-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {communicationQuestions.description}
            </motion.span>
            <motion.p
              className="text-sm text-muted-foreground font-body"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Question {currentQuestion + 1} of {questions.length}
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.6 }}
            >
              <h2 className="text-xl md:text-2xl font-display font-medium text-foreground text-center leading-relaxed">
                {question.text}
              </h2>

              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    onSelect={handleSelect}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </AssessmentVessel>
    </div>
  );
}
