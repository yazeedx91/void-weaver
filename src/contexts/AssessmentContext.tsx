import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AssessmentStage = 
  | 'welcome' 
  | 'onboarding' 
  | 'personality' 
  | 'mental-health' 
  | 'communication' 
  | 'generating' 
  | 'dashboard';

export type SectionType = 'hexaco' | 'dass' | 'eq';

interface Answer {
  questionId: string;
  value: number;
  label: string;
}

interface AssessmentState {
  stage: AssessmentStage;
  currentSection: SectionType;
  answers: Answer[];
  personalityAnswers: Answer[];
  mentalHealthAnswers: Answer[];
  communicationAnswers: Answer[];
  userName: string;
}

interface AssessmentContextType extends AssessmentState {
  setStage: (stage: AssessmentStage) => void;
  setCurrentSection: (section: SectionType) => void;
  addAnswer: (answer: Answer) => void;
  setUserName: (name: string) => void;
  getProgress: () => number;
  reset: () => void;
}

const initialState: AssessmentState = {
  stage: 'welcome',
  currentSection: 'hexaco',
  answers: [],
  personalityAnswers: [],
  mentalHealthAnswers: [],
  communicationAnswers: [],
  userName: '',
};

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AssessmentState>(initialState);

  const setStage = (stage: AssessmentStage) => {
    setState(prev => ({ ...prev, stage }));
  };

  const setCurrentSection = (section: SectionType) => {
    setState(prev => ({ ...prev, currentSection: section }));
  };

  const addAnswer = (answer: Answer) => {
    setState(prev => {
      const newAnswers = [...prev.answers, answer];
      
      let updatedState = { ...prev, answers: newAnswers };
      
      if (prev.stage === 'personality') {
        updatedState.personalityAnswers = [...prev.personalityAnswers, answer];
      } else if (prev.stage === 'mental-health') {
        updatedState.mentalHealthAnswers = [...prev.mentalHealthAnswers, answer];
      } else if (prev.stage === 'communication') {
        updatedState.communicationAnswers = [...prev.communicationAnswers, answer];
      }
      
      return updatedState;
    });
  };

  const setUserName = (name: string) => {
    setState(prev => ({ ...prev, userName: name }));
  };

  const getProgress = () => {
    const totalQuestions = 15; // 5 per section
    return (state.answers.length / totalQuestions) * 100;
  };

  const reset = () => {
    setState(initialState);
  };

  return (
    <AssessmentContext.Provider
      value={{
        ...state,
        setStage,
        setCurrentSection,
        addAnswer,
        setUserName,
        getProgress,
        reset,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return context;
}
